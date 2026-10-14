---
title: "MSCI World in sieben Diagrammen"
date: 2025-07-31
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

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Wöchentliche Mittelwerte der täglichen Schlusskurse. Die lineare und die logarithmische Ansicht zeigen denselben Verlauf mit unterschiedlicher Skalierung.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Über die Jahrzehnte überwog der Wertzuwachs selbst die großen Kurseinbrüche.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/single.html" title="MSCI World: historischer Indexverlauf, linear und logarithmisch" height="620" loading="eager"></iframe>
  <figcaption><a href="/img/projects/msci/single.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="multiple">02 / Jahresverläufe im Vergleich</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Jedes Kalenderjahr beginnt bei null, bezogen auf seinen ersten Handelstag. Mit dem Schieberegler lässt sich ein Jahr hervorheben; 2026 enthält nur die Daten bis zum angegebenen Stand.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Die Jahresrenditen streuen stark. Der langfristige Durchschnitt beschreibt selten ein einzelnes Jahr.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/multiple.html" title="MSCI World: normierte Verläufe einzelner Kalenderjahre" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/multiple.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="returns-one">03 / Jahresrenditen nach Klassen</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Jeder Block steht für ein Kalenderjahr. Die Renditen sind in Klassen von zehn Prozentpunkten gruppiert; die Tooltips zeigen den genauen Wert und eine kurze historische Einordnung.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>39 Jahre mit Gewinn stehen 14 Jahren mit Verlust gegenüber. Die Jahresrenditen reichten von −42 % bis +39 %.</span></p>

<figure class="interactive-figure figure-bands">
  <iframe src="/img/projects/msci/returns-one.html" title="MSCI World: Jahresrenditen in Klassen von zehn Prozentpunkten" height="820" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/returns-one.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="returns-two">04 / Jahresrenditen im Zeitverlauf</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Die Jahresrenditen in chronologischer Reihenfolge. Die Umschaltung wechselt zwischen prozentualer Rendite und dem Logarithmus des Wachstumsfaktors zur Basis zwei.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Starke und schwache Jahre waren nicht gleichmäßig verteilt, sondern häuften sich in bestimmten Phasen.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/returns-two.html" title="MSCI World: jährliche Renditen im Zeitverlauf" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/returns-two.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="long-term">05 / Renditen nach Haltedauer</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Für jede Haltedauer werden die höchste, die niedrigste und die mittlere annualisierte Rendite der verfügbaren Zeitfenster dargestellt. Grundlage sind die Jahresendstände der Zeitreihe.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Mit längerer Haltedauer fiel der Einstiegszeitpunkt weniger ins Gewicht. Ab 15 Jahren war die Rendite in allen untersuchten Zeitfenstern positiv.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/long-term.html" title="MSCI World: Spannweite annualisierter Renditen nach Haltedauer" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/long-term.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="heatmap">06 / Renditedreieck</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Eine Zelle kombiniert Startjahr und Haltedauer. Die Umschaltung zeigt entweder die annualisierte Rendite oder die gesamte Veränderung über das Zeitfenster.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Bei kurzer Haltedauer lagen die Ergebnisse weit auseinander. Mit längerem Anlagezeitraum wurde die Streuung kleiner.</span></p>

<figure class="interactive-figure figure-tall">
  <iframe src="/img/projects/msci/heatmap.html" title="MSCI World: Renditedreieck nach Startjahr und Haltedauer" height="960" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/heatmap.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="dist">07 / Verteilung der Renditen</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Das Histogramm zeigt, wie häufig Renditen in bestimmten Intervallen auftreten. Die Schaltflächen wechseln zwischen Tages-, Monats- und Jahresrenditen.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Der kleine positive Tagesmittelwert überwog den Verlusteffekt der Schwankungen. Durch den Zinseszinseffekt wurden daraus im Mittel deutlich positive Monats- und Jahresrenditen.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/dist.html" title="MSCI World: Verteilung von Tages-, Monats- und Jahresrenditen" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/dist.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

## Daten und Umsetzung

Die Diagramme stammen aus meinem Projekt [ShowMeMSCI](https://github.com/alexanderblinn/showmemsci). Die Auswertung erfolgt mit Python, pandas und NumPy, die interaktive Darstellung mit Plotly. Als Datengrundlage dient die von Yahoo Finance bereitgestellte MSCI-World-Zeitreihe `^990100-USD-STRD` in USD. Die Abbildungen zeigen historische Indexdaten zum oben genannten Stand.
