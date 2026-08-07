#include <ArduinoJson.h>
#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

#include "config.h"
#include "secrets.h"

#include <Wire.h>
#include <Adafruit_BME280.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
Adafruit_BME280 bme;

unsigned long lastTelemetrySentAt = 0;
// ESP32が制御命令を受け取るTopic
char controlTopic[100];
char stateTopic[100];
const int LED_PIN = 2;

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

  if (strcmp(target, "led") != 0)
  {
    return;
  }

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

void publishTelemetry()
{
  const float temperature = bme.readTemperature();
  const float humidity = bme.readHumidity();
  const float pressure = bme.readPressure() / 100.0F;

  if (
      isnan(temperature) ||
      isnan(humidity) ||
      isnan(pressure) ||
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

  char payload[160];

  snprintf(
      payload,
      sizeof(payload),
      "{\"deviceKey\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f,\"pressure\":%.1f}",
      DEVICE_KEY,
      temperature,
      humidity,
      pressure);

  const bool published = mqttClient.publish(MQTT_TOPIC, payload);

  if (published)
  {
    Serial.print("Telemetry published: ");
    Serial.println(payload);
    return;
  }

  Serial.println("Telemetry publish failed");
}

void setup()
{
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

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