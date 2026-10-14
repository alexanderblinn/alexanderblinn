"""Check exclusive preview binding without building or touching dist/."""
from functools import partial
from http.client import HTTPConnection
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]


def load_preview_module():
    # An import must neither parse the caller's arguments nor build/start a site.
    with mock.patch.object(sys, "path", [str(ROOT / "scripts"), *sys.path]):
        import build

    specification = importlib.util.spec_from_file_location(
        "preview_under_test", ROOT / "scripts/serve.py"
    )
    module = importlib.util.module_from_spec(specification)
    with mock.patch.object(sys, "argv", ["test_serve.py", "--not-a-preview-option"]), \
            mock.patch.object(build, "build", side_effect=AssertionError("Import started a build")), \
            mock.patch.object(ThreadingHTTPServer, "__init__",
                              side_effect=AssertionError("Import started a server")):
        specification.loader.exec_module(module)
    return module


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


class PreviewServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.preview = load_preview_module()

    def assert_port_stays_with_first_server(self, first_server_class):
        with tempfile.TemporaryDirectory(prefix="journal-preview-test-") as directory:
            contents = b"The original preview still responds."
            (Path(directory) / "index.html").write_bytes(contents)
            handler = partial(QuietHandler, directory=directory)
            with first_server_class(("127.0.0.1", 0), handler) as first:
                worker = threading.Thread(
                    target=first.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True
                )
                worker.start()
                try:
                    self.assert_http_response(first.server_address, contents)
                    with self.assertRaises(OSError):
                        # Close even an unexpectedly successful second binding.
                        with self.preview.PreviewServer(first.server_address, handler):
                            pass
                    self.assert_http_response(first.server_address, contents)
                finally:
                    first.shutdown()
                    worker.join(timeout=5)
                    self.assertFalse(worker.is_alive(), "Preview thread did not stop")

    def assert_http_response(self, address, contents):
        connection = HTTPConnection(*address, timeout=3)
        try:
            connection.request("GET", "/")
            response = connection.getresponse()
            self.assertEqual(response.status, 200)
            self.assertEqual(response.read(), contents)
        finally:
            connection.close()

    def test_second_preview_cannot_take_over_port(self):
        self.assert_port_stays_with_first_server(self.preview.PreviewServer)

    @unittest.skipUnless(sys.platform == "win32", "Windows shared-address behavior")
    def test_preview_rejects_port_used_by_reusable_standard_server(self):
        class ReusableServer(ThreadingHTTPServer):
            allow_reuse_address = True

        self.assert_port_stays_with_first_server(ReusableServer)


if __name__ == "__main__":
    unittest.main()
