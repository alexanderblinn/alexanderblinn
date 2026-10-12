"""Build, serve locally, and rebuild when content changes. No browser tooling needed."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import time

from build import ROOT, build

parser = argparse.ArgumentParser(description='Lokale Vorschau mit automatischem Neubau')
parser.add_argument('--port', type=int, default=8000)
args = parser.parse_args()


def snapshot():
    files = [ROOT / 'site.json', ROOT / 'CNAME']
    for directory in ['content', 'templates', 'assets', 'public']:
        files.extend(p for p in (ROOT / directory).rglob('*') if p.is_file())
    return {str(p): p.stat().st_mtime_ns for p in files if p.exists()}


build()
server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(ROOT / 'dist')))
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
print(f'Local: http://127.0.0.1:{args.port}', flush=True)
print('Änderungen werden automatisch gebaut. Browser danach neu laden. Strg+C beendet die Vorschau.', flush=True)
previous = snapshot()
try:
    while True:
        time.sleep(1)
        current = snapshot()
        if current != previous:
            try:
                build()
            except Exception as error:
                print(f'Build fehlgeschlagen: {error}', flush=True)
            previous = current
except KeyboardInterrupt:
    server.shutdown()
    server.server_close()
