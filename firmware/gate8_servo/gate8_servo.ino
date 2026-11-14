/* Gate 8 — SG90 servo (floodgate) desk test. No Wi-Fi.
 *
 * WIRING (servo's 3-wire plug)
 *   brown  -> breadboard - rail (GND)
 *   red    -> breadboard + rail (5V)   never 3V3: the stall current browns out the board
 *   orange -> ESP32 P25
 * Needs library: ESP32Servo (Kevin Harrington).
 *
 * PASS: the arm swings to OPEN, waits 2 s, swings back to CLOSED, repeats.
 */

#include <ESP32Servo.h>

const int PIN_SERVO       = 25;
const int GATE_CLOSED_DEG = 0;    // tune both once the arm is fitted to the gate
const int GATE_OPEN_DEG   = 90;

Servo gate;
int gateDeg = GATE_CLOSED_DEG;

// Step 1 degree at a time: a full-speed jump draws ~0.7 A at start-up,
// which browns out an ESP32 running from a laptop USB port.
void moveGate(int target) {
  while (gateDeg != target) {
    gateDeg += (target > gateDeg) ? 1 : -1;
    gate.write(gateDeg);
    delay(15);                    // ~1.4 s for 90 degrees
  }
}

void setup() {
  Serial.begin(115200);
  gate.attach(PIN_SERVO);
  gate.write(GATE_CLOSED_DEG);
  Serial.println("\n=== Gate 8: servo test ===");
}

void loop() {
  delay(2000);
  Serial.println("gate OPEN");
  moveGate(GATE_OPEN_DEG);
  delay(2000);
  Serial.println("gate CLOSED");
  moveGate(GATE_CLOSED_DEG);
}
