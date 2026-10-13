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

Der Befehl erstellt `content/notes/versuch-terminalkosten.md` als Entwurf. Als Bereich sind `notes`, `projects` und `research` möglich. Alternativ kann [templates/content-example.md](../templates/content-example.md) kopiert werden.

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
| `featured: true` | Projekt auf der Startseite anzeigen. |
| `kind: build` | Praktischen Aufbau unter Projects kennzeichnen. |
| `status` | Projektstatus. |
| `layout: wide` | Breitere Inhaltsfläche für Diagramme. |

## Bilder und Formeln

Bilder liegen unter `public/images/`. Formeln zwischen eigenen `$$`-Zeilen werden beim Build in MathML umgewandelt.

```markdown
![Versuchsaufbau](/images/versuchsaufbau.jpg)

[Verwandte Notiz](/notes/lqr-intuition.html)

$$
x_{k+1}=Ax_k+Bu_k
$$
```

Markdown unterstützt Tabellen, Codeblöcke und HTML. Eingebettetes HTML wird unverändert übernommen.

## Interaktive Diagramme

Eigenständige HTML-Diagramme liegen unter `public/img/` und werden beim Build nach `/img/` übernommen. Ein Beitrag kann sie direkt einbetten:

```html
<figure class="interactive-figure">
  <iframe src="/img/single.html" title="MSCI World: Indexverlauf" height="620" loading="lazy"></iframe>
  <figcaption><a href="/img/single.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>
```

Das Projekt steht in `content/projects/msci.md`. Die sieben Exporte aus ShowMeMSCI lassen sich erneut importieren:

```powershell
python scripts/import_msci.py C:/pfad/zum/msci-repository
```

Der Import übernimmt die vorhandenen Plotly-Daten und Bedienelemente in eine reduzierte HTML-Hülle. Die Quelldateien bleiben unverändert. Bei einem neuen Datenstand müssen die Datumsangaben im Projekttext und in `scripts/import_msci.py` mit aktualisiert werden. Die Plotly-Bibliothek liegt unter `assets/vendor/`; das Histogramm verwendet zusätzlich die MathJax-Einbindung des Originalexports.

## Dateien

| Pfad | Inhalt |
| --- | --- |
| `content/notes/` | Notizen und Erklärungen. |
| `content/projects/` | Projekte und praktische Aufbauten. |
| `content/research/` | Forschungsbeiträge. |
| `content/about.md` | Profiltext. |
| `templates/home.html` | Startseite. |
| `templates/base.html` | Gemeinsames Seitenlayout. |
| `site.json` | Name, Domain, Beschreibung und GitHub-Link. |
| `assets/style.css` | Darstellung. |
| `public/` | Dateien, die unverändert übernommen werden. |
| `dist/` | Erzeugte Webseite; Änderungen gehören in die Quelldateien. |

## Build und GitHub Pages

```powershell
.venv\Scripts\python.exe scripts/build.py
.venv\Scripts\python.exe -m unittest discover -s tests -v
```

[.github/workflows/pages.yml](../.github/workflows/pages.yml) baut und veröffentlicht `dist/` bei einem Push auf `main`. Ein manueller Start ist unter **Actions → Publish website → Run workflow** möglich.

GitHub Pages verwendet unter **Settings → Pages → Build and deployment → Source** die Einstellung **GitHub Actions**. Die eigene Domain wird unter **Custom domain** eingerichtet; die DNS-Einträge müssen auf GitHub Pages zeigen. Der Build übernimmt die `CNAME`-Datei für `alexanderblinn.com`.
