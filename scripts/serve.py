"""Build, serve locally, and rebuild when content changes. No browser tooling needed."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket
import sys
import threading
import time

from build import ROOT, build


class PreviewServer(ThreadingHTTPServer):
    """A ThreadingHTTPServer that never shares its port with another server,
    so a second preview fails fast instead of silently taking over the port."""
    allow_reuse_address = False

    def server_bind(self):
        if sys.platform == 'win32':
            # Windows lets a socket bind over one with SO_REUSEADDR regardless of our own
            # flags; SO_EXCLUSIVEADDRUSE is the documented way to refuse that explicitly.
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def snapshot(root):
    files = [root / 'site.json', root / 'CNAME']
    for directory in ['content', 'templates', 'assets', 'public']:
        files.extend(p for p in (root / directory).rglob('*') if p.is_file())
    return {str(p): p.stat().st_mtime_ns for p in files if p.exists()}


def main():
    parser = argparse.ArgumentParser(description='Lokale Vorschau mit automatischem Neubau')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    build()
    server = PreviewServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(ROOT / 'dist')))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    print(f'Local: http://127.0.0.1:{args.port}', flush=True)
    print('Änderungen werden automatisch gebaut. Browser danach neu laden. Strg+C beendet die Vorschau.', flush=True)
    previous = snapshot(ROOT)
    try:
        while True:
            time.sleep(1)
            current = snapshot(ROOT)
            if current != previous:
                try:
                    build()
                except Exception as error:
                    print(f'Build fehlgeschlagen: {error}', flush=True)
                previous = current
    except KeyboardInterrupt:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
