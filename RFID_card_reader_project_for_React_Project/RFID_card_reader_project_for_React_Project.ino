#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <MFRC522.h>
#include <map>  // UID'ye göre işlem tipi tutmak için

// LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// RFID
#define SS_PIN 5
#define RST_PIN 4
MFRC522 rfid(SS_PIN, RST_PIN);

// Buzzer ve LED
#define BUZZER_PIN 15
#define LED_PIN 12

// WiFi Bilgileri
const char* ssid = "Onur iPhone’u";
const char* password = "oalcaa1900";

// Backend URL
const char* serverURL = "http://172.20.10.2:5000/api/entries";

// UID -> giriş/çıkış tipi
std::map<String, String> sonIslemler;

// UID’ye göre isim eşleşmesi
String getPersonelName(String uid) {
  if (uid == "8B80E81A") return "Ahmet Yilmaz";
  if (uid == "7B4EE120") return "Zeynep Demir";
  if (uid == "8BFAC939") return "Onur ALACA";
  if (uid == "BC640810") return "Merdan YURTSEVER";
  if (uid == "ECEC0C10") return "Aslı ALİKO";
  if (uid == "0431EC42677481") return "Emin GÜZELDEMİRCİ";
  return "Bilinmeyen";
}

// Giriş/Çıkış tipi belirleyici
String belirleIslemTipi(String uid) {
  if (sonIslemler[uid] == "giris") {
    sonIslemler[uid] = "cikis";
  } else {
    sonIslemler[uid] = "giris";
  }
  return sonIslemler[uid];
}

// Başarılı okuma melodisi
void playSuccessTone() {
  tone(BUZZER_PIN, 1047); // C6
  delay(150);
  tone(BUZZER_PIN, 1319); // E6
  delay(150);
  tone(BUZZER_PIN, 1568); // G6
  delay(200);
  noTone(BUZZER_PIN);
}

void setup() {
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("WiFi baglaniyor...");

  SPI.begin(18, 19, 23, SS_PIN);
  rfid.PCD_Init();

  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Kart okutun...");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  // UID elde et
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  String personel = getPersonelName(uid);
  String islemTipi = belirleIslemTipi(uid);

  // LCD'ye yaz
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(personel.substring(0, 16));
  lcd.setCursor(0, 1);
  lcd.print(islemTipi + " - " + uid.substring(0, 8));

  // Buzzer ve LED bildirimi
  playSuccessTone();
  digitalWrite(LED_PIN, HIGH);
  delay(1500);
  digitalWrite(LED_PIN, LOW);

  // Seri monitör
  Serial.println("Kart: " + uid + " - " + personel + " (" + islemTipi + ")");

  // HTTP POST isteği
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"uid\":\"" + uid + "\",\"name\":\"" + personel + "\",\"type\":\"" + islemTipi + "\"}";
    int httpCode = http.POST(json);

    Serial.println("HTTP yanıt kodu: " + String(httpCode));
    http.end();
  }

  delay(500);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Personel360");
  lcd.setCursor(0, 1);
  lcd.print("Kart okutun...");
}
