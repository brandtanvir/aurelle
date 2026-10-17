#!/usr/bin/env python3
"""Static server for local development. Sends no-store so edits show up on reload."""
import http.server, socketserver, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', PORT), Handler) as httpd:
    print(f'aurelle dev server on http://127.0.0.1:{PORT}')
    httpd.serve_forever()
