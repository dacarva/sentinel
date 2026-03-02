/**
 * Notary key pair for TLSNotary MPC simulation (IMPLEMENTATION.md §3).
 * Exports NOTARY_PUB_KEY and NOTARY_PRIV_KEY for use by attestation/verifier later.
 */
// For mock-bank-only build we use a placeholder; verifier will use same keys when built.
const NOTARY_PUB_KEY =
  "02a1b2c3d4e5f60718293645564738495060717283940515263748596071829304";
const NOTARY_PRIV_KEY =
  "a1b2c3d4e5f607182936455647384950607172839405152637485960718293041";

export { NOTARY_PUB_KEY, NOTARY_PRIV_KEY };
