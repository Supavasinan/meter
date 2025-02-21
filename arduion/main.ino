#include <PZEM004Tv30.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi and MQTT Configuration
#define WIFI_SSID "STEAM4INNOVATOR-4"
#define WIFI_PASSWORD "6628079555"
#define MQTT_BROKER "192.168.244.155"
#define MQTT_USERNAME "sensor-sender"
#define MQTT_PASSWORD "qwertyuiop"
#define MQTT_TOPIC "topic/sensor"

// PZEM Configuration
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17
#define PZEM_SERIAL Serial2

// Objects
PZEM004Tv30 pzem(PZEM_SERIAL, PZEM_RX_PIN, PZEM_TX_PIN);
WiFiClient espClient;
PubSubClient mqtt(espClient);

void setup_wifi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void reconnect_mqtt() {
  while (!mqtt.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "PZEMClient-";
    clientId += String(random(0xffff), HEX);

    if (mqtt.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void send_mqtt_data(float voltage, float current, float power, float energy, float pf) {
  StaticJsonDocument<200> doc;
  doc["voltage"] = voltage;
  doc["current"] = current;
  doc["power"] = power;
  doc["energy"] = energy;
  doc["pf"] = pf;

  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);

  if (!mqtt.publish(MQTT_TOPIC, jsonBuffer)) {
    Serial.println("MQTT publish failed");
  }
}

void read_pzem() {
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power = pzem.power();
  float energy = pzem.energy();
  float frequency = pzem.frequency();
  float pf = pzem.pf();

  if (isnan(voltage)) {
    Serial.println("Error reading voltage");
  } else if (isnan(current)) {
    Serial.println("Error reading current");
  } else if (isnan(power)) {
    Serial.println("Error reading power");
  } else if (isnan(energy)) {
    Serial.println("Error reading energy");
  } else if (isnan(pf)) {
    Serial.println("Error reading power factor");
  } else {
    Serial.print("Voltage: ");
    Serial.print(voltage);
    Serial.println(" V");
    Serial.print("Current: ");
    Serial.print(current);
    Serial.println(" A");
    Serial.print("Power: ");
    Serial.print(power);
    Serial.println(" W");
    Serial.print("Energy: ");
    Serial.print(energy, 3);
    Serial.println(" kWh");
    Serial.print("PF: ");
    Serial.println(pf);

    send_mqtt_data(voltage, current, power, energy, pf);
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  mqtt.setServer(MQTT_BROKER, 1883);
}

void loop() {
  if (!mqtt.connected()) {
    reconnect_mqtt();
  }
  mqtt.loop();

  read_pzem();
  delay(2000);
}