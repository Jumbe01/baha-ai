/* Gate 7 — relay board desk test. No Wi-Fi, no loads on the screw terminals.
 *
 * WIRING (relay board pin header -> ESP32)
 *   VCC -> breadboard + rail (5V)     GND -> breadboard - rail
 *   IN1 -> P26 (pump)   IN2 -> P27 (siren)   IN3 -> P14 (floodgate)   IN4 -> P13 (spare)
 *   Leave the yellow JD-VCC jumper ON for this test.
 *
 * PASS: each relay clicks on, its little LED lights for 1 s, then clicks off,
 *       one after another, and the Serial Monitor names the right one.
 */

#define RELAY_ACTIVE_LOW true   // most blue 4-channel boards: LOW = relay on

const int  PINS[]  = { 26, 27, 14, 13 };
const char* NAMES[] = { "IN1 pump", "IN2 siren", "IN3 floodgate", "IN4 spare" };

void setRelay(int pin, bool on) {
  digitalWrite(pin, (on == RELAY_ACTIVE_LOW) ? LOW : HIGH);
}

void setup() {
  Serial.begin(115200);
  for (int pin : PINS) {
    pinMode(pin, OUTPUT);       // must come first on ESP32 core 3.x
    setRelay(pin, false);
  }
  Serial.println("\n=== Gate 7: relay test ===");
}

void loop() {
  for (int i = 0; i < 4; i++) {
    Serial.printf("%s ON\n", NAMES[i]);
    setRelay(PINS[i], true);
    delay(1000);
    setRelay(PINS[i], false);
    Serial.printf("%s off\n", NAMES[i]);
    delay(500);
  }
  Serial.println("--- all off, repeating in 3 s ---");
  delay(3000);
}
