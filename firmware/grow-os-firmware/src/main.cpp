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
      return;
    }

    Serial.print("MQTT connection failed. State: ");
    Serial.println(mqttClient.state());

    delay(1000);
  }
}

void publishTelemetry() {
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
        pressure > 1100.0
    ) {
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
        pressure
    );

    const bool published = mqttClient.publish(MQTT_TOPIC, payload);

    if (published) {
        Serial.print("Telemetry published: ");
        Serial.println(payload);
        return;
    }

    Serial.println("Telemetry publish failed");
}

void setup()
{
  Serial.begin(115200);

  if (!bme.begin(0x76)) {
    Serial.println("BME280 not found!");

    while (true)
    {
      delay(1000);
    }
  }

  Serial.println("BME280 connected!");
  
  connectWiFi();

  mqttClient.setServer(MQTT_HOST, MQTT_PORT);

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