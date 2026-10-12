---
title: "Tube-MPC und Modellunsicherheit"
description: "Ein Themenfeld zwischen nominaler Planung, Störungen und robusten Grenzen."
tags: [tube-mpc, robustheit, regelung]
kind: project
status: "Themennotiz"
featured: true
---

## Fragestellung

Wie lässt sich vorausplanen, wenn Modell und Realität nicht genau übereinstimmen? Bei Tube-MPC interessieren mich besonders die Verbindung von nominaler Trajektorie und Rückführung sowie der Umgang mit begrenzten Störungen.

## Fragen für eine Untersuchung

- Wie wird eine passende Störmenge aus Annahmen oder Messungen abgeleitet?
- Wie groß muss der Bereich um die nominale Trajektorie sein?
- Wie viel nutzbarer Zustands- und Stellraum geht durch robuste Grenzen verloren?
- Wo wird eine robuste Auslegung unnötig konservativ?

## Eine mögliche Visualisierung

Nominale Trajektorie, tatsächlicher Verlauf und zulässiger Bereich in einem Diagramm. Besonders aufschlussreich wäre der Vergleich verschiedener Störannahmen bei identischer Aufgabe.

Verwandt: [MPC und Terminalkosten](/notes/mpc-terminalkosten.html), [Forschungsfragen](/research/forschungsfragen.html).
