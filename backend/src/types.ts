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
  disclosed_data: DisclosedData;
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
