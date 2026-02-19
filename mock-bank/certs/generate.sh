#!/usr/bin/env bash
# Generate self-signed TLS certs for Mock Bank (IMPLEMENTATION.md §3).
# Run from repo root: bash mock-bank/certs/generate.sh
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout server.key -out server.cert \
  -days 365 -subj "/CN=localhost/O=Mock Bank"
echo "Generated server.key and server.cert in $DIR"
