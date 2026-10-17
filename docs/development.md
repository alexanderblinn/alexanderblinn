# Webseite pflegen

Die Seite wird aus Markdown, Templates und statischen Dateien mit Python 3.11 oder neuer gebaut. Das Ergebnis liegt in `dist/`, einschließlich `dist/index.html`.

## Lokale Vorschau

Im Projektordner unter Windows/PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe scripts/serve.py --port 8000
```

Die Vorschau läuft unter [http://127.0.0.1:8000](http://127.0.0.1:8000). Änderungen werden automatisch gebaut; danach die Seite im Browser neu laden. `Strg+C` beendet den Server.

Unter macOS/Linux gelten `python3 -m venv .venv` und `.venv/bin/python`. Der Server muss `dist/` ausliefern, da die Seite absolute Pfade wie `/notes/` verwendet.

## Beiträge

```powershell
.venv\Scripts\python.exe scripts/new.py notes versuch-terminalkosten --title "Terminalkosten bei MPC"
```

Der Befehl erstellt `content/notes/versuch-terminalkosten.md` als Entwurf. Als Bereich sind `notes` und `projects` möglich. Alternativ kann [templates/content-example.md](../templates/content-example.md) kopiert werden.

```markdown
---
title: "Terminalkosten bei MPC"
date: 2026-10-12
description: "Die Rolle von Terminalkosten im endlichen Horizont."
tags: [mpc, optimierung]
draft: true
---

Hier beginnt der Beitrag.
```

`draft: false` nimmt den Beitrag in den nächsten Build auf. Entwürfe sind auch in der Vorschau ausgeblendet. Der Dateiname bestimmt die URL, beispielsweise `/notes/versuch-terminalkosten.html`.

| Feld | Bedeutung |
| --- | --- |
| `title` | Titel, erforderlich. |
| `date` | Datum im Format `YYYY-MM-DD`. |
| `description` | Kurztext für die Übersicht. |
| `tags` | Liste von Schlagwörtern. |
| `draft: true` | Vom Build ausschließen. |
| `featured: true` | Beitrag unter „Ausgewählte Projekte und Notizen“ auf der Startseite anzeigen. |
| `kind: build` | Praktischen Aufbau unter Projects kennzeichnen. |
| `status` | Projektstatus. |
| `layout: wide` | Interaktive Diagramme (`.interactive-figure`) brechen symmetrisch bis 1080 px aus der Textspalte aus; Text, Code, Tabellen und Linien behalten die Spaltenbreite aller Seiten. |
| `styles`, `scripts` | Zusätzliche CSS- und JavaScript-Dateien unter `/assets/` nur für diese Seite, z. B. `styles: [/assets/site/contact.css]`. |

## Bilder und Formeln

Bilder liegen beim jeweiligen Beitrag unter `public/img/<Bereich>/<Slug>/`, beispielsweise `public/img/projects/mein-projekt/`. Formeln zwischen eigenen `$$`-Zeilen und Formeln im Text zwischen einfachen `$` werden beim Build in MathML umgewandelt, auch in eingebettetem HTML wie Bildunterschriften. Im Text darf direkt hinter dem öffnenden und vor dem schließenden `$` kein Leerzeichen stehen; `\$` ergibt ein Dollarzeichen. In Code bleiben `$` unverändert. Mehrzeilige Formeln setzt man mit `\begin{align*} … \end{align*}`.

```markdown
![Versuchsaufbau](/img/projects/mein-projekt/versuchsaufbau.jpg)

[Verwandtes Projekt](/projects/msci.html)

Für $\mu\to\infty$ strebt $x^\star(\mu)$ gegen $x_\mathrm{a}$.

$$
x_{k+1}=Ax_k+Bu_k
$$
```

Statische Abbildungen (`<figure class="static-figure">`) werden in ihrer `width` gezeigt und nur verkleinert. Mit `class="static-figure full-width"` füllt die Grafik die Textspalte; das eignet sich für SVG-Diagramme.

Markdown unterstützt Tabellen, Codeblöcke und HTML. Eingebettetes HTML wird unverändert übernommen.

### Codeblöcke mit Sprach-Reitern

Zwei oder mehr unmittelbar aufeinanderfolgende Codeblöcke mit demselben `tab="..."`-Attribut werden zu einer Gruppe mit Reitern zusammengefasst, zum Beispiel eine Python- und eine MATLAB-Fassung desselben Algorithmus:

````markdown
```python tab="Python"
def f(x):
    return x**2
```

```matlab tab="MATLAB"
function y = f(x)
    y = x^2;
end
```
````

Das Umschalten läuft ohne JavaScript über versteckte native Radio-Buttons (`assets/site/style.css`, Klassen `code-tab-*`); ein `CodeTabsPreprocessor` in `scripts/build.py` fasst die Blöcke vor der eigentlichen Markdown-Verarbeitung zusammen. Eine Gruppe braucht mindestens zwei Blöcke; ein einzelner Codeblock ohne `tab="..."` bleibt ein gewöhnlicher Codeblock.

## Interaktive Diagramme

Eigenständige HTML-Diagramme liegen gemeinsam mit den Bildern unter `public/img/<Bereich>/<Slug>/`. Der Build übernimmt sie nach `/img/<Bereich>/<Slug>/`. Ein Beitrag kann sie direkt einbetten:

```html
<figure class="interactive-figure">
  <iframe src="/img/projects/msci/single.html" title="MSCI World: Indexverlauf" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/projects/msci/single.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>
```

Die Schriftgrößen der Achsen und Bedienelemente werden für MSCI in `assets/projects/msci/charts.js` über `fontSize` und `titleSize` eingestellt. Die Darstellung der Einbettung steht in `assets/site/style.css`. Dafür müssen die Diagramme nicht neu exportiert werden.

Das Projekt steht in `content/projects/msci.md`. Die sieben Exporte aus ShowMeMSCI lassen sich erneut importieren:

```powershell
python scripts/import_msci.py C:/pfad/zum/msci-repository
```

Der Import übernimmt die vorhandenen Plotly-Daten und Bedienelemente in eine reduzierte HTML-Hülle. Die Quelldateien bleiben unverändert. Dabei übersetzt er Beschriftungen, Knöpfe, Tooltips und die historischen Einordnungen der Jahre ins Deutsche (Texte in `scripts/msci_german.py`, Zahlen mit Dezimalkomma), ergänzt im Diagramm der Haltedauern eine Legende und im Renditedreieck eine Farbskala und schneidet die Achse der Jahresverläufe auf den Datenbereich zu. `tests/test_msci_charts.py` prüft, dass keine englischen Beschriftungen übrig bleiben; kommen im Export neue Texte oder ein neues Jahr hinzu, gehören sie in `scripts/msci_german.py`.

Die Diagramme 08 (Abstand zum Höchststand) und 09 (Sparplan) stammen nicht aus ShowMeMSCI, sondern aus `scripts/msci_extra.py`, das dieselben Tageskurse aus dem Repository liest (`src/data/raw/MSCI_World_daily.csv`) und Preise und Wechselkurse aus `scripts/data/msci/`:

- `CPIAUCNS.csv`: US-Verbraucherpreise CPI-U, nicht saisonbereinigt, von [FRED](https://fred.stlouisfed.org/series/CPIAUCNS); fehlende Monate wie Oktober 2025 werden linear interpoliert.
- `VPI-Deutschland-Bundesbank.csv`: Verbraucherpreisindex Deutschland (Destatis, 2020 = 100) ab 1991 aus der [Zeitreihendatenbank der Bundesbank](https://api.statistiken.bundesbank.de/rest/data/BBDP1/M.DE.N.VPI.C.A00000.I20.A?format=csv&lang=de); davor `DEUCPIALLMINMEI.csv` (OECD, Westdeutschland, über FRED; die Reihe endet 2025), verkettet im Januar 1991.
- `EXUSEU.csv` und `EXGEUS.csv`: Monatsmittel der Wechselkurse von FRED, Dollar je Euro ab 1999 und D-Mark je Dollar davor, umgerechnet mit 1,95583 D-Mark je Euro.

Der Sparplan rechnet daraus drei Ansichten (nominal in Dollar, real in US-Kaufkraft, real in Euro und deutscher Kaufkraft), und das Skript gibt die Kennzahlen in beiden Währungen aus:

```powershell
.venv\Scripts\python.exe scripts/msci_extra.py C:/pfad/zum/msci-repository
```

Es schreibt `public/img/projects/msci/drawdown.html`, `sparplan.html` und die Monatsdaten `assets/projects/msci/sparplan-data.mjs` und gibt die Zahlen aus, die im Projekttext stehen (nominale und reale Jahresrendite, die größten Einbrüche). Die Sparplan-Rechnung liegt in `assets/projects/msci/sparplan.mjs`; `node --test tests/msci-sparplan.test.mjs` prüft sie samt der zitierten Spannweite der 20-Jahres-Sparpläne. Bei neuen Daten die Zahlen im Text abgleichen. Den Datenstand in den Quellenzeilen der Diagramme lesen beide Skripte aus dem letzten Handelstag der Kursdatei; im Projekttext steht er von Hand (Zeile „Datenstand“).

Neue Kurse: das Download-Notebook von ShowMeMSCI (`src/notebooks/download_data.ipynb`, yfinance) lädt die ganze Reihe neu; ein Eintrag für den laufenden oder einen Wochenendtag am Ende ist unfertig und gehört weg (Enddatum auf den letzten abgeschlossenen Handelstag setzen). Danach die sieben `src/plots/plot_*.py` im Repository-Verzeichnis ausführen (`PYTHONPATH=src/plots`, Umgebung des Repositorys), dann `import_msci.py` und `msci_extra.py`. Die Preise und Wechselkurse in `scripts/data/msci/` nachladen (FRED: `https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCNS` bzw. `EXUSEU`; Bundesbank wie oben), wenn der Sparplan weiter reichen soll; er endet mit dem letzten Monat, für den Kurs, beide Preisindizes und Wechselkurs vorliegen. Im Oktober 2026 wurde so in einer Kopie des Repositorys aktualisiert, weil es dort ungespeicherte Änderungen gab; die Kopie reproduzierte mit den alten Kursen zuerst die bisherigen Diagramme exakt. Die Plotly-Bibliothek liegt unter `assets/vendor/`; das Histogramm verwendet zusätzlich die MathJax-Einbindung des Originalexports.

### Fission or Fiction

Der Beitrag liegt in `content/projects/fissionorfiction.md`, die acht Diagrammseiten unter `public/img/projects/fissionorfiction/`. Grundlage ist der [Global Nuclear Power Tracker](https://globalenergymonitor.org/projects/global-nuclear-power-tracker/) von Global Energy Monitor (CC BY 4.0), derzeit die Ausgabe August 2026.

Die Daten liegen unter `scripts/data/fissionorfiction/`:

- `raw/` enthält die unveränderten Downloads von GEM mit ihrem ursprünglichen Dateinamen (`Global-Nuclear-Power-Tracker-<Monat>-<Jahr>.xlsx`). Diese Dateien werden nie bearbeitet; ältere Ausgaben bleiben zum Vergleich liegen.
- `corrections.csv` enthält eigene Korrekturen, eine Änderung je Zeile, getrennt durch Semikolon: `GEM unit ID;Spalte;Wert laut GEM;neuer Wert;Quelle`. Spaltennamen wie im Datenblatt, ein leerer Wert steht für „kein Wert“. Eine Korrektur wird nur angewendet, solange GEM noch den alten Wert führt; hat GEM das Feld inzwischen geändert, überspringt das Skript sie mit einer Warnung.

Für eine neue Ausgabe die Datei in `raw/` legen und das Skript ohne Argument ausführen; es nimmt die neueste Ausgabe (Monat und Jahr aus dem Dateinamen):

```powershell
python scripts/fission_charts.py
```

Es liest die Tabelle nur mit der Standardbibliothek, wendet die Korrekturen an und schreibt das Datenmodul `assets/projects/fissionorfiction/units-data.mjs` (eine Zeile je Reaktorblock, Standorte und wiederkehrende Texte getrennt, dazu Stand und Ausgabe) sowie die acht HTML-Hüllen mit der Quellenzeile. Unbekannte Statuswerte oder Reaktortypen brechen mit einer Meldung ab; neue Reaktortypen brauchen eine deutsche Bezeichnung in `TYPES`, neue Länder einen Eintrag in `countries.mjs` (der Node-Test meldet fehlende).

Alle Diagramme entstehen im Browser: `fleet.mjs` enthält die Rechnungen (Reaktoren in Betrieb und im Bau je Jahr, Bauzeiten, Laufzeit-Szenario), `countries.mjs` deutsche Ländernamen, die Farben der ursprünglichen Diagramme, Regionen und ISO-Codes, `charts.mjs` die acht Darstellungen mit Plotly 3.0.1 (`assets/vendor/`) bzw. Leaflet 1.9.4 (unpkg) und `charts.css` die Seiten. Die Standortkarte lädt Kacheln von Esri und OpenStreetMap, die animierte Weltkarte geografische Grunddaten vom Plotly-CDN; sie passt die Höhe ihres iframes selbst an.

Drei Regeln stecken in `fleet.mjs` und gehören in die Beschreibungen der Diagramme: Als in Betrieb zählen wie im Original auch abgeschaltete, aber nicht stillgelegte Blöcke (Status „mothballed“). Blöcke, die längst am Netz waren und für einen Neustart wieder als „construction“ geführt werden (Japan), zählen ebenso, ab ihrem ersten Netzanschluss. Und Datumsangaben zählen nur bei tatsächlich gebauten Blöcken, weil der Tracker für angekündigte Projekte geplante Termine führt.

`node --test tests/fission-fleet.test.mjs` prüft die Rechnungen und die im Text zitierten Zahlen, `tests/test_fission_charts.py` das Skript (Dateinamen, Korrekturen, aktuelles Datenmodul). Nach einer neuen Ausgabe schlagen beide gezielt fehl: Zahlen im Text und in den Tests abgleichen.

### Zentralpfad

Der Beitrag liegt in `content/notes/zentralpfad.md`. Die eigenständige Animation liegt unter `public/img/notes/zentralpfad/index.html`. Ihre Dateien sind unter `assets/notes/zentralpfad/` gebündelt: `style.css` für die Darstellung, `animation.mjs` für Bedienung und Zeichnung, `math.mjs` für Geometrie und Zielkosten und `barrier.mjs` für das Barriereproblem, den Zentralpfad und das exakte Optimum. Das Modell ist ein quadratisches Programm in der Ebene mit einem Viereck als zulässigem Bereich und der klassischen logarithmischen Barriere Φ(x, μ) = f(x) − μ Σ log sᵢ(x). Der Zentralpfad beginnt im analytischen Zentrum (Newton auf der Barriere allein, gestartet im Schwerpunkt des Vierecks) und endet im Optimum; ein Startpunkt ist nur Startwert des Newton-Verfahrens und kein Parameter des Problems. Für 301 logarithmisch verteilte Werte von μ zwischen 10³ und 10⁻³ wird je ein Barriereoptimum berechnet; Schieberegler und Animation wählen eines davon aus, gleichmäßig entlang der Bogenlänge des Pfads, und die Kurve wird bis zum gewählten μ gezeichnet. Bei Änderungen von Grenzen oder Ziel wird neu gerechnet, ohne μ zurückzusetzen. Die Demo benötigt keine externen Bibliotheken oder Serverberechnungen. Im Beitrag steht außerdem eine eigenständige Python- und MATLAB-Fassung der Barrieremethode (Zentrierung per Newton-Schritt mit Rückwärtssuche, äußere Schleife über μ, getrennter Zeichenteil) als Codeblöcke mit Sprach-Reitern, verifiziert gegen `barrier.mjs` und unabhängig gegen SciPy.

Abbildung 4 im Abschnitt „Umsetzung“ ist die interaktive Seite `public/img/notes/zentralpfad/zentrierung.html`: oben der ganze Zentralpfad vom Pfadpunkt x*(100) bis zum Optimum in fester Ansicht, darunter der Pseudocode der Barrieremethode oder des Prädiktor-Korrektor-Verfahrens in einem Panel in den Farben der Codeblöcke, wie in einem Debugger. Je Klick leuchten die ausgeführten Zeilen nacheinander auf, die aktuellen Werte stehen neben ihrer Zeile, der Punkt gleitet zur neuen Iterierten, und die Leiste unter dem Code zeigt μ, Schritt, Abstand und Dualitätslücke. Bei der Barrieremethode ist ein Klick das neue Ziel nach μ ← μ/κ, ein Newton-Schritt (ein von der Rückwärtssuche verkürzter voller Schritt erscheint blass) oder das Ende der Zentrierung mit Abbruchprüfung; der Reduktionsfaktor κ ist wählbar. Bei Mehrotra sind es Prädiktor und Korrektor je Iteration. Spannt die letzte Etappe oder Iteration weniger als 24 Pixel, zeigt eine Lupe unten rechts sie vergrößert, mit einer festen Ansicht für alle ihre Schritte (Faktor 1, 2 oder 5 mal eine Zehnerpotenz, das Viereck auf den Ausschnitt zugeschnitten). Die Abbildung endet bei einer Dualitätslücke unter 10⁻² (`EPSILON` in `method.mjs`), weil weitere Etappen nur kleiner, aber gleich aussähen. „Etappe ▶▶“ springt zur nächsten Etappe oder Iteration; bei `prefers-reduced-motion` entfallen die Animationen. Der Rechenkern `assets/notes/zentralpfad/method.mjs` enthält `barrierMethod` (der Lauf als Folge von Ereignissen: Start, Newton-Schritt mit Startpunkt, vollem Schritt und Newton-Dekrement, Zentrum erreicht, Abbruchprüfung, μ verkleinern; dieselbe Numerik wie der Code im Beitrag), `barrierTrace` (derselbe Lauf ab x*(μ⁽⁰⁾) in Etappen, die erste ist die Zentrierung in x*(μ⁽⁰⁾) selbst), `barrierStages` (die Etappen danach) und `predictorCorrector` (Mehrotra auf dem gestörten KKT-System, mit dem nächsten Pfadpunkt jeder Iterierten); `method.css` ergänzt `style.css`. Die Seite passt die Höhe ihres iframes an den Inhalt an; nur eine neue Breite zeichnet neu, damit eine laufende Animation nicht abbricht. Der Code im Beitrag (Python und MATLAB) ist dieselbe Barrieremethode: κ = 10, ε = 10⁻⁶, μ⁽⁰⁾ = 100, Start in x₀ = (−1, −0.8), Ausgabe „10 Etappen, 49 Newton-Schritte“; mit κ = 2 und 100 ergeben sich 30/75 und 6/33. `tests/central-path.test.mjs` prüft diese Zahlen gegen `barrierMethod` und den Text. Nach Änderungen am Code beide Fassungen ausführen, MATLAB etwa mit `matlab -batch`.

Die drei statischen Abbildungen des Beitrags unter `public/img/notes/zentralpfad/` erzeugt `scripts/zentralpfad_figures.mjs` aus demselben Löser: `kkt.svg` (Kräftegleichgewicht im Optimum und Schattenpreis der Kante BC), `barriere.svg` (eindimensionale Barriere) und `komplementaritaet.svg` (Paare aus Schlupf und Multiplikator entlang des Pfads). Das Skript gibt dabei λ* aus, das im Text steht; die Etappen und Newton-Schritte für κ = 2, 10, 100 im Abschnitt „Dem Pfad folgen“ prüft `tests/central-path.test.mjs` gegen `barrierMethod`. Nach Änderungen am Modell neu erzeugen und die Zahlen im Text abgleichen:

```sh
node scripts/zentralpfad_figures.mjs
```

Die numerischen Prüfungen laufen mit Node.js 22 oder neuer und ohne zusätzliche Pakete:

```sh
node --test tests/central-path.test.mjs
```

Sie prüfen die μ-Stützstellen, Anfang im analytischen Zentrum und Ende im Optimum, Zulässigkeit, Stationarität und Monotonie entlang des Pfads, die Unabhängigkeit vom Newton-Startpunkt, die Ableitungen, die Dualitätslücke mμ, die Abstoßung durch eine näher rückende Kante, die Entwicklung des Pfads am analytischen Zentrum, das exakte Optimum, die Begrenzung beim Verschieben des Vierecks, die Schritt-für-Schritt-Barrieremethode (Etappen und Newton-Schritte wie im Text, Zentren auf dem Pfad) sowie die Etappen und Prädiktor-Korrektor-Iterationen von Abbildung 4. Der Pages-Workflow führt sie vor der Veröffentlichung aus.

### Frozen Lake

Der Beitrag liegt in `content/notes/frozen-lake.md` und behandelt `examples/discrete_tabular.py` aus dem Projekt ReinforcementLearningExamples (nicht Teil dieses Repositories). Die Codeblöcke des Beitrags sind wörtliche Ausschnitte dieser Datei; die GIFs und SVGs unter `public/img/notes/frozen-lake/` erzeugt `scripts/frozen_lake_figures.py`, das das Originalmodul importiert und mit dessen Trainingsfunktionen rechnet. Das Skript braucht die virtuelle Umgebung jenes Projekts (gymnasium mit pygame, matplotlib, Pillow, tqdm):

```sh
<venv>/python scripts/frozen_lake_figures.py [Pfad/zu/ReinforcementLearningExamples/examples]
```

Alle Abbildungen folgen zwei Breiten (`NORMAL` = 512 px, `WIDE` = 790 px, die Textspalte); die `width`/`height`-Attribute im Beitrag entsprechen der natürlichen Größe, das CSS skaliert nur herunter, und die Bildunterschrift ist genauso breit wie das Bild (`display: table`). Die fünf Trainingsläufe über je 100 000 Episoden werden im Temp-Verzeichnis zwischengespeichert; zum Neutrainieren die Datei `frozen_lake_note_cache.npz` dort löschen. Vor dem Zeichnen gibt das Skript die Zahlen der Vergleichstabelle des Beitrags aus: die exakte Erfolgswahrscheinlichkeit jeder gierigen Politik (Politikbewertung mit dem bekannten Übergangsmodell, mit und ohne 100-Schritt-Grenze), v(s₀) und die Zustände, in denen der gierige Pfeil von q* abweicht.

Gleich nach der Beschreibung der Umgebung steht ein Politik-Editor (`public/img/notes/frozen-lake/politik.html`, eingebunden als iframe). Seine Dateien liegen unter `assets/notes/frozen-lake/`: `model.mjs` mit dem exakten Übergangsmodell von FrozenLake-v1, Wertiteration und Politikbewertung, `presets.mjs` mit den gierigen Politiken der fünf gelernten Tabellen (aus dem Zwischenspeicher von `frozen_lake_figures.py`; nach einem neuen Training dort aktualisieren), `policy.mjs` für Bedienung und Zeichnung und `style.css`. `node --test tests/frozen-lake-policy.test.mjs` prüft, dass das Modell alle Zahlen der Vergleichstabelle reproduziert; der Pages-Workflow führt den Test vor der Veröffentlichung aus.

## Gästebuch

Das Gästebuch unter `/gaestebuch.html` ist moderiert: Besucher schicken ihren Eintrag über ein Formular an einen Formulardienst, der ihn per E-Mail weiterleitet. Freigegebene Einträge werden von Hand in `content/guestbook.yml` eingetragen und erscheinen nach dem nächsten Build. Seite und Layout liegen in `templates/guestbook.html`, `assets/site/guestbook.css` und `assets/site/guestbook.js`.

**Formular anschließen.** Bei [Formspree](https://formspree.io) ein Formular anlegen und dessen Adresse (`https://formspree.io/f/…`) in `site.json` als `guestbook_form` eintragen. Solange der Eintrag leer ist, zeigt die Seite ein Baustellenschild und das Formular ist gesperrt. Das Formular fragt nur `name` und `message` ab, keine E-Mail-Adresse; dazu kommt das Honeypot-Feld `_gotcha` gegen Spam-Bots. Mit JavaScript bleibt der Besucher auf der Seite und sieht eine Bestätigung; lehnt der Dienst die Übermittlung im Hintergrund ab (zum Beispiel, weil er ein Captcha zeigen will) oder ist JavaScript aus, wird das Formular normal abgeschickt und der Dienst zeigt seine eigene Bestätigungsseite.

**Eintrag freischalten.** Die Daten aus der E-Mail in `content/guestbook.yml` übernehmen, älteste Einträge zuerst:

```yaml
- name: "Anna"
  date: 2026-10-16
  message: |
    Schöne Seite!

    Ein zweiter Absatz.
  reply: "Danke, Anna!"             # optional, erscheint als „Antwort vom Webmaster“
```

Pflicht sind `name`, `date` und `message`. Der Text wird HTML-sicher übernommen, nicht als Markdown; Leerzeilen trennen Absätze. Texte mit Backslash (etwa `\o/`) in einfache Anführungszeichen oder einen `|`-Block setzen, denn in doppelten Anführungszeichen ist `\` in YAML ein Escape-Zeichen. Ein fehlerhafter Eintrag bricht den Build ab; die Fehlermeldung nennt seine Nummer. Das blinkende „NEU!“ erscheint 30 Tage lang nach dem Datum eines Eintrags; alle Animationen ruhen, wenn das Betriebssystem reduzierte Bewegung verlangt.

## Kontaktformular

Die About-Seite enthält unter „Kontakt“ ein Formular im Stil einer Luftpost-Postkarte (HTML direkt in `content/about.md`, Aussehen und Verhalten in `assets/site/contact.css` und `assets/site/contact.js`, eingebunden über `styles`/`scripts` im Kopf der Seite). Es schickt Nachricht, Name und E-Mail-Adresse an dieselbe Formspree-Adresse wie das Gästebuch, mit dem Betreff „Kontakt über alexanderblinn.com“; das Feld `email` setzt Formspree als Antwortadresse. Für ein eigenes Formspree-Formular die Adresse im `action`-Attribut in `content/about.md` ändern. Darunter steht die E-Mail-Adresse als `mailto:`-Link. Sie wird erst im Browser aus `data-user` und `data-domain` zusammengesetzt, damit Adresssammler sie nicht im HTML finden; ohne JavaScript erscheint sie als „alexander.blinn (at) outlook.de“.

## Verzeichnisübersicht

Für jeden Beitrag gilt dieselbe Zuordnung über Bereich (`projects` oder `notes`) und Slug. Zusätzliche Ordner werden nur angelegt, wenn sie gebraucht werden; eine reine Textnotiz benötigt ausschließlich ihre Markdown-Datei.

```text
content/notes/zentralpfad.md          Beitrag
assets/notes/zentralpfad/            CSS und JavaScript
public/img/notes/zentralpfad/        Diagramme, Bilder und Downloads

content/projects/msci.md            Beitrag
assets/projects/msci/               CSS und JavaScript
public/img/projects/msci/           Diagramme, Bilder und Downloads
```

`assets/site/` enthält das gemeinsame Seitendesign; `assets/vendor/` enthält unveränderte Bibliotheken mit Lizenzdateien. Beitragsspezifische Dateien gehören in die passenden Unterordner. `public/` wird unverändert nach `dist/` kopiert, `assets/` nach `dist/assets/`. Dateien unter `public/` und `assets/` sind dadurch unabhängig vom Entwurfsstatus eines Beitrags öffentlich.

| Pfad | Inhalt |
| --- | --- |
| `content/notes/` | Notizen und Erklärungen. |
| `content/projects/` | Projekte und praktische Aufbauten. |
| `content/about.md` | Profiltext. |
| `content/guestbook.yml` | Freigeschaltete Gästebucheinträge. |
| `templates/home.html` | Startseite. |
| `templates/guestbook.html` | Gästebuch. |
| `templates/base.html` | Gemeinsames Seitenlayout. |
| `site.json` | Name, Domain, Beschreibung, GitHub-Link, Buy-me-a-coffee-Link (`support`) und Formularadresse des Gästebuchs (`guestbook_form`). |
| `assets/site/` | Gemeinsames CSS und Favicon. |
| `assets/projects/<Slug>/` | CSS und JavaScript eines Projekts. |
| `assets/notes/<Slug>/` | CSS und JavaScript einer Notiz. |
| `assets/vendor/` | Externe Bibliotheken und Lizenzen. |
| `public/img/<Bereich>/<Slug>/` | Diagramme, Bilder und weitere Dateien eines Beitrags. |
| `dist/` | Erzeugte Webseite; Änderungen gehören in die Quelldateien. |

## Build und GitHub Pages

```powershell
.venv\Scripts\python.exe scripts/build.py
.venv\Scripts\python.exe -m unittest discover -s tests -v
```

[.github/workflows/pages.yml](../.github/workflows/pages.yml) baut und veröffentlicht `dist/` bei einem Push auf `main`. Ein manueller Start ist unter **Actions → Publish website → Run workflow** möglich.

GitHub Pages verwendet unter **Settings → Pages → Build and deployment → Source** die Einstellung **GitHub Actions**. Die eigene Domain wird unter **Custom domain** eingerichtet; die DNS-Einträge müssen auf GitHub Pages zeigen. Der Build übernimmt die `CNAME`-Datei für `alexanderblinn.com`.

Unter jedem Beitrag in `notes/` und `projects/` steht eine Fußzeile mit dem Link zur Übersicht und dem Buy-me-a-coffee-Knopf. `scripts/build.py` erzeugt sie einmal zentral aus dem Eintrag `support` in `site.json`; fehlt der Eintrag, entfällt der Knopf. Das Logo liegt in `assets/site/buymeacoffee.svg`.

Alte Diagramm-URLs stehen als Weiterleitungen in `site.json` unter `redirects`. Der Build erzeugt dafür kleine HTML-Seiten ausschließlich in `dist/`; die eigentlichen Diagramme bleiben nur einmal unter ihrem neuen Pfad liegen. Nach Änderungen an `scripts/build.py` den lokalen Vorschau-Server neu starten.
