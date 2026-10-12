---
title: "Lernende Terminalwerte für MPC"
description: "Wie lässt sich Wissen über die Zukunft in einen kurzen Planungshorizont einbauen?"
tags: [mpc, reinforcement-learning, optimierung]
kind: project
status: "Themennotiz"
featured: true
---

## Fragestellung

Ein kurzer MPC-Horizont spart Rechenaufwand. Aber welche Entscheidungen werden übersehen, wenn ihre Folgen erst später sichtbar werden? Diese Themenübersicht verbindet modellbasierte Regelung mit der Idee, zukünftige Kosten aus Daten zu lernen.

## Was mich daran interessiert

- Welche Struktur sollte eine gelernte Terminalwertfunktion haben?
- Wie lässt sich ihr Einfluss von der Wahl des Horizonts trennen?
- Wie reagiert die Regelung auf Fehler außerhalb der Trainingsdaten?
- Welche zusätzlichen Bedingungen wären für Stabilitätsaussagen nötig?

Ein sinnvoller Vergleich beginnt mit einem kleinen, nachvollziehbaren System: gleiche Dynamik, gleiche Grenzen, verschiedene Terminalkosten. Bewertet werden könnten Regelgüte, Rechenzeit und Verhalten bei Störungen.

## Einstieg

[Warum MPC Terminalkosten verwendet](/notes/mpc-terminalkosten.html) erklärt die Grundidee. [LQR und die Riccati-Gleichung](/notes/lqr-intuition.html) liefern eine analytische Referenz für den linearen Fall.
