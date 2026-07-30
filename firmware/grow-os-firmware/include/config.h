#pragma once

#include <Arduino.h>

constexpr char DEVICE_KEY[] = "ESP32-001";

constexpr char MQTT_HOST[] = "192.168.11.2";
constexpr uint16_t MQTT_PORT = 1883;
constexpr char MQTT_TOPIC[] = "growos/telemetry";

constexpr unsigned long TELEMETRY_INTERVAL_MS = 5000;