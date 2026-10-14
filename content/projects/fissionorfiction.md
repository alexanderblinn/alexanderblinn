---
title: "Fission or Fiction? – Kernenergie in Daten"
date: 2024-09-17
description: "Kernkraftwerke weltweit: Standorte, Reaktoranzahl, Leistung und Bauprojekte in sechs interaktiven Ansichten."
tags: [python, plotly, energie, datenvisualisierung]
kind: project
featured: true
layout: wide
---

**Fission or Fiction?** – Kernkraftwerke weltweit: Standorte, Alter, Leistung und Bauprojekte.

Datengrundlage: **Global Nuclear Power Tracker, Juli 2024** · Global Energy Monitor · [Quellcode auf GitHub](https://github.com/alexanderblinn/fissionorfiction)

<ol class="figure-index">
  <li><a href="#map">Kernkraftwerke weltweit</a></li>
  <li><a href="#evolution">Entwicklung auf der Weltkarte</a></li>
  <li><a href="#commissioning">Inbetriebnahme und Stilllegung</a></li>
  <li><a href="#count">Reaktoranzahl und Alter</a></li>
  <li><a href="#capacity">Installierte Leistung</a></li>
  <li><a href="#construction">Reaktoren im Bau</a></li>
</ol>

<p class="aside-note">Auf schmalen Bildschirmen lassen sich die breiten Diagramme seitlich scrollen.</p>

<h2 id="map">01 / Kernkraftwerke weltweit</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Standorte und Reaktorblöcke mit Angaben zu Leistung und Status.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Ein Standort kann mehrere Reaktorblöcke mit unterschiedlicher Leistung und unterschiedlichem Status umfassen.</span></p>

<figure class="interactive-figure figure-location-map">
  <iframe src="/img/projects/fissionorfiction/map.html" title="Fission or Fiction: Weltkarte der Kernkraftwerke" height="900" loading="eager"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/map.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="evolution">02 / Entwicklung auf der Weltkarte</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Der Zeitschieber zeigt Standorte und Leistung von 1955 bis 2024.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Die zeitliche Ansicht macht sichtbar, wann und wo sich die Reaktorflotte verändert hat.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/evolution.html" title="Fission or Fiction: animierte Entwicklung der Kernenergie von 1955 bis 2024" height="660" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/evolution.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="commissioning">03 / Inbetriebnahme und Stilllegung</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Oben: Reaktoren in Betrieb mit ihrem Alter zum Auswertungsstand. Unten: stillgelegte Reaktoren mit ihrem Alter bei der Stilllegung.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Neubau, Alterung und Stilllegung gehören zusammen, um die Entwicklung der Reaktorflotte einzuordnen.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/commissioning.html" title="Fission or Fiction: Inbetriebnahmen, Stilllegungen und Reaktoralter" height="920" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/commissioning.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="count">04 / Reaktoranzahl und Alter</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Die Balkenhöhe zeigt die Reaktoranzahl, die Farbe das mittlere Alter je Land und Jahr.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Eine ähnliche Reaktoranzahl kann mit einer ganz anderen Altersstruktur einhergehen.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/count.html" title="Fission or Fiction: Zahl und mittleres Alter der Reaktoren" height="920" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/count.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="capacity">05 / Installierte Leistung</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Installierte Leistung je Land in Gigawatt.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Reaktoranzahl und Leistung sind unterschiedliche Größen: Die Leistung einzelner Blöcke unterscheidet sich deutlich.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/capacity.html" title="Fission or Fiction: installierte Reaktorleistung nach Land und Jahr" height="920" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/capacity.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<h2 id="construction">06 / Reaktoren im Bau</h2>

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Erfasst sind begonnene Bauvorhaben. Das Kreuzmuster markiert später abgebrochene Projekte; reine Planungen sind nicht enthalten.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Ein Baubeginn ist noch keine Inbetriebnahme.</span></p>

<figure class="interactive-figure figure-nuclear">
  <iframe src="/img/projects/fissionorfiction/construction.html" title="Fission or Fiction: Reaktoren im Bau und später abgebrochene Vorhaben" height="920" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/fissionorfiction/construction.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<details markdown="1">
<summary>Daten und Einordnung</summary>

Quelle: **Global Energy Monitor, Global Nuclear Power Tracker, Juli 2024**. Historische Auswertung ohne automatische Aktualisierung.

In den Bestandsdiagrammen zählen auch abgeschaltete Reaktoren als in Betrieb, solange sie nicht offiziell stillgelegt wurden. Die Leistungsangaben beschreiben installierte Kapazitäten, keine erzeugten Strommengen.

</details>
