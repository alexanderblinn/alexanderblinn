"""Create one Markdown draft without overwriting an existing contribution."""
import argparse
from datetime import date
import json
from pathlib import Path
import re

parser = argparse.ArgumentParser(description='Neuen Markdown-Entwurf anlegen')
parser.add_argument('section', choices=['notes', 'projects', 'research'])
parser.add_argument('slug', help='Dateiname, z. B. mein-erster-versuch')
parser.add_argument('--title', required=True, help='Titel des Beitrags')
args = parser.parse_args()
if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.slug):
    parser.error('Der Slug darf nur Kleinbuchstaben, Zahlen und einzelne Bindestriche enthalten.')
target = Path(__file__).resolve().parent.parent / 'content' / args.section / f'{args.slug}.md'
title = json.dumps(args.title, ensure_ascii=False)
content = f'''---
title: {title}
date: {date.today().isoformat()}
description: ""
tags: []
draft: true
---

## Die Idee

'''
try:
    with target.open('x', encoding='utf-8') as file:
        file.write(content)
except FileExistsError:
    parser.error(f'Datei existiert bereits: {target}')
print(f'Entwurf angelegt: {target}')
print('Zum Veröffentlichen draft: false setzen und die Seite neu bauen.')
