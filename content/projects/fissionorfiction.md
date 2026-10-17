---
title: "Fission or Fiction? – Kernenergie in Daten"
date: 2024-09-17
description: "Kernkraftwerke weltweit: Standorte, Alter, Leistung, Bauprojekte, Bauzeiten und ein Laufzeit-Szenario in acht interaktiven Ansichten."
tags: [python, plotly, energie, datenvisualisierung]
kind: project
featured: true
---

Über Kernenergie wird viel behauptet. **Fission or Fiction?** zeigt, was die Daten zur weltweiten Reaktorflotte hergeben: wo Kernkraftwerke stehen, wie alt sie sind, wie viel gebaut wird und wie lange das dauert.

Datengrundlage: **Global Nuclear Power Tracker, August 2026** · Global Energy Monitor

[Quellcode auf GitHub](https://github.com/alexanderblinn/fissionorfiction)

<ol class="figure-index">
  <li><a href="#map">Kernkraftwerke weltweit</a></li>
  <li><a href="#evolution">Entwicklung auf der Weltkarte</a></li>
  <li><a href="#commissioning">Inbetriebnahme und Stilllegung</a></li>
  <li><a href="#count">Reaktoranzahl und Alter</a></li>
  <li><a href="#capacity">Installierte Leistung</a></li>
  <li><a href="#construction">Reaktoren im Bau</a></li>
  <li><a href="#buildtime">Bauzeiten</a></li>
  <li><a href="#outlook">Laufzeit-Szenario</a></li>
</ol>

<h2 id="map">01 / Kernkraftwerke weltweit</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Jeder Kreis ist ein Standort, seine Größe wächst mit der Leistung der gezeigten Reaktorblöcke, die Segmente zeigen deren Status. Oben lassen sich Status ein- und ausblenden. Ein Klick auf einen Standort listet alle seine Blöcke mit Betriebs- und Bauzeit, Reaktortyp, Eigentümer und Betreiber. „Abgeschaltet“ heißt außer Betrieb, aber nicht offiziell stillgelegt; „geplant“ umfasst angekündigte Blöcke und solche in Vorbereitung.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Im August 2026 waren 424 Reaktorblöcke mit 408 GW in Betrieb, an 172 Standorten in 32 Ländern. 82 weitere waren im Bau, in 17 Ländern.</span></p>

<figure class="interactive-figure figure-location-map">
  <iframe src="/img/projects/fissionorfiction/map.html" title="Fission or Fiction: Weltkarte der Kernkraftwerke nach Status" height="640" loading="eager"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/map.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="evolution">02 / Entwicklung auf der Weltkarte</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Für jedes Jahresende sind die Länder nach ihrer Leistung in Betrieb eingefärbt, die Punkte sind die Standorte. Wie in den Diagrammen 04 und 05 zählen auch abgeschaltete Reaktoren, die nicht offiziell stillgelegt sind; im August 2026 waren das 22 Blöcke mit 19 GW, die meisten in Japan.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Bis Ende der 1980er-Jahre wuchs die Flotte in Nordamerika, Europa, der Sowjetunion und Japan. Seit 2000 kam der Zubau vor allem aus China: von 3 auf 61 Reaktoren.</span></p>

<figure class="interactive-figure figure-nuclear-map">
  <iframe src="/img/projects/fissionorfiction/evolution.html" title="Fission or Fiction: Kernenergie auf der Weltkarte von 1954 bis 2026" height="500" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/evolution.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="commissioning">03 / Inbetriebnahme und Stilllegung</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Oben steht jeder Reaktor in Betrieb bei seiner Inbetriebnahme, die Höhe ist sein Alter im August 2026. Unten steht jeder stillgelegte Reaktor bei seiner Stilllegung, die Tiefe ist seine Betriebsdauer. Die Kreisgröße wächst mit der Leistung, ein Klick auf einen Kreis zeigt alle Angaben zum Reaktor. Gepunktet sind die Unfälle von Harrisburg (Three Mile Island), Tschernobyl und Fukushima.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Der Bauboom der 1970er- und 1980er-Jahre prägt die Flotte bis heute: 191 der 424 Reaktoren in Betrieb sind älter als 40 Jahre. Nach Fukushima wurden bis August 2026 91 Reaktoren mit 73 GW stillgelegt, vor allem in Japan und Deutschland; im gleich langen Zeitraum davor waren es 50 mit 21 GW.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/commissioning.html" title="Fission or Fiction: Inbetriebnahmen, Stilllegungen und Reaktoralter" height="640" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/commissioning.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="count">04 / Reaktoranzahl und Alter</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Reaktoren in Betrieb am Jahresende, gestapelt nach Ländern. Die Farbe zeigt das mittlere Alter im jeweiligen Land, die gepunktete Linie das mittlere Alter aller gezeigten Reaktoren (rechte Achse).</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Seit Ende der 1980er-Jahre liegt die Zahl der Reaktoren zwischen 410 und 450. Ihr mittleres Alter stieg von 11 auf 33 Jahre, in den USA auf 44 Jahre.</span></p>

<figure class="interactive-figure figure-nuclear-short">
  <iframe src="/img/projects/fissionorfiction/count.html" title="Fission or Fiction: Zahl und mittleres Alter der Reaktoren" height="560" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/count.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="capacity">05 / Installierte Leistung</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Leistung der Reaktoren in Betrieb am Jahresende, gestapelt nach Ländern. Ein Klick auf ein Land in der Legende blendet es aus, ein Doppelklick zeigt nur dieses Land.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Bei fast gleicher Reaktoranzahl stieg die Leistung seit 1990 von 349 auf 427 GW, so viel wie nie zuvor, weil neue Blöcke größer sind als die stillgelegten. Die USA, Frankreich und China stellen über die Hälfte.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/capacity.html" title="Fission or Fiction: installierte Reaktorleistung nach Land und Jahr" height="640" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/capacity.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="construction">06 / Reaktoren im Bau</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Reaktoren im Bau am Jahresende, vom offiziellen Baubeginn bis zur kommerziellen Inbetriebnahme. Gekreuzt sind Projekte, die später aufgegeben wurden; sie zählen bis zum Jahr ihrer Aufgabe. Angekündigte Projekte und solche in Vorbereitung fehlen, ebenso fünf Blöcke ohne Baubeginn in den Daten.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Um 1980 waren über 200 Reaktoren gleichzeitig im Bau. Im August 2026 waren es 77, fast die Hälfte davon in China.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/construction.html" title="Fission or Fiction: Reaktoren im Bau und später aufgegebene Vorhaben" height="640" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/construction.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="buildtime">07 / Bauzeiten</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Jeder Punkt ist ein Reaktor: waagerecht der Baubeginn, senkrecht die Zeit bis zur ersten Einspeisung ins Netz (fehlt sie, bis zur Inbetriebnahme). Offene Kreise sind noch im Bau, ihre Höhe ist die bisherige Dauer. Die Linie zeigt den Median je fünf Jahre Baubeginn; für die jüngsten Jahrgänge ist er zu niedrig, weil langsame Projekte noch nicht fertig sind.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Typisch sind knapp sechs Jahre. Unter den Reaktoren, die seit 2016 ans Netz gingen, brauchten die chinesischen im Median 5,6 Jahre, die übrigen 9,7. Ausreißer reichen bis über 40 Jahre: Watts Bar 2 in den USA ging nach 43 Jahren ans Netz, Mochovce 4 in der Slowakei ist seit 1987 im Bau.</span></p>

<figure class="interactive-figure figure-nuclear-short">
  <iframe src="/img/projects/fissionorfiction/buildtime.html" title="Fission or Fiction: Bauzeiten der Reaktoren nach Baubeginn" height="560" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/buildtime.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="outlook">08 / Laufzeit-Szenario</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Ein Gedankenexperiment, keine Prognose. Jeder der 424 Reaktoren in Betrieb läuft genau die eingestellte Zahl an Jahren ab Inbetriebnahme oder bis zu einer angekündigten früheren Stilllegung; ältere gehen Ende 2026 vom Netz. Reaktoren im Bau starten im erwarteten Jahr (ohne Angabe sieben Jahre nach Baubeginn) und laufen ebenso lange. Abgeschaltete Reaktoren und neue Projekte fehlen.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Bei 40 Jahren Laufzeit wäre die Hälfte der heutigen Leistung bis 2028 vom Netz, bei 60 Jahren bis 2048. Selbst mit 60 Jahren und allen Reaktoren im Bau fiele die Leistung bis 2050 um gut ein Drittel, wenn nichts Neues hinzukommt.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/outlook.html" title="Fission or Fiction: Leistung der heutigen Reaktoren bei wählbarer Laufzeit" height="640" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/outlook.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

## Fazit

Die weltweite Reaktorflotte wächst kaum noch: Seit Ende der 1980er-Jahre sind rund 410 bis 450 Reaktoren in Betrieb, mehr Leistung kam vor allem durch größere Blöcke. Gleichzeitig altert die Flotte, im Mittel auf über 30 Jahre. Gebaut wird heute vor allem in China, schneller als anderswo. Ob Kernenergie weltweit wächst oder schrumpft, hängt damit an zwei Größen: wie lange die bestehenden Reaktoren laufen dürfen und wie schnell neue ans Netz gehen.

## Daten und Umsetzung

Grundlage ist der [Global Nuclear Power Tracker](https://globalenergymonitor.org/projects/global-nuclear-power-tracker/) von Global Energy Monitor in der Ausgabe vom August 2026 (Lizenz CC BY 4.0). Er verzeichnet 1.825 Reaktorblöcke mit Status, Leistung, Reaktortyp, Koordinaten und den Daten von Baubeginn, erster Netzeinspeisung, Inbetriebnahme, Stilllegung oder Aufgabe. Ein Python-Skript liest die Tabelle ein, alle Diagramme werden im Browser daraus berechnet und mit Plotly und Leaflet dargestellt. Die Länder folgen den heutigen Grenzen, Reaktoren der Sowjetunion zählen etwa zu Russland, der Ukraine oder Litauen. Drei japanische Reaktoren, die der Tracker für ihren Neustart wieder als im Bau führt, zählen hier wie die übrigen abgeschalteten ab ihrem ersten Netzanschluss. Die Abbildungen zeigen den Stand der Daten, ohne automatische Aktualisierung.
