---
title: "MSCI World in neun Diagrammen"
date: 2025-07-31
description: "Interaktive Ansichten von Indexverlauf, Jahresrenditen, Haltedauern, Kurseinbrüchen und einem Sparplan. Gebaut mit Python und Plotly."
tags: [python, plotly, datenvisualisierung]
kind: project
featured: true
---

Hier visualisiere ich die historischen MSCI-World-Daten: den Indexverlauf, einzelne Kalenderjahre und die Renditen unterschiedlich langer Zeiträume.

Datenstand: **16. Oktober 2026** · Preisindex in USD, ohne Dividenden.

[Quellcode auf GitHub](https://github.com/alexanderblinn/showmemsci)

<ol class="figure-index">
  <li><a href="#single">Indexverlauf</a></li>
  <li><a href="#multiple">Jahresverläufe im Vergleich</a></li>
  <li><a href="#returns-one">Jahresrenditen nach Klassen</a></li>
  <li><a href="#returns-two">Jahresrenditen im Zeitverlauf</a></li>
  <li><a href="#long-term">Renditen nach Haltedauer</a></li>
  <li><a href="#heatmap">Renditedreieck</a></li>
  <li><a href="#dist">Verteilung der Renditen</a></li>
  <li><a href="#drawdown">Abstand zum Höchststand</a></li>
  <li><a href="#sparplan">Sparplan</a></li>
</ol>

<h2 id="single">01 / Indexverlauf</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Der erste Schlusskurs jeder Woche. In den Formeln der folgenden Diagramme steht $S$ für den Indexstand, also den Schlusskurs des MSCI World an einem Handelstag; der Index gibt die Kursentwicklung wieder, ohne Dividenden. Die lineare und die logarithmische Ansicht zeigen denselben Verlauf; in der logarithmischen sind gleiche prozentuale Veränderungen gleich hoch, etwa jede Verdopplung.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Über die Jahrzehnte überwog der Wertzuwachs selbst die großen Kurseinbrüche.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/single.html" title="MSCI World: historischer Indexverlauf, linear und logarithmisch" height="620" loading="eager"></iframe>
  <figcaption><a href="/img/projects/msci/single.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="multiple">02 / Jahresverläufe im Vergleich</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Jedes Kalenderjahr beginnt bei null: Gezeigt ist $S_t/S_0-1$: der Schlusskurs $S_t$ am Handelstag $t$ im Verhältnis zum Schlusskurs $S_0$ am ersten Handelstag des Jahres, in der Log₂-Ansicht $\log_2(S_t/S_0)$. Mit dem Schieberegler lässt sich ein Jahr hervorheben; 2026 enthält nur die Daten bis zum angegebenen Stand.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Die Jahresrenditen streuen stark. Der langfristige Durchschnitt beschreibt selten ein einzelnes Jahr.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/multiple.html" title="MSCI World: normierte Verläufe einzelner Kalenderjahre" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/multiple.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="returns-one">03 / Jahresrenditen nach Klassen</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Jeder Block steht für ein Kalenderjahr mit der Jahresrendite $r=S_\mathrm{Ende}/S_\mathrm{Vorjahr}-1$; $S_\mathrm{Ende}$ ist der Schlusskurs am letzten Handelstag des Jahres, $S_\mathrm{Vorjahr}$ der am letzten Handelstag des Vorjahres. Die Renditen sind in Klassen von zehn Prozentpunkten gruppiert; die Tooltips zeigen den genauen Wert und eine kurze historische Einordnung.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>39 Jahre mit Gewinn stehen 14 Jahren mit Verlust gegenüber. Die Jahresrenditen reichten von −42 % bis +39 %.</span></p>

<figure class="interactive-figure figure-bands">
  <iframe src="/img/projects/msci/returns-one.html" title="MSCI World: Jahresrenditen in Klassen von zehn Prozentpunkten" height="820" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/returns-one.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="returns-two">04 / Jahresrenditen im Zeitverlauf</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Die Jahresrenditen $r$ aus Diagramm 03 in chronologischer Reihenfolge. Die Log₂-Ansicht zeigt $\log_2(1+r)$: Eine Verdopplung hat den Wert 1, eine Halbierung den Wert −1, und Gewinne und Verluste, die sich aufheben, sind gleich lang.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Starke und schwache Jahre waren nicht gleichmäßig verteilt, sondern häuften sich in bestimmten Phasen.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/returns-two.html" title="MSCI World: jährliche Renditen im Zeitverlauf" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/returns-two.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="long-term">05 / Renditen nach Haltedauer</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Für jede Haltedauer $n$ und jedes Startjahr $t$ ergibt sich die annualisierte Rendite $(S_{t+n}/S_t)^{1/n}-1$; $S_t$ ist der Indexstand am Ende des Startjahres, $S_{t+n}$ der am Ende des Jahres $n$ Jahre später. Gezeigt sind der höchste, der niedrigste und der mittlere Wert über alle Startjahre.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Mit längerer Haltedauer fiel der Einstiegszeitpunkt weniger ins Gewicht. Ab 14 Jahren war die Rendite in allen untersuchten Zeitfenstern positiv.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/long-term.html" title="MSCI World: Spannweite annualisierter Renditen nach Haltedauer" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/long-term.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="heatmap">06 / Renditedreieck</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Eine Zelle kombiniert Startjahr $t$ und Haltedauer $n$, mit den Jahresendständen $S_t$ und $S_{t+n}$ wie in Diagramm 05. „Annualisiert“ zeigt $(S_{t+n}/S_t)^{1/n}-1$, „Gesamt“ die ganze Veränderung $S_{t+n}/S_t-1$ über das Zeitfenster; die Farbskala rechts ordnet die Farben den Renditen zu.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Bei kurzer Haltedauer lagen die Ergebnisse weit auseinander. Mit längerem Anlagezeitraum wurde die Streuung kleiner.</span></p>

<figure class="interactive-figure figure-tall">
  <iframe src="/img/projects/msci/heatmap.html" title="MSCI World: Renditedreieck nach Startjahr und Haltedauer" height="960" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/heatmap.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="dist">07 / Verteilung der Renditen</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Das Histogramm zählt die Renditen $x_i=S_i/S_{i-1}-1$ zwischen zwei aufeinanderfolgenden Schlusskursen $S_{i-1}$ und $S_i$, wahlweise von Tag zu Tag, von Monatsende zu Monatsende oder von Jahresende zu Jahresende. $h$ ist die Klassenbreite, bei den Jahresrenditen nach der Regel von Doane gewählt; der Kasten nennt Anzahl, Mittelwert und Varianz.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Der kleine positive Tagesmittelwert überwog den Verlusteffekt der Schwankungen. Durch den Zinseszinseffekt wurden daraus im Mittel deutlich positive Monats- und Jahresrenditen.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/dist.html" title="MSCI World: Verteilung von Tages-, Monats- und Jahresrenditen" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/dist.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="drawdown">08 / Abstand zum Höchststand</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Für jeden Handelstag $t$ der Abstand $S_t/\max_{u\le t}S_u-1$ zum bisherigen Höchststand: der Schlusskurs $S_t$ im Verhältnis zum höchsten Schlusskurs aller Tage $u$ bis einschließlich $t$. Gezeigt ist je Woche der tiefste Wert. Beschriftet sind die vier tiefsten Einbrüche mit der Zeit vom alten Höchststand, bis er wieder erreicht war.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Der tiefste Einbruch, −59 % in der Finanzkrise, war erst nach 6,3 Jahren aufgeholt, nach der Dotcom-Blase und 1973/74 dauerte es je 6,7 Jahre. Der Corona-Einbruch von −34 % war nach einem halben Jahr vorbei.</span></p>

<figure class="interactive-figure">
  <iframe src="/img/projects/msci/drawdown.html" title="MSCI World: Abstand zum bisherigen Höchststand" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/drawdown.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="sparplan">09 / Sparplan</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Ab Januar des Startjahres werden jeden Monat 100 $ zum Schlusskurs am Monatsende angelegt; bewertet wird einen Monat nach der letzten Rate. Die Rendite ist der interne Zinsfuß aller Ein- und Auszahlungen. Zum Vergleich steht eine Einmalanlage derselben Summe zu Beginn. „Real, USA“ rechnet alle Beträge mit den US-Verbraucherpreisen in Kaufkraft des Startmonats um. „Real, Deutschland“ legt 100 € im Monat an, umgerechnet zum Monatsmittel des Wechselkurses (vor 1999 über die D-Mark), und rechnet mit den deutschen Verbraucherpreisen.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Über 20 Jahre lag die Rendite eines Sparplans je nach Startjahr zwischen 0,4 % (Start 1989) und 12,5 % pro Jahr (Start 1980). Real lag sie in US-Kaufkraft zwischen −2,0 % und 9,0 %, in Euro und deutscher Kaufkraft zwischen −2,4 % und 9,6 %.</span></p>

<figure class="interactive-figure figure-plan">
  <iframe src="/img/projects/msci/sparplan.html" title="MSCI World: Sparplan mit wählbarem Startjahr und Dauer" height="790" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/sparplan.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

## Nominal, real und mit Dividenden

Alle Diagramme zeigen den Preisindex in US-Dollar, also ohne Dividenden und vor Inflation. Für die langfristige Rendite gibt es deshalb mehrere Zahlen, die Verschiedenes messen:

| Ende 1972 bis Ende 2025, pro Jahr | in $ | in € |
|---|---:|---:|
| Durchschnitt der Jahresrenditen | 8,4 % | – |
| Kursanstieg, nominal | 6,9 % | 5,6 % |
| Verbraucherpreise USA bzw. Deutschland | 3,9 % | 2,6 % |
| **Kursanstieg, real** | **2,9 %** | **2,9 %** |
| real mit Dividenden, grob | 5–6 % | 5–6 % |

**Durchschnitt und Wachstum.** Die 8,4 % sind der Mittelwert der 53 einzelnen Jahresrenditen, wie ihn der Kasten in Diagramm 07 zeigt. Wie schnell das Geld tatsächlich gewachsen ist, zeigt die annualisierte Rendite: Das 34-Fache in 53 Jahren entspricht $34^{1/53}\approx 1{,}069$, also 6,9 % pro Jahr. Sie liegt unter dem Durchschnitt, weil Verluste schwerer wiegen als gleich große Gewinne. Auf −50 % und +50 % folgt ein Durchschnitt von null, vom Geld sind aber nur 75 % übrig. Je stärker die Schwankungen, desto größer die Lücke; mit der Varianz $\sigma^2\approx 0{,}029$ der Jahresrenditen beträgt sie etwa $\sigma^2/2$, also 1,5 Prozentpunkte.

**Inflation.** Die US-Verbraucherpreise stiegen im selben Zeitraum um 3,9 % pro Jahr. In US-Kaufkraft gemessen bleibt $1{,}069/1{,}039\approx 1{,}029$, also 2,9 % pro Jahr, ungefähr die Differenz 6,9 % − 3,9 %; über 53 Jahre ist das real das 4,5-Fache. Abzuziehen ist die Inflation also von der annualisierten Rendite, nicht vom Durchschnitt.

**Aus deutscher Sicht.** Für Anleger in Deutschland zählt der Index in Euro, bis 1998 in D-Mark und zum festen Kurs von 1,95583 D-Mark je Euro umgerechnet. Weil der Dollar gegenüber D-Mark und Euro an Wert verlor, wuchs der Index in Euro nur um 5,6 % pro Jahr, auf das 18-Fache. Dafür stiegen die deutschen Verbraucherpreise mit 2,6 % pro Jahr langsamer. In deutscher Kaufkraft bleiben $1{,}056/1{,}026\approx 1{,}029$, also ebenfalls 2,9 % pro Jahr oder real das 4,6-Fache: Der schwächere Dollar glich die niedrigere Inflation fast genau aus.

**Dividenden.** Der Preisindex enthält sie nicht. Historisch brachten sie grob zwei bis drei Prozentpunkte pro Jahr hinzu, die erst der Total-Return-Index von MSCI zeigt; real kommt man damit auf grob 5 bis 6 % pro Jahr. Ein ausschüttender ETF (dist) folgt dem Preisindex und zahlt die Dividenden aus. Ein thesaurierender ETF (acc) legt sie wieder an und folgt dem Net-Total-Return-Index, dem Index mit Dividenden nach Quellensteuer; für ihn gelten also die Zahlen mit Dividenden, abzüglich der laufenden Kosten.

## Fazit

Kurzfristig ist der MSCI World unruhig: Einzelne Jahre reichten von −42 % bis +39 %, und die großen Einbrüche brauchten Jahre bis zur Erholung. Mit der Haltedauer wurden die Ergebnisse verlässlicher, ab 14 Jahren war jedes Zeitfenster im Plus. In Kaufkraft gemessen wuchs der Index um knapp 3 % pro Jahr, in US-Dollar wie in Euro, mit Dividenden um grob 5 bis 6 %.

## Daten und Umsetzung

Die Diagramme 01 bis 07 stammen aus meinem Projekt [ShowMeMSCI](https://github.com/alexanderblinn/showmemsci), für diese Seite ins Deutsche übertragen; 08 und 09 entstehen hier aus denselben Tageskursen. Die Auswertung erfolgt mit Python, pandas und NumPy, die interaktive Darstellung mit Plotly. Datengrundlage ist die von Yahoo Finance bereitgestellte MSCI-World-Zeitreihe `^990100-USD-STRD`, ein Preisindex in USD. Die Inflationsbereinigung nutzt den US-Verbraucherpreisindex CPI-U des Bureau of Labor Statistics, abgerufen über [FRED](https://fred.stlouisfed.org/series/CPIAUCNS), und den Verbraucherpreisindex des Statistischen Bundesamts, abgerufen über die [Bundesbank](https://www.bundesbank.de/de/statistiken/zeitreihen-datenbanken) (vor 1991 Westdeutschland, Reihe der OECD). Die Wechselkurse sind Monatsmittel von FRED, vor 1999 D-Mark je Dollar. Die Abbildungen zeigen historische Indexdaten zum oben genannten Stand.
