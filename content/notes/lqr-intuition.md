---
title: "LQR: Wie teuer ist eine Abweichung?"
date: 2026-10-12
description: "Zustand und Stellaufwand gegeneinander abwägen — und warum dabei Riccati auftaucht."
tags: [lqr, riccati, regelung]
---

Beim Linear Quadratic Regulator sind zwei Dinge festgelegt: ein lineares Modell und quadratische Kosten. Für ein zeitdiskretes System gilt

$$
x_{k+1}=Ax_k+Bu_k.
$$

Der Zustand beschreibt die Abweichung vom Ziel. Die Stellgröße beeinflusst den nächsten Zustand. Gesucht ist eine Regelung, die die Summe

$$
J=\sum_{k=0}^{\infty}\left(x_k^\top Qx_k+u_k^\top Ru_k\right)
$$

minimiert. Dabei ist Q positiv semidefinit und R positiv definit.

## Die Abwägung

Q gewichtet Zustandsabweichungen, R den Stellaufwand. Die Einheiten und Skalierungen gehören deshalb zur Wahl der Gewichte. Eine größere Zahl allein bedeutet noch keine sinnvollere Auslegung.

Für ein stabilisierbares System mit geeigneter Detektierbarkeit ergibt sich eine lineare Rückführung:

$$
u_k=-Kx_k,\qquad K=(R+B^\top PB)^{-1}B^\top PA.
$$

P ist die stabilisierende Lösung der diskreten algebraischen Riccati-Gleichung. Die Funktion

$$
V(x)=x^\top Px
$$

bewertet die verbleibenden optimalen Kosten ab einem Zustand. Darin liegt auch die Verbindung zu [MPC-Terminalkosten](/notes/mpc-terminalkosten.html). Herleitung und Voraussetzungen stehen im [LQR-Kapitel von Russ Tedrake, MIT](https://underactuated.mit.edu/lqr.html).

## Selbst ausprobieren

Die [interaktive Regelkreis-Demo](/demos/regelkreis.html) macht den Einfluss der Rückführung auf ein einfaches System sichtbar.
