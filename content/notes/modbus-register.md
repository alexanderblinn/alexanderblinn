---
title: "Modbus: Checkliste für einen Messwert"
date: 2026-10-12
description: "Adresse, Datentyp und Skalierung prüfen, bevor aus Registern ein Messwert wird."
tags: [modbus, sensorik, build]
---

Eine erfolgreiche Antwort ist noch kein korrekt interpretierter Messwert. Vor der Verwendung helfen diese Prüfungen:

1. **Registerbereich:** Holding Register werden mit Funktionscode 03, Input Register mit 04 gelesen.
2. **Adresse:** Die Adresse im Protokoll beginnt bei null. Prüfen, ob das Gerätehandbuch einen solchen Offset oder eine anders nummerierte Referenz angibt.
3. **Länge:** Ein Register enthält 16 Bit. Ein 32-Bit-Wert benötigt zwei Register.
4. **Reihenfolge:** Innerhalb eines Registers sendet Modbus das höherwertige Byte zuerst. Die Reihenfolge mehrerer Register für einen 32-Bit-Wert muss anhand der Gerätedokumentation geklärt werden.
5. **Interpretation:** Vorzeichen, Ganzzahl oder Gleitkommazahl, Faktor, Offset und Einheit dokumentieren.

Adressierung und Registerformat beschreibt die [Modbus Application Protocol Specification, Abschnitte 4 und 6](https://www.modbus.org/file/secure/modbusprotocolspecification.pdf). Die unterschiedlichen Anordnungen von 32-Bit-Werten erläutert die [Modbus Organization](https://www.modbus.org/introduction-to-modbus).

## Ein kleiner Plausibilitätscheck

Ein fiktives Gerät liefert den Rohwert `2317`. Laut seiner angenommenen Registerbeschreibung entspricht ein Schritt `0,1 W`:

```text
Rohwert:      2317
Faktor:       0,1 W
Leistung:     231,7 W
```

Das ist ein Rechenbeispiel, keine Registerdefinition für ein bestimmtes Gerät. Beim echten Aufbau lohnt sich ein Vergleich mit der Geräteanzeige. Rohwerte, Zeitstempel und Kommunikationsfehler mitzuspeichern macht Abweichungen später nachvollziehbar.

Zum Themenfeld: [Messdaten und Automatisierung](/projects/automatisierung.html).
