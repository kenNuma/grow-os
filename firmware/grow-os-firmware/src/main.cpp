#include <ArduinoJson.h>
#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

#include "config.h"
#include "secrets.h"

#include <Wire.h>
#include <Adafruit_BME280.h>

#include <OneWire.h>
#include <DallasTemperature.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
Adafruit_BME280 bme;

unsigned long lastTelemetrySentAt = 0;
// ESP32が制御命令を受け取るTopic
char controlTopic[100];
char stateTopic[100];
const int LED_PIN = 2;
const int FAN_PIN = 25;
const int WATER_TEMP_PIN = 27;

OneWire oneWire(WATER_TEMP_PIN);
DallasTemperature waterTemperatureSensor(&oneWire);
DeviceAddress waterTemperatureAddress = {
    0x28,
    0x22,
    0x33,
    0x5B,
    0x00,
    0x00,
    0x00,
    0x40
  };

void publishLedState(bool isOn)
{
  if (!mqttClient.connected())
  {
    Serial.println("LED state publish failed: MQTT is not connected");
    return;
  }

  char payload[80];

  snprintf(
      payload,
      sizeof(payload),
      "{\"target\":\"led\",\"state\":\"%s\"}",
      isOn ? "on" : "off");

  const bool published = mqttClient.publish(
      stateTopic,
      payload,
      true);

  if (!published)
  {
    Serial.println("LED state publish failed");
    return;
  }

  Serial.print("LED state published: ");
  Serial.println(payload);
}

void publishFanState(bool isOn)
{
  if (!mqttClient.connected())
  {
    Serial.println("Fan state publish failed: MQTT is not connected");
    return;
  }

  char payload[80];

  snprintf(
      payload,
      sizeof(payload),
      "{\"target\":\"fan\",\"state\":\"%s\"}",
      isOn ? "on" : "off");

  const bool published = mqttClient.publish(
      stateTopic,
      payload,
      true);

  if (!published)
  {
    Serial.println("Fan state publish failed");
    return;
  }

  Serial.print("Fan state published: ");
  Serial.println(payload);
}

void handleMqttMessage(char *topic, byte *payload, unsigned int length)
{
  Serial.println();
  Serial.println("MQTT message received!");

  Serial.print("Topic: ");
  Serial.println(topic);

  Serial.print("Payload: ");

  for (unsigned int i = 0; i < length; i++)
  {
    Serial.print(static_cast<char>(payload[i]));
  }

  Serial.println();

  JsonDocument document;

  DeserializationError error =
      deserializeJson(document, payload, length);

  if (error)
  {
    Serial.println("Failed to parse JSON");
    return;
  }

  const char *target = document["target"];
  const char *action = document["action"];

  if (strcmp(target, "led") == 0)
  {
    if (strcmp(action, "on") == 0)
    {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED turned ON");
      publishLedState(true);
    }
    else if (strcmp(action, "off") == 0)
    {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED turned OFF");
      publishLedState(false);
    }

    return;
  }

  if (strcmp(target, "fan") == 0)
  {
    if (strcmp(action, "on") == 0)
    {
      Serial.println("Fan turned ON");

      // Fan ONを疑似的に2回点滅で表現
      for (int i = 0; i < 2; i++)
      {
        digitalWrite(LED_PIN, HIGH);
        delay(200);

        digitalWrite(LED_PIN, LOW);
        delay(200);
      }

      publishFanState(true);
    }
    else if (strcmp(action, "off") == 0)
    {
      Serial.println("Fan turned OFF");

      // Fan OFFを疑似的に1回点滅で表現
      digitalWrite(LED_PIN, HIGH);
      delay(200);

      digitalWrite(LED_PIN, LOW);

      publishFanState(false);
    }

    return;
  }
}

void connectWiFi()
{
  Serial.println();
  Serial.println("Connecting to Wi-Fi...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void connectMqtt()
{
  while (!mqttClient.connected())
  {
    Serial.println("Connecting to MQTT...");

    if (mqttClient.connect(DEVICE_KEY))
    {
      Serial.println("MQTT Connected!");

      const bool subscribed = mqttClient.subscribe(controlTopic);

      if (subscribed)
      {
        Serial.print("Subscribed to: ");
        Serial.println(controlTopic);
      }
      else
      {
        Serial.println("MQTT subscribe failed");
      }

      return;
    }

    Serial.print("MQTT connection failed. State: ");
    Serial.println(mqttClient.state());

    delay(1000);
  }
}

float readWaterTemperatureDirect()
{
  byte scratchpad[9];

  if (!oneWire.reset())
  {
    Serial.println("DS18B20: No presence before conversion");
    return NAN;
  }

  oneWire.select(waterTemperatureAddress);
  oneWire.write(0x44, 1);

  // 12bit変換待ち
  delay(800);

  if (!oneWire.reset())
  {
    Serial.println("DS18B20: No presence before reading");
    return NAN;
  }

  oneWire.select(waterTemperatureAddress);
  oneWire.write(0xBE);

  for (int i = 0; i < 9; i++)
  {
    scratchpad[i] = oneWire.read();
  }

  const byte calculatedCrc =
      OneWire::crc8(scratchpad, 8);

  if (calculatedCrc != scratchpad[8])
  {
    Serial.println("DS18B20: Scratchpad CRC failed");
    return NAN;
  }

  const int16_t rawTemperature =
      (scratchpad[1] << 8) | scratchpad[0];

  return static_cast<float>(rawTemperature) / 16.0F;
}


void publishTelemetry()
{
  const float temperature = bme.readTemperature();
  const float humidity = bme.readHumidity();
  const float pressure = bme.readPressure() / 100.0F;
  const float waterTemperature = readWaterTemperatureDirect();

  if (
      isnan(temperature) ||
      isnan(humidity) ||
      isnan(pressure) ||
      isnan(waterTemperature) ||
      temperature < -40.0 ||
      temperature > 85.0 ||
      humidity < 0.0 ||
      humidity > 100.0 ||
      pressure < 300.0 ||
      pressure > 1100.0)
  {
    Serial.println("BME280 read failed. Telemetry was not published.");
    return;
  }

  char payload[200];

  snprintf(
      payload,
      sizeof(payload),
      "{\"deviceKey\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f,\"pressure\":%.1f,\"waterTemperature\":%.1f}",
      DEVICE_KEY,
      temperature,
      humidity,
      pressure,
      waterTemperature
    );

  const bool published = mqttClient.publish(MQTT_TOPIC, payload);

  if (published)
  {
    Serial.print("Telemetry published: ");
    Serial.println(payload);
    return;
  }

  Serial.println("Telemetry publish failed");
}

void scanOneWire()
{
  byte address[8];

  Serial.println();
  Serial.println("Scanning OneWire bus...");

  oneWire.reset_search();

  if (!oneWire.search(address))
  {
    Serial.println("No OneWire device found");
    oneWire.reset_search();
    return;
  }

  Serial.print("ROM address: ");

  for (int i = 0; i < 8; i++)
  {
    if (address[i] < 16)
    {
      Serial.print("0");
    }

    Serial.print(address[i], HEX);

    if (i < 7)
    {
      Serial.print(":");
    }
  }

  Serial.println();

  Serial.print("Family code: 0x");

  if (address[0] < 16)
  {
    Serial.print("0");
  }

  Serial.println(address[0], HEX);

  const byte calculatedCrc = OneWire::crc8(address, 7);

  Serial.print("ROM CRC: 0x");
  Serial.println(address[7], HEX);

  Serial.print("Calculated CRC: 0x");
  Serial.println(calculatedCrc, HEX);

  if (calculatedCrc == address[7])
  {
    Serial.println("CRC: OK");
  }
  else
  {
    Serial.println("CRC: FAILED");
  }

  oneWire.reset_search();

  Serial.println("OneWire scan finished");
  Serial.println();
}

void debugWaterTemperature()
{
  byte scratchpad[9];

  // 温度変換開始
  oneWire.reset();
  oneWire.select(waterTemperatureAddress);
  oneWire.write(0x44, 1);

  // 12bit変換完了待ち
  delay(800);

  // Scratchpad読み出し
  if (!oneWire.reset())
  {
    Serial.println("DS18B20 DEBUG: No presence pulse");
    return;
  }

  oneWire.select(waterTemperatureAddress);
  oneWire.write(0xBE);

  for (int i = 0; i < 9; i++)
  {
    scratchpad[i] = oneWire.read();
  }

  const byte calculatedCrc =
      OneWire::crc8(scratchpad, 8);

  if (calculatedCrc != scratchpad[8])
  {
    Serial.print("DS18B20 DEBUG: Scratchpad CRC FAILED | received=");
    Serial.print(scratchpad[8], HEX);

    Serial.print(" calculated=");
    Serial.println(calculatedCrc, HEX);

    return;
  }

  Serial.println("DS18B20 DEBUG: Scratchpad CRC OK");
}


void setup()
{
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);

  waterTemperatureSensor.begin();
  waterTemperatureSensor.setWaitForConversion(true);
  waterTemperatureSensor.setResolution(waterTemperatureAddress, 12);

  if (waterTemperatureSensor.isConnected(waterTemperatureAddress))
  {
    Serial.println("DS18B20 address connection: OK");
  }
  else
  {
    Serial.println("DS18B20 address connection: FAILED");
  }
  scanOneWire();

  Serial.print("DS18B20 sensors found: ");
  Serial.println(waterTemperatureSensor.getDeviceCount());

  digitalWrite(LED_PIN, LOW);
  digitalWrite(FAN_PIN, LOW);

  if (!bme.begin(0x76))
  {
    Serial.println("BME280 not found!");

    while (true)
    {
      delay(1000);
    }
  }

  Serial.println("BME280 connected!");

  connectWiFi();

  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(handleMqttMessage);

  snprintf(
      controlTopic,
      sizeof(controlTopic),
      "growos/devices/%s/control",
      DEVICE_KEY);

  Serial.print("Control topic: ");
  Serial.println(controlTopic);

  snprintf(
      stateTopic,
      sizeof(stateTopic),
      "growos/devices/%s/state",
      DEVICE_KEY);

  Serial.print("State topic: ");
  Serial.println(stateTopic);

  connectMqtt();
}

void loop()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    connectWiFi();
  }

  if (!mqttClient.connected())
  {
    connectMqtt();
  }

  mqttClient.loop();

  const unsigned long currentTime = millis();

  if (currentTime - lastTelemetrySentAt >= TELEMETRY_INTERVAL_MS)
  {
    lastTelemetrySentAt = currentTime;
    publishTelemetry();
  }

}