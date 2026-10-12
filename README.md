# alexanderblinn.com

Persönliches Arbeitsjournal und Portfolio: schlichte HTML-Seiten, Schreibmaschinenschrift und Beiträge in Markdown. Ein kleiner Python-Build erzeugt daraus die fertige Webseite in `dist/`. Auf dem Webserver braucht es nur statische Dateien.

Die ersten Notes und Themenübersichten wurden als Ausgangspunkt erstellt. Passe Formulierungen und Themen an deine tatsächliche Arbeit an; konkrete Ergebnisse, Publikationen und persönliche Angaben kannst du ergänzen, sobald du sie veröffentlichen möchtest.

## Lokal ansehen

Voraussetzung: Python 3.11 oder neuer. Im Projektordner unter Windows/PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe scripts/serve.py --port 8000
```

Danach [http://127.0.0.1:8000](http://127.0.0.1:8000) öffnen. Änderungen an Beiträgen, Templates, Assets und Konfiguration werden automatisch gebaut; anschließend den Browser neu laden. `Strg+C` beendet die Vorschau.

Unter macOS/Linux stattdessen `python3 -m venv .venv` und `.venv/bin/python` verwenden.

Die Vorschau muss `dist/` ausliefern. Ein Server im Repository-Stamm oder das Öffnen einer HTML-Datei per Doppelklick funktioniert wegen der absoluten Pfade wie `/notes/` nicht korrekt. Die Startseite wird aus ihrem Template erzeugt und liegt nach dem Build in `dist/index.html`.

## Einen Beitrag hinzufügen

```powershell
.venv\Scripts\python.exe scripts/new.py notes mein-erster-versuch --title "Mein erster Versuch"
```

Das legt `content/notes/mein-erster-versuch.md` als Entwurf an. Ersetze `notes` durch `projects` oder `research`, um dort einen Eintrag anzulegen. Alternativ [templates/content-example.md](templates/content-example.md) in den gewünschten Ordner kopieren und umbenennen.

```markdown
---
title: "Mein erster Versuch"
date: 2026-10-12
description: "Was ich untersucht habe und was dabei herauskam."
tags: [mpc, simulation]
draft: true
---

Eine kurze Einleitung.

## Die Beobachtung

Hier beginnt der Beitrag.
```

Datum und Inhalt anpassen. Sobald der Beitrag erscheinen soll, `draft: false` setzen und die Seite neu bauen. Entwürfe werden auch in der lokalen Vorschau ausgeblendet. Der Dateiname bestimmt die URL, etwa `/notes/mein-erster-versuch.html`; Kleinbuchstaben, Zahlen und Bindestriche sind dafür geeignet.

| Feld | Bedeutung |
| --- | --- |
| `title` | Pflichtfeld: Titel des Beitrags. |
| `date` | Optionales Datum im Format `YYYY-MM-DD`. |
| `description` | Kurzer Text für die Übersicht. |
| `tags` | Liste von Schlagwörtern, zum Beispiel `[mpc, energie]`. |
| `draft: true` | Beitrag vollständig vom Build ausschließen. |
| `featured: true` | Projekt für die Startseite auswählen. |
| `kind: build` | Praktischen Aufbau innerhalb von Projects kennzeichnen. |
| `status` | Optionaler Projektstatus, beispielsweise `Themennotiz`. |

## Bilder, Formeln und Links

Bilder unter `public/images/` ablegen und in Markdown einbinden:

```markdown
![Beschreibung des Aufbaus](/images/versuchsaufbau.jpg)

[Verwandte Notiz](/notes/lqr-intuition.html)
```

Formeln stehen zwischen zwei eigenen `$$`-Zeilen:

```latex
$$
x_{k+1}=Ax_k+Bu_k
$$
```

Der Build wandelt sie in natives MathML um; ein externes CDN ist dafür nicht nötig. Markdown unterstützt außerdem Tabellen, Codeblöcke und direktes HTML. HTML wird unverändert übernommen, deshalb nur eigene bzw. vertrauenswürdige Inhalte einfügen.

## Wo ändere ich was?

| Datei oder Ordner | Inhalt |
| --- | --- |
| `content/notes/` | Notizen und Erklärungen. |
| `content/projects/` | Projekte und praktische Builds. |
| `content/research/` | Forschungsfragen, später auch Papers, Poster und Vorträge. |
| `content/about.md` | Profiltext. |
| `templates/home.html` | Begrüßung und aktueller Fokus auf der Startseite. |
| `site.json` | Name, Domain, Beschreibung und GitHub-Link. |
| `templates/` | Seitenaufbau; `base.html` enthält das gemeinsame Grundgerüst. |
| `assets/style.css` | Schrift, Farben, Abstände und mobile Darstellung. |
| `public/` | Dateien, die unverändert in die Webseite kopiert werden. |
| `dist/` | Erzeugte Webseite; nicht von Hand bearbeiten. |

## Bauen und veröffentlichen

```powershell
.venv\Scripts\python.exe scripts/build.py
```

Der fertige Inhalt von `dist/` kann auf einem statischen Webserver veröffentlicht werden. Der Build übernimmt die vorhandene `CNAME`-Datei für `alexanderblinn.com`.

Für GitHub Pages liegt der Workflow in [.github/workflows/pages.yml](.github/workflows/pages.yml). Im Repository [alexanderblinn/alexanderblinn](https://github.com/alexanderblinn/alexanderblinn) unter **Settings → Pages → Build and deployment → Source** einmal **GitHub Actions** auswählen. Der Workflow baut und veröffentlicht bei einem Push auf `main`; er kann auch über **Actions → Publish website → Run workflow** gestartet werden. Details zum Verfahren stehen in der [GitHub-Pages-Dokumentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Die Domain muss in den Pages-Einstellungen als Custom domain eingerichtet sein und passend auf GitHub Pages zeigen. `CNAME` allein bestätigt keine abgeschlossene Domain-Einrichtung oder Veröffentlichung. Der lokale Build verändert keine Hosting-Einstellungen.
