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

Der Import übernimmt die vorhandenen Plotly-Daten und Bedienelemente in eine reduzierte HTML-Hülle. Die Quelldateien bleiben unverändert. Bei einem neuen Datenstand müssen die Datumsangaben im Projekttext und in `scripts/import_msci.py` mit aktualisiert werden. Die Plotly-Bibliothek liegt unter `assets/vendor/`; das Histogramm verwendet zusätzlich die MathJax-Einbindung des Originalexports.

### Fission or Fiction

Der Beitrag liegt in `content/projects/fissionorfiction.md`, die sechs Diagramme unter `public/img/projects/fissionorfiction/`. Die Originalexporte lassen sich erneut übernehmen:

```powershell
python scripts/import_fission.py C:/pfad/zum/fissionorfiction
```

Der Import übernimmt Daten, Animationen und Filter sowie die im Original enthaltene Plotly-Version 2.27.0. Die zugehörigen Dateien liegen unter `assets/projects/fissionorfiction/`: `charts.js` und `charts.css` für die Plotly-Diagramme, `map.js` und `map.css` für Schrift und Hoverboxen der Standortkarte. Die animierte Karte nutzt dieselbe Einbettung wie die übrigen Plotly-Diagramme; Titel und Quellenzeile innerhalb der Grafik werden ausgeblendet. Die Standortkarte verwendet die externen Leaflet-Abhängigkeiten und Kartenanbieter des Originals, die animierte Weltkarte lädt geografische Grunddaten vom Plotly-CDN. Der Datenstand bleibt Juli 2024.

### Zentralpfad

Der Beitrag liegt in `content/notes/zentralpfad.md`. Die eigenständige Animation liegt unter `public/img/notes/zentralpfad/index.html`. Ihre Dateien sind unter `assets/notes/zentralpfad/` gebündelt: `style.css` für die Darstellung, `animation.mjs` für Bedienung und Zeichnung, `math.mjs` für Geometrie und Zielkosten und `barrier.mjs` für das Barriereproblem, den Zentralpfad und das exakte Optimum. Das Modell ist ein quadratisches Programm in der Ebene mit einem Viereck als zulässigem Bereich und der klassischen logarithmischen Barriere Φ(x, μ) = f(x) − μ Σ log sᵢ(x). Der Zentralpfad beginnt im analytischen Zentrum (Newton auf der Barriere allein, gestartet im Schwerpunkt des Vierecks) und endet im Optimum; ein Startpunkt ist nur Startwert des Newton-Verfahrens und kein Parameter des Problems. Für 301 logarithmisch verteilte Werte von μ zwischen 10³ und 10⁻³ wird je ein Barriereoptimum berechnet; Schieberegler und Animation wählen eines davon aus, gleichmäßig entlang der Bogenlänge des Pfads, und die Kurve wird bis zum gewählten μ gezeichnet. Bei Änderungen von Grenzen oder Ziel wird neu gerechnet, ohne μ zurückzusetzen. Die Demo benötigt keine externen Bibliotheken oder Serverberechnungen. Im Beitrag steht außerdem eine eigenständige Python- und MATLAB-Fassung der Barrieremethode (Zentrierung per Newton-Schritt mit Rückwärtssuche, äußere Schleife über μ, getrennter Zeichenteil) als Codeblöcke mit Sprach-Reitern, verifiziert gegen `barrier.mjs` und unabhängig gegen SciPy.

Die drei statischen Abbildungen des Beitrags (`barriere.svg`, `pfadverfolgung.svg`, `abstaende.svg` unter `public/img/notes/zentralpfad/`) erzeugt `scripts/zentralpfad_figures.mjs` aus demselben Löser; nach Änderungen am Modell neu erzeugen:

```sh
node scripts/zentralpfad_figures.mjs
```

Die numerischen Prüfungen laufen mit Node.js 22 oder neuer und ohne zusätzliche Pakete:

```sh
node --test tests/central-path.test.mjs
```

Sie prüfen die μ-Stützstellen, Anfang im analytischen Zentrum und Ende im Optimum, Zulässigkeit, Stationarität und Monotonie entlang des Pfads, die Unabhängigkeit vom Newton-Startpunkt, die Ableitungen, die Dualitätslücke mμ, die Abstoßung durch eine näher rückende Kante, die Entwicklung des Pfads am analytischen Zentrum, das exakte Optimum und die Begrenzung beim Verschieben des Vierecks. Der Pages-Workflow führt sie vor der Veröffentlichung aus.

### Frozen Lake

Der Beitrag liegt in `content/notes/frozen-lake.md` und behandelt `examples/discrete_tabular.py` aus dem Projekt ReinforcementLearningExamples (nicht Teil dieses Repositories). Die Codeblöcke des Beitrags sind wörtliche Ausschnitte dieser Datei; die GIFs und SVGs unter `public/img/notes/frozen-lake/` erzeugt `scripts/frozen_lake_figures.py`, das das Originalmodul importiert und mit dessen Trainingsfunktionen rechnet. Das Skript braucht die virtuelle Umgebung jenes Projekts (gymnasium mit pygame, matplotlib, Pillow, tqdm):

```sh
<venv>/python scripts/frozen_lake_figures.py [Pfad/zu/ReinforcementLearningExamples/examples]
```

Alle Abbildungen folgen zwei Breiten (`NORMAL` = 512 px, `WIDE` = 790 px, die Textspalte); die `width`/`height`-Attribute im Beitrag entsprechen der natürlichen Größe, das CSS skaliert nur herunter, und die Bildunterschrift ist genauso breit wie das Bild (`display: table`). Die fünf Trainingsläufe über je 100 000 Episoden werden im Temp-Verzeichnis zwischengespeichert; zum Neutrainieren die Datei `frozen_lake_note_cache.npz` dort löschen. Vor dem Zeichnen gibt das Skript die Zahlen der Vergleichstabelle des Beitrags aus: die exakte Erfolgswahrscheinlichkeit jeder gierigen Politik (Politikbewertung mit dem bekannten Übergangsmodell, mit und ohne 100-Schritt-Grenze), v(s₀) und die Zustände, in denen der gierige Pfeil von q* abweicht.

## Gästebuch

Das Gästebuch unter `/gaestebuch.html` ist moderiert: Besucher schicken ihren Eintrag über ein Formular an einen Formulardienst, der ihn per E-Mail weiterleitet. Freigegebene Einträge werden von Hand in `content/guestbook.yml` eingetragen und erscheinen nach dem nächsten Build. Seite und Layout liegen in `templates/guestbook.html`, `assets/site/guestbook.css` und `assets/site/guestbook.js`.

**Formular anschließen.** Bei [Formspree](https://formspree.io) ein Formular anlegen und dessen Adresse (`https://formspree.io/f/…`) in `site.json` als `guestbook_form` eintragen. Solange der Eintrag leer ist, zeigt die Seite ein Baustellenschild und das Formular ist gesperrt. Das Formular sendet die Felder `name`, `location`, `homepage` und `message`, dazu das Honeypot-Feld `_gotcha` gegen Spam-Bots. Mit JavaScript bleibt der Besucher auf der Seite und sieht eine Bestätigung; lehnt der Dienst die Übermittlung im Hintergrund ab (zum Beispiel, weil er ein Captcha zeigen will) oder ist JavaScript aus, wird das Formular normal abgeschickt und der Dienst zeigt seine eigene Bestätigungsseite.

**Eintrag freischalten.** Die Daten aus der E-Mail in `content/guestbook.yml` übernehmen, älteste Einträge zuerst:

```yaml
- name: "Anna"
  date: 2026-10-16
  location: "Trier"                 # optional
  homepage: "https://example.org"   # optional, nur http:// oder https://
  message: |
    Schöne Seite!

    Ein zweiter Absatz.
  reply: "Danke, Anna!"             # optional, erscheint als „Antwort vom Webmaster“
```

Pflicht sind `name`, `date` und `message`. Der Text wird HTML-sicher übernommen, nicht als Markdown; Leerzeilen trennen Absätze. Texte mit Backslash (etwa `\o/`) in einfache Anführungszeichen oder einen `|`-Block setzen, denn in doppelten Anführungszeichen ist `\` in YAML ein Escape-Zeichen. Ein fehlerhafter Eintrag bricht den Build ab; die Fehlermeldung nennt seine Nummer. Das blinkende „NEU!“ erscheint 30 Tage lang nach dem Datum eines Eintrags; alle Animationen ruhen, wenn das Betriebssystem reduzierte Bewegung verlangt.

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
