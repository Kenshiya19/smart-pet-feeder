#include <WiFi.h>
#include <WiFiManager.h>
#define BLYNK_TEMPLATE_ID "TMPL3wVf_0vY0"
#define BLYNK_TEMPLATE_NAME "Smart Pet Feeder"
#define BLYNK_AUTH_TOKEN "MSROuZkWlYDTZC72T2PcAxfJdWkZC10H"
#include <BlynkSimpleEsp32.h>
#include <WebServer.h>
#include <ESP32Servo.h>
#include "HX711.h"

// =====================================================
// WIFI
// =====================================================
const char* ssid = "Airtel_FSK 5G";
const char* password = "Kenilan#008";

// =====================================================
// PIN CONNECTIONS
// =====================================================

// HX711
#define HX711_DOUT 19
#define HX711_SCK  18

// Servo
#define SERVO_PIN 13

// LED
#define LED_PIN 2

// IR Sensor
#define IR_PIN 27

// Buzzer
#define BUZZER_PIN 15

// =====================================================
// SERVO ANGLES
// =====================================================
#define SERVO_CLOSED 0
#define SERVO_OPEN   90

// =====================================================
// OBJECTS
// =====================================================
HX711 scale;
Servo feederServo;
WebServer server(80);

// =====================================================
// SETTINGS
// =====================================================

float calibration_factor = 750.0;

// Default feeding amount
float targetWeight = 30.0;

// Food amount considered as remaining in bowl
float BOWL_FOOD_LIMIT = 5.0;

// =====================================================
// VARIABLES
// =====================================================
bool feedingInProgress = false;
bool automaticMode = true;
bool chimeOnDispense = true;

float bowlWeight = 0.0;

unsigned long feedingCount = 0;

String lastFeedingTime = "No feeding yet";

// =====================================================
// READ STABLE BOWL WEIGHT
// =====================================================
float readBowlWeight(int samples = 10) {

  if (!scale.is_ready()) {
    return bowlWeight;
  }

  float weight = scale.get_units(samples);

  // Small negative values are treated as zero
  if (weight < 0) {
    weight = 0;
  }

  return weight;
}

// =====================================================
// SEND STATUS TO WEB APP
// =====================================================
void sendStatus() {

  float measuredWeight = readBowlWeight(10);

  bowlWeight = measuredWeight;

  bool petDetected = (digitalRead(IR_PIN) == LOW);

  String json = "{";

  json += "\"connected\":true,";

  json += "\"ip\":\"";
  json += WiFi.localIP().toString();
  json += "\",";

  json += "\"wifiName\":\"";
  json += WiFi.SSID();
  json += "\",";

  json += "\"bowlWeight\":";
  json += String(bowlWeight, 1);
  json += ",";

  json += "\"petPresent\":";
  json += petDetected ? "true" : "false";
  json += ",";

  json += "\"feedingInProgress\":";
  json += feedingInProgress ? "true" : "false";
  json += ",";

  json += "\"status\":\"";
  json += feedingInProgress ? "DISPENSING FOOD" : "SYSTEM READY";
  json += "\",";

  json += "\"feedingCount\":";
  json += String(feedingCount);
  json += ",";

  json += "\"lastFeedingTime\":\"";
  json += lastFeedingTime;
  json += "\"";

  json += "}";

  server.send(200, "application/json", json);
}

// =====================================================
// HOME PAGE
// =====================================================
void handleRoot() {

  server.send(
    200,
    "text/plain",
    "Smart Pet Feeder ESP32 is working"
  );
}

// =====================================================
// DISPENSE FOOD
// =====================================================
bool dispenseFood(float target) {

  // ---------------------------------------------------
  // MEASURE BOWL BEFORE FEEDING
  // ---------------------------------------------------
  float startWeight = readBowlWeight(15);

  unsigned long startTime = millis();

  Serial.println();
  Serial.println("================================");
  Serial.println("       DISPENSING FOOD");
  Serial.println("================================");

  Serial.print("Starting bowl weight: ");
  Serial.print(startWeight, 1);
  Serial.println(" g");

  Serial.print("Target food: ");
  Serial.print(target, 1);
  Serial.println(" g");

  // ---------------------------------------------------
  // TURN ON LED
  // ---------------------------------------------------
  digitalWrite(LED_PIN, HIGH);
// ---------------------------------------------------
// TURN ON BUZZER
// ---------------------------------------------------
if (chimeOnDispense) {
  digitalWrite(BUZZER_PIN, HIGH);
}

  // ---------------------------------------------------
  // OPEN SERVO
  // ---------------------------------------------------
  feederServo.write(SERVO_OPEN);

  Serial.println("Servo: OPEN (90 degrees)");
  Serial.println("LED: ON");
  Serial.println("Buzzer: ON");

  // Used to prevent one noisy reading from
  // immediately closing the servo
  int targetReachedCount = 0;

  // ---------------------------------------------------
  // FEEDING LOOP
  // ---------------------------------------------------
  while (true) {

    // Keep web server responsive
    server.handleClient();

    // Read current bowl weight using averaging
    float currentWeight = readBowlWeight(8);

    // Calculate newly added food
    float addedFood = currentWeight - startWeight;

    // Prevent negative values
    if (addedFood < 0) {
      addedFood = 0;
    }

    bowlWeight = currentWeight;

    // -------------------------------------------------
    // SERIAL MONITOR
    // -------------------------------------------------
    Serial.print("Current bowl weight: ");
    Serial.print(currentWeight, 1);

    Serial.print(" g | Food dispensed: ");
    Serial.print(addedFood, 1);

    Serial.println(" g");

    // -------------------------------------------------
    // TARGET CHECK
    // -------------------------------------------------
    if (addedFood >= target) {

      targetReachedCount++;

      Serial.print("Target reached reading: ");
      Serial.println(targetReachedCount);

      // Require 2 consecutive readings
      // to reduce false triggering from noise
      if (targetReachedCount >= 2) {

        Serial.println();
        Serial.println("TARGET WEIGHT REACHED!");

        // Close servo
        feederServo.write(SERVO_CLOSED);

        // Turn OFF LED
        digitalWrite(LED_PIN, LOW);

        // Turn OFF buzzer
        digitalWrite(BUZZER_PIN, LOW);

        Serial.println("Servo: CLOSED (0 degrees)");
        Serial.println("LED: OFF");
        Serial.println("Buzzer: OFF");

        delay(300);

        return true;
      }

    } else {

      // Reset if weight drops below target
      targetReachedCount = 0;
    }

    // -------------------------------------------------
    // SAFETY TIMEOUT
    // -------------------------------------------------
    if (millis() - startTime > 30000) {

      Serial.println();
      Serial.println("FEEDING TIMEOUT!");

      // Close servo
      feederServo.write(SERVO_CLOSED);

      // Turn OFF LED
      digitalWrite(LED_PIN, LOW);

      // Turn OFF buzzer
      digitalWrite(BUZZER_PIN, LOW);

      Serial.println("Servo: CLOSED");
      Serial.println("LED: OFF");
      Serial.println("Buzzer: OFF");

      return false;
    }

    delay(300);
  }
}

// =====================================================
// FEED COMMAND
// =====================================================
void handleFeed() {

  // ---------------------------------------------------
  // GET TARGET FROM WEB APP
  // ---------------------------------------------------
  if (server.hasArg("target")) {

    targetWeight = server.arg("target").toFloat();
  }

  // ---------------------------------------------------
  // VALIDATE TARGET
  // ---------------------------------------------------
  if (targetWeight <= 0 || targetWeight > 100) {

    server.send(
      400,
      "application/json",
      "{\"success\":false,\"reason\":\"invalid_target\"}"
    );

    return;
  }

  // ---------------------------------------------------
  // PREVENT DOUBLE FEEDING
  // ---------------------------------------------------
  if (feedingInProgress) {

    server.send(
      409,
      "application/json",
      "{\"success\":false,\"reason\":\"feeding_in_progress\"}"
    );

    return;
  }

  // ---------------------------------------------------
  // CHECK CURRENT BOWL WEIGHT
  // ---------------------------------------------------
  float currentBowlWeight = readBowlWeight(15);

  bowlWeight = currentBowlWeight;

  // ---------------------------------------------------
  // CHECK PET
  // ---------------------------------------------------
  bool petDetected = (digitalRead(IR_PIN) == LOW);

  Serial.println();
  Serial.println("================================");
  Serial.println("       BOWL CHECK");
  Serial.println("================================");

  Serial.print("Current bowl weight: ");
  Serial.print(bowlWeight, 1);
  Serial.println(" g");

  Serial.print("Pet detected: ");
  Serial.println(petDetected ? "YES" : "NO");

  // ---------------------------------------------------
  // FOOD ALREADY IN BOWL
  // ---------------------------------------------------
if (bowlWeight >= 5.0) {
    Serial.println();
    Serial.println("================================");
    Serial.println("       FEEDING CANCELLED");
    Serial.println("================================");

    Serial.print("Food remaining in bowl: ");
    Serial.print(bowlWeight, 1);
    Serial.println(" g");

    Serial.print("Pet detected: ");
    Serial.println(petDetected ? "YES" : "NO");

    String json = "{";

    json += "\"success\":false,";
    json += "\"reason\":\"food_remaining\",";
    json += "\"bowlWeight\":";
    json += String(bowlWeight, 1);
    json += ",";

    json += "\"petPresent\":";
    json += petDetected ? "true" : "false";

    json += "}";

    server.send(
      409,
      "application/json",
      json
    );

    return;
  }

  // ---------------------------------------------------
  // START FEEDING
  // ---------------------------------------------------
  feedingInProgress = true;

  Serial.println();
  Serial.println("================================");
  Serial.println("       FEEDING STARTED");
  Serial.println("================================");

  Serial.print("Target: ");
  Serial.print(targetWeight, 1);
  Serial.println(" g");

  // ---------------------------------------------------
  // DISPENSE FOOD
  // ---------------------------------------------------
  bool feedingSuccessful =
    dispenseFood(targetWeight);

  // Feeding finished
  feedingInProgress = false;

  // ---------------------------------------------------
  // SUCCESS
  // ---------------------------------------------------
  if (feedingSuccessful) {

    feedingCount++;

    lastFeedingTime =
      String(millis() / 1000) +
      " s since boot";

    Serial.println();
    Serial.println("================================");
    Serial.println("     FEEDING COMPLETED");
    Serial.println("================================");

    String json = "{";

    json += "\"success\":true,";
    json += "\"message\":\"Feeding completed\",";
    json += "\"bowlWeight\":";
    json += String(bowlWeight, 1);

    json += "}";

    server.send(
      200,
      "application/json",
      json
    );
  }

  // ---------------------------------------------------
  // FAILURE / TIMEOUT
  // ---------------------------------------------------
  else {

    Serial.println();
    Serial.println("================================");
    Serial.println("      FEEDING TIMEOUT");
    Serial.println("================================");

    server.send(
      500,
      "application/json",
      "{\"success\":false,\"reason\":\"feeding_timeout\"}"
    );
  }
}
BLYNK_WRITE(V0) {
  int value = param.asInt();

  if (value == 1) {

    Serial.println();
    Serial.println("================================");
    Serial.println("     BLYNK FEED NOW");
    Serial.println("================================");

    if (feedingInProgress) {
      Serial.println("Feeding already in progress");
      return;
    }

    float currentBowlWeight = readBowlWeight(15);
    bowlWeight = currentBowlWeight;

    Serial.print("Bowl weight: ");
    Serial.print(bowlWeight, 1);
    Serial.println(" g");

    // Do not feed if food is already in bowl
    if (bowlWeight >= BOWL_FOOD_LIMIT) {
      Serial.println("Food remains in bowl - feeding cancelled");
      return;
    }

    feedingInProgress = true;

    bool feedingSuccessful = dispenseFood(targetWeight);

    feedingInProgress = false;

    if (feedingSuccessful) {
      feedingCount++;
      lastFeedingTime =
        String(millis() / 1000) + " s since boot";

      Serial.println("Blynk feeding completed");
    } else {
      Serial.println("Blynk feeding failed");
    }
  }
}
// =====================================================
// SETUP
// =====================================================
void setup() {

  // ---------------------------------------------------
  // SERIAL
  // ---------------------------------------------------
  Serial.begin(115200);
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, password);

  delay(1000);

  Serial.println();
  Serial.println("================================");
  Serial.println("   SMART PET FEEDER ESP32");
  Serial.println("================================");

  // ---------------------------------------------------
  // PIN MODES
  // ---------------------------------------------------
  pinMode(LED_PIN, OUTPUT);

  pinMode(BUZZER_PIN, OUTPUT);

  pinMode(IR_PIN, INPUT);

  // Initially OFF
  digitalWrite(LED_PIN, LOW);

  digitalWrite(BUZZER_PIN, LOW);

  // ---------------------------------------------------
  // HX711
  // ---------------------------------------------------
  scale.begin(
    HX711_DOUT,
    HX711_SCK
  );

  scale.set_scale(
    calibration_factor
  );

  scale.tare();

  Serial.println("HX711 ready");

  // ---------------------------------------------------
  // SERVO
  // ---------------------------------------------------
  feederServo.setPeriodHertz(50);

  feederServo.attach(
    SERVO_PIN,
    500,
    2400
  );

  // Start closed
  feederServo.write(
    SERVO_CLOSED
  );

  Serial.println("Servo ready");

  // ---------------------------------------------------
  // WIFI
  // ---------------------------------------------------
  WiFi.mode(WIFI_STA);
  WiFi.begin(
    ssid,
    password
  );

  Serial.print("Connecting to Wi-Fi");

  while (
    WiFi.status() != WL_CONNECTED
  ) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();

  Serial.println("Wi-Fi connected!");

  Serial.print("ESP32 IP Address: ");

  Serial.println(
    WiFi.localIP()
  );

  // ---------------------------------------------------
  // WEB SERVER ROUTES
  // ---------------------------------------------------

  // Home
  server.on(
    "/",
    HTTP_GET,
    handleRoot
  );

  // Status
  server.on(
    "/status",
    HTTP_GET,
    sendStatus
  );

  // Feed
  server.on(
    "/feed",
    HTTP_GET,
    handleFeed
  );
  server.on("/settings", HTTP_GET, []() {
  if (server.hasArg("chimeOnDispense")) {
    chimeOnDispense = server.arg("chimeOnDispense") == "true";

    String json = "{";
    json += "\"success\":true,";
    json += "\"chimeOnDispense\":";
    json += chimeOnDispense ? "true" : "false";
    json += "}";

    server.send(200, "application/json", json);
    return;
  }

  server.send(400, "application/json",
              "{\"success\":false,\"message\":\"Missing chimeOnDispense\"}");
});

  // Allow web app requests
  server.enableCORS(true);

  // Start server
  server.begin();

  Serial.println("Web server started");

  Serial.println();
  Serial.println("================================");
  Serial.println("       SYSTEM READY");
  Serial.println("================================");
}

// =====================================================
// LOOP
// =====================================================
void loop() {
  Blynk.run();

  // Handle web requests
  server.handleClient();

  // ---------------------------------------------------
  // READ BOWL WEIGHT
  // ---------------------------------------------------
  if (scale.is_ready()) {

    float measuredWeight = readBowlWeight(5);

    bowlWeight = measuredWeight;

    Serial.print("Bowl weight: ");
    Serial.print(bowlWeight, 1);
    Serial.println(" g");
  }

  delay(200);
}