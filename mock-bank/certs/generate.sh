#!/usr/bin/env bash
# Generate self-signed TLS certs for Mock Bank (IMPLEMENTATION.md §3).
# Run from repo root: bash mock-bank/certs/generate.sh
#
# Uses explicit end-entity extensions so rustls (used by tlsn-verifier-server)
# accepts the cert. By default, `openssl req -x509` sets CA:true which causes
# rustls to reject the cert with "CaUsedAsEndEntity".
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout server.key -out server.cert \
  -days 365 -subj "/CN=localhost/O=Mock Bank" \
  -addext "basicConstraints=critical,CA:FALSE" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
  -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth"
echo "Generated server.key and server.cert in $DIR"
