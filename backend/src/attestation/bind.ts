/**
 * Bind user_address to attestation — IMPLEMENTATION.md §3.3, §7.
 * Validate 42-char hex with 0x; inject into attestation payload.
 */
import type { Attestation } from "../types.js";

const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;

export function bindUserAddress(attestation: Attestation, user_address: string): void {
  if (!ADDRESS_REGEX.test(user_address)) {
    throw new Error(
      "user_address must be 42 characters: 0x followed by 40 hex digits"
    );
  }
  attestation.user_address = user_address;
}
