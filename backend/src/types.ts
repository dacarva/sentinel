/**
 * Shared types — IMPLEMENTATION.md §2.
 */

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  address: string;
}

export interface BankAccount {
  accountId: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  date: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
}

export interface TransactionSummary {
  months: {
    month: string; // YYYY-MM
    tx_count: number;
  }[];
}

export interface DisclosedData {
  balance: number;
  currency: string;
  account_id_hash: string;
  transactions_summary: TransactionSummary;
}

/** Single handler result from plugin prove() (JS plugin flow). */
export interface ProofResultItem {
  type: string;
  part: string;
  action: string;
  params?: { type?: string; path?: string; key?: string };
  value: string;
}

/** Presentation format from app when using execCode + prove() results (JS plugin). */
export interface JsPresentation {
  results: ProofResultItem[];
  /** Optional bank identifier set by the plugin (e.g. 'bancolombia'). */
  bank?: string;
}

/** ZK public inputs attached to a v3 presentation. */
export interface ZkProofPayload {
  /** Hex-encoded Barretenberg UltraHonk proof bytes. */
  proof: string;
  publicInputs: {
    /** Hex-encoded sha256(balance_le_bytes || blinder) commitment. */
    commitment: string;
    /** Public threshold used in proof (e.g. 1_000_000). */
    threshold: number;
  };
}

/** v3 ZK presentation: JS results for TLS session binding + a Noir proof. */
export interface JsPresentationWithZk extends JsPresentation {
  zkProof: ZkProofPayload;
}

/** v3 disclosed data — stores commitment and proof, never the raw balance. */
export interface ZkDisclosedData {
  /** sha256(balance_le_bytes || blinder) hex — binds proof to a specific balance. */
  commitment: string;
  /** Public threshold used in proof. */
  threshold: number;
  /** ISO 4217 currency code (still revealed). */
  currency: string;
  /** SHA-256 of account number (still revealed). */
  account_id_hash: string;
  /** Hex-encoded Barretenberg UltraHonk proof bytes. */
  balance_proof: string;
}

export interface NotaryKeyPair {
  publicKey: string;
  privateKey?: string;
}

export interface Attestation {
  id: string;
  user_address: string;
  timestamp: string;
  notary: {
    signature: string;
    public_key: string;
  };
  disclosed_data: DisclosedData | ZkDisclosedData;
  proof_origin?: ProofOrigin;
  /** v2_reveal: plaintext balance stored; v3_zk: ZK proof stored, no raw balance. */
  proof_type?: "v2_reveal" | "v3_zk";
  status: "pending" | "verified" | "failed";
  errors?: string[];
}

export interface VerificationConfig {
  balanceThreshold: number;
  minTxPerMonth: number;
  consistencyMonths: number;
}

export interface VerificationResult {
  isValid: boolean;
  errors: string[];
  timestamp: string;
}

export interface JWTPayload {
  sub: string; // username
  iat: number;
  exp: number;
}

/** Handler result from TLSNotary verifier webhook */
export interface TlsnHandlerResult {
  type: string;       // 'SENT' | 'RECV'
  part: string;       // 'START_LINE' | 'BODY' | 'HEADERS'
  action: string;     // 'REVEAL' | 'PEDERSEN'
  params?: { type?: string; path?: string; key?: string };
  value: string;      // revealed value
}

/** Webhook payload sent by tlsn-extension verifier after MPC-TLS completes */
export interface TlsnWebhookPayload {
  server_name: string;
  results: TlsnHandlerResult[];
  session: { id: string };
  transcript: {
    sent: number[];
    recv: number[];
    sent_length: number;
    recv_length: number;
  };
}

/** Cryptographic binding from attestation to the originating TLS session. */
export interface ProofOrigin {
  server_name: string;      // e.g. "sentinel-d75o.onrender.com"
  session_id: string;       // TLSNotary session.id from webhook payload
  transcript_hash: string;  // SHA-256 of canonical transcript descriptor
}
