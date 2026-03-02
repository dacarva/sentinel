#!/usr/bin/env bash
# Generate a local CA + TLS server cert for Mock Bank (local dev only).
#
# Creates:
#   ca.cert     — Local CA certificate (add to verifier via TLSN_EXTRA_CA_CERT)
#   ca.key      — Local CA private key (keep secret, not used by the server)
#   server.key  — Server private key
#   server.cert — Server certificate signed by ca.cert
#
# Run from repo root: bash mock-bank/certs/generate.sh
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# --- 1. Local CA (CA:TRUE so webpki accepts it as a trust anchor) ---
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout ca.key -out ca.cert \
  -days 3650 -subj "/CN=Mock Bank Local CA/O=Mock Bank Dev" \
  -addext "basicConstraints=critical,CA:TRUE,pathlen:0" \
  -addext "keyUsage=critical,keyCertSign,cRLSign"

# --- 2. Server key + CSR ---
openssl req -newkey rsa:2048 -nodes \
  -keyout server.key -out server.csr \
  -subj "/CN=localhost/O=Mock Bank"

# --- 3. Sign server cert with the local CA ---
openssl x509 -req -in server.csr -CA ca.cert -CAkey ca.key \
  -CAcreateserial -out server.cert -days 365 -sha256 \
  -extfile <(printf \
    "basicConstraints=critical,CA:FALSE\n\
subjectAltName=DNS:localhost,IP:127.0.0.1\n\
keyUsage=critical,digitalSignature,keyEncipherment\n\
extendedKeyUsage=serverAuth")

rm -f server.csr ca.srl
echo "Generated ca.cert, ca.key, server.key, server.cert in $DIR"
echo ""
echo "Point the verifier at the CA cert:"
echo "  TLSN_EXTRA_CA_CERT=$DIR/ca.cert ./target/release/tlsn-verifier-server"
