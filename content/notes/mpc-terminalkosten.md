---
title: "Warum MPC Terminalkosten verwendet"
date: 2026-10-12
description: "Der Horizont endet. Die Folgen einer Entscheidung laufen weiter."
tags: [mpc, optimierung, terminalkosten]
---

Model Predictive Control plant über N Schritte. Nach der Optimierung wird nur die erste Stellgröße angewendet. Mit dem nächsten Zustand beginnt die Planung erneut.

Ein typisches Kostenfunktional lautet

$$
J_N=\sum_{k=0}^{N-1}\ell(x_k,u_k)+V_f(x_N).
$$

Die laufenden Kosten bewerten den sichtbaren Abschnitt. Die Terminalkosten bewerten den Zustand am Ende dieses Abschnitts.

## Was passiert hinter dem Horizont?

Ohne passende Berücksichtigung späterer Folgen kann eine kurzfristig günstige Entscheidung langfristig teuer werden. Terminalkosten sind eine Möglichkeit, diese Folgen in die endliche Optimierung einzubringen. Die exakte optimale Wertfunktion des verbleibenden Problems wäre dafür die ideale Bewertung.

Im unbeschränkten linearen quadratischen Fall liefert die stabilisierende Riccati-Lösung diese Wertfunktion:

$$
V_f(x)=x^\top Px.
$$

## Und die Stabilität?

Eine beliebige Terminalstrafe garantiert keine Stabilität. Klassische Nachweise verbinden geeignete Terminalkosten mit einer zulässigen lokalen Regelung und einer invarianten Terminalmenge. Es gibt auch MPC-Ansätze ohne explizite Terminalkosten; deren Voraussetzungen müssen separat geprüft werden. Siehe [Rawlings, Mayne und Diehl, Kapitel 2](https://sites.engineering.ucsb.edu/~jbraw/mpc/MPC-book-2nd-edition-6th-printing.pdf).

Eine daran anschließende Frage: [Kann eine gelernte Wertfunktion als Terminalbewertung helfen?](/projects/lernende-terminalwerte.html)
