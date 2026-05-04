#!/usr/bin/env python3
"""
Serve a prototype directory with CORS headers so the Figma plugin UI can fetch it.

Usage:
  python3 figma-plugin/serve.py 8080 c3_a
  python3 figma-plugin/serve.py 8081 c3_c
"""
import sys, os, http.server

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def log_message(self, fmt, *args):
        print(fmt % args)

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
directory = sys.argv[2] if len(sys.argv) > 2 else '.'
os.chdir(directory)
print(f'Serving {os.path.abspath(directory)} on http://localhost:{port}')
http.server.HTTPServer(('', port), CORSHandler).serve_forever()
