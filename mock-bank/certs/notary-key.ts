/**
 * Notary key pair for TLSNotary MPC simulation.
 *
 * DEV-ONLY: These are placeholder values for local development.
 * In production, set NOTARY_PRIV_KEY and NOTARY_PUB_KEY environment variables
 * with a real secp256k1 key pair. Generate one with:
 *   node -e "const EC=require('elliptic').ec; const k=new EC('secp256k1').genKeyPair(); console.log('priv:', k.getPrivate('hex')); console.log('pub:', k.getPublic(true,'hex'));"
 */
const NOTARY_PUB_KEY =
  "CHANGE_ME_SET_REAL_SECP256K1_PUBLIC_KEY";
const NOTARY_PRIV_KEY =
  "CHANGE_ME_SET_REAL_SECP256K1_PRIVATE_KEY";

export { NOTARY_PUB_KEY, NOTARY_PRIV_KEY };
