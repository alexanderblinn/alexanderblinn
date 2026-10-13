---
title: "MSCI World in sieben Diagrammen"
date: 2026-10-13
description: "Interaktive Ansichten von Indexverlauf, Jahresrenditen und Haltedauern. Gebaut mit Python und Plotly."
tags: [python, plotly, datenvisualisierung]
kind: project
featured: true
layout: wide
---

Mit **ShowMeMSCI** visualisiere ich historische MSCI-World-Daten: den Indexverlauf, einzelne Kalenderjahre und die Renditen unterschiedlich langer Zeiträume.

Datenstand: **2. April 2026** · USD · [Quellcode auf GitHub](https://github.com/alexanderblinn/showmemsci)

<ol class="figure-index">
  <li><a href="#single">Indexverlauf</a></li>
  <li><a href="#multiple">Jahresverläufe im Vergleich</a></li>
  <li><a href="#returns-one">Jahresrenditen nach Klassen</a></li>
  <li><a href="#returns-two">Jahresrenditen im Zeitverlauf</a></li>
  <li><a href="#long-term">Renditen nach Haltedauer</a></li>
  <li><a href="#heatmap">Renditedreieck</a></li>
  <li><a href="#dist">Verteilung der Renditen</a></li>
</ol>

<h2 id="single">01 / Indexverlauf</h2>

Wöchentliche Mittelwerte der täglichen Schlusskurse. Die lineare und die logarithmische Ansicht zeigen denselben Verlauf mit unterschiedlicher Skalierung.

<figure class="interactive-figure">
  <iframe src="/img/single.html" title="MSCI World: historischer Indexverlauf, linear und logarithmisch" height="620" loading="eager"></iframe>
  <figcaption><span>1972–2026 · USD-Indexstand</span><a href="/img/single.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="multiple">02 / Jahresverläufe im Vergleich</h2>

Jedes Kalenderjahr beginnt bei null, bezogen auf seinen ersten Handelstag. Mit dem Schieberegler lässt sich ein Jahr hervorheben; 2026 enthält nur die Daten bis zum angegebenen Stand.

<figure class="interactive-figure">
  <iframe src="/img/multiple.html" title="MSCI World: normierte Verläufe einzelner Kalenderjahre" height="620" loading="lazy"></iframe>
  <figcaption><span>Ein gemeinsamer Ausgangspunkt für 55 Jahresverläufe</span><a href="/img/multiple.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="returns-one">03 / Jahresrenditen nach Klassen</h2>

Jeder Block steht für ein Kalenderjahr. Die Renditen sind in Klassen von zehn Prozentpunkten gruppiert; die Tooltips zeigen den genauen Wert und eine kurze historische Einordnung.

<figure class="interactive-figure">
  <iframe src="/img/returns-one.html" title="MSCI World: Jahresrenditen in Klassen von zehn Prozentpunkten" height="620" loading="lazy"></iframe>
  <figcaption><span>53 vollständige Kalenderjahre</span><a href="/img/returns-one.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="returns-two">04 / Jahresrenditen im Zeitverlauf</h2>

Die Jahresrenditen in chronologischer Reihenfolge. Die Umschaltung wechselt zwischen prozentualer Rendite und dem Logarithmus des Wachstumsfaktors zur Basis zwei.

<figure class="interactive-figure">
  <iframe src="/img/returns-two.html" title="MSCI World: jährliche Renditen im Zeitverlauf" height="620" loading="lazy"></iframe>
  <figcaption><span>1973–2025 · Prozent- oder Log₂-Ansicht</span><a href="/img/returns-two.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="long-term">05 / Renditen nach Haltedauer</h2>

Für jede Haltedauer werden die höchste, die niedrigste und die mittlere annualisierte Rendite der verfügbaren Zeitfenster dargestellt. Grundlage sind die Jahresendstände der Zeitreihe.

<figure class="interactive-figure">
  <iframe src="/img/long-term.html" title="MSCI World: Spannweite annualisierter Renditen nach Haltedauer" height="620" loading="lazy"></iframe>
  <figcaption><span>Historische Zeitfenster von 1 bis 53 Jahren</span><a href="/img/long-term.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="heatmap">06 / Renditedreieck</h2>

Eine Zelle kombiniert Startjahr und Haltedauer. Die Umschaltung zeigt entweder die annualisierte Rendite oder die gesamte Veränderung über das Zeitfenster.

<figure class="interactive-figure figure-tall">
  <iframe src="/img/heatmap.html" title="MSCI World: Renditedreieck nach Startjahr und Haltedauer" height="960" loading="lazy"></iframe>
  <figcaption><span>Einzelne Zeitfenster im direkten Vergleich</span><a href="/img/heatmap.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="dist">07 / Verteilung der Renditen</h2>

Das Histogramm zeigt, wie häufig Renditen in bestimmten Intervallen auftreten. Die Schaltflächen wechseln zwischen Tages-, Monats- und Jahresrenditen.

<figure class="interactive-figure">
  <iframe src="/img/dist.html" title="MSCI World: Verteilung von Tages-, Monats- und Jahresrenditen" height="620" loading="lazy"></iframe>
  <figcaption><span>Häufigkeiten, Mittelwert und Stichprobenvarianz</span><a href="/img/dist.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

## Daten und Umsetzung

Die Diagramme stammen aus meinem Projekt [ShowMeMSCI](https://github.com/alexanderblinn/showmemsci). Die Auswertung erfolgt mit Python, pandas und NumPy, die interaktive Darstellung mit Plotly. Als Datengrundlage dient die von Yahoo Finance bereitgestellte MSCI-World-Zeitreihe `^990100-USD-STRD` in USD. Die Abbildungen zeigen historische Indexdaten zum oben genannten Stand.
