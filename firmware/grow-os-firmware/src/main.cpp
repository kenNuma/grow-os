#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

#include "config.h"
#include "secrets.h"

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

unsigned long lastTelemetrySentAt = 0;

void connectWiFi() {
    Serial.println();
    Serial.println("Connecting to Wi-Fi...");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("Wi-Fi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

void connectMqtt() {
    while (!mqttClient.connected()) {
        Serial.println("Connecting to MQTT...");

        if (mqttClient.connect(DEVICE_KEY)) {
            Serial.println("MQTT Connected!");
            return;
        }

        Serial.print("MQTT connection failed. State: ");
        Serial.println(mqttClient.state());

        delay(1000);
    }
}

void publishTelemetry() {
    const float temperature = 25.4;
    const float humidity = 61.8;

    char payload[160];

    snprintf(
        payload,
        sizeof(payload),
        "{\"deviceKey\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f}",
        DEVICE_KEY,
        temperature,
        humidity
    );

    const bool published = mqttClient.publish(MQTT_TOPIC, payload);

    if (published) {
        Serial.print("Telemetry published: ");
        Serial.println(payload);
        return;
    }

    Serial.println("Telemetry publish failed");
}

void setup() {
    Serial.begin(115200);

    connectWiFi();

    mqttClient.setServer(MQTT_HOST, MQTT_PORT);

    connectMqtt();
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
    }

    if (!mqttClient.connected()) {
        connectMqtt();
    }

    mqttClient.loop();

    const unsigned long currentTime = millis();

    if (currentTime - lastTelemetrySentAt >= TELEMETRY_INTERVAL_MS) {
        lastTelemetrySentAt = currentTime;
        publishTelemetry();
    }
}