/**
 * Bind tests — validate user_address; inject into attestation.
 */
import { describe, test, expect } from "bun:test";
import { bindUserAddress } from "../bind.js";
import type { Attestation } from "../../types.js";

const baseAttestation: Attestation = {
  id: "id",
  user_address: "",
  timestamp: new Date().toISOString(),
  notary: { signature: "sig", public_key: "pk" },
  disclosed_data: {
    balance: 1000,
    currency: "USD",
    account_id_hash: "h",
    transactions_summary: { months: [] },
  },
  status: "pending",
};

describe("bind", () => {
  test("valid 42-char hex address binds and payload includes user_address", () => {
    const att = { ...baseAttestation, user_address: "" };
    const addr = "0x1111111111111111111111111111111111111111";
    bindUserAddress(att, addr);
    expect(att.user_address).toBe(addr);
  });

  test("invalid wrong length throws", () => {
    const att = { ...baseAttestation };
    expect(() => bindUserAddress(att, "0x1234")).toThrow();
  });

  test("invalid no 0x prefix throws", () => {
    const att = { ...baseAttestation };
    expect(() =>
      bindUserAddress(att, "1111111111111111111111111111111111111111")
    ).toThrow();
  });

  test("invalid non-hex throws", () => {
    const att = { ...baseAttestation };
    expect(() =>
      bindUserAddress(att, "0x111111111111111111111111111111111111111g")
    ).toThrow();
  });
});
