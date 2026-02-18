# Project Sentinel - Implementation Plan

## Context

Project Sentinel is a 1-week hackathon PoC demonstrating a privacy-preserving bridge from Web2 financial data to on-chain DeFi. The system uses zkTLS attestations to prove bank balance data, Noir ZK circuits to verify eligibility without revealing PII, Safe-based Account Abstraction for UX, and Aave V3 for liquidity operations.

**Key research findings driving this plan:**
- **Aave V4** is NOT on any testnet; we use **Aave V3 on Ethereum Sepolia** (full deployment + GHO token available)
- **Base Sepolia** has no Aave deployment, so **Ethereum Sepolia** is the target chain
- **Reclaim Protocol** is recommended for the hackathon (faster integration), with TLSNotary as the production upgrade path
- **Safe** has full ERC-4337 support on Sepolia via `Safe4337Module`

---

## Architecture Overview

```
[User]
  |
  v
[1. zkTLS Attestation] ── Reclaim SDK proves bank balance from HTTPS session
  |
  v
[2. Noir Circuit] ── Proves "balance > threshold" without revealing balance (~2s)
  |  Private: balance, attestation_data
  |  Public: threshold, attestation_hash
  v
[3. On-chain Verifier] ── UltraVerifier.sol (generated from Noir circuit)
  |
  v
[4. Safe Smart Account] ── ERC-4337 UserOp via Safe4337Module + Pimlico bundler
  |
  v
[5. Aave V3 Pool] ── supply() call on Sepolia (USDC/WETH)
```

---

## Target Chain: Ethereum Sepolia (chainId: 11155111)

**Aave V3 Addresses:**
| Contract | Address |
|---|---|
| Pool | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |
| PoolAddressesProvider | `0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A` |
| Faucet | `0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D` |
| USDC | `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` |
| WETH | `0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c` |
| GHO | `0xc4bF5CbDaBE595361438F8c6a187bDc330539c60` |

> Note: All addresses from training data. Verify against `@bgd-labs/aave-address-book` before use.

---

## Phase 1: Project Scaffolding (Day 1 morning)

### 1.1 Repository Setup
- `git init`, monorepo structure
- Foundry for smart contracts, TypeScript for scripts/frontend

```
zk-credit/
├── circuits/                  # Noir circuits
│   └── balance_check/
│       ├── Nargo.toml
│       ├── src/main.nr
│       └── Prover.toml
├── contracts/                 # Solidity (Foundry)
│   ├── foundry.toml
│   ├── src/
│   │   ├── SentinelVerifier.sol
│   │   └── SentinelVault.sol
│   ├── script/
│   └── test/
├── app/                       # TypeScript scripts + frontend
│   ├── package.json
│   ├── src/
│   │   ├── attestation/       # zkTLS integration
│   │   ├── proof/             # Noir proof generation
│   │   ├── aa/                # Safe + 4337 logic
│   │   └── aave/              # Aave interaction
│   └── tsconfig.json
├── specs/
│   └── initial-idea.md
└── README.md
```

### 1.2 Install Toolchain
```bash
# Noir + Barretenberg
curl -L noirup.dev | bash && noirup
curl -L bbup.dev | bash && bbup

# Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Node deps (app/)
npm init -y
npm install ethers viem @safe-global/protocol-kit @safe-global/relay-kit
npm install @noir-lang/noir_js @noir-lang/backend_barretenberg
npm install -D typescript @types/node tsx
```

---

## Phase 2: zkTLS Attestation Engine (Day 1-2)

### 2.1 Mock Attestation Server (Day 1)
Build a mock HTTPS server that simulates a bank API response:
- Express.js server with TLS (self-signed cert for local dev)
- Endpoint: `GET /api/balance` returns `{ "account": "user123", "balance": 25000, "currency": "USD" }`
- Signs the response with a known ECDSA key pair (simulating the attestor)
- Produces an `Attestation` object: `{ data, dataHash, signature, signerPubKey, timestamp }`

### 2.2 Reclaim Protocol Integration (Day 2)
- Register app on Reclaim Developer Portal
- Create a custom provider for the mock bank (or real Bancolombia if available)
- Integrate `@reclaimprotocol/js-sdk` to capture attestations
- Extract the signed claim data and format it for the Noir circuit

**zkTLS Provider Decision: Reclaim Protocol**

| Criterion | Reclaim (chosen) | TLSNotary (future) |
|---|---|---|
| Time to first proof | ~1-2 hours | ~4-8 hours |
| On-chain verifiers | Ready-made, multi-chain | DIY |
| Privacy (attestor sees...) | Everything | Nothing (MPC) |
| Hackathon speed | Excellent | Moderate |

Reclaim is chosen for hackathon velocity. The Noir circuit interface will be designed provider-agnostic so TLSNotary can be swapped in later.

---

## Phase 3: Noir ZK Circuit (Day 2-3)

### 3.1 Circuit: `balance_check`
```noir
fn main(
    balance: u64,                       // PRIVATE
    attestation_data: [u8; 32],         // PRIVATE
    threshold: pub u64,                 // PUBLIC
    expected_attestation_hash: pub Field // PUBLIC (Pedersen hash for gas efficiency)
) {
    assert(balance > threshold);
    let computed_hash = std::hash::pedersen_hash(attestation_data);
    assert(computed_hash == expected_attestation_hash);
}
```

**Design choices:**
- `pub Field` for attestation hash instead of `[u8; 32]` → reduces public inputs from 34 to 2, saves ~64k gas
- Pedersen hash instead of SHA-256 → cheaper in-circuit, still binding
- Attestation signature verification done off-chain (keeps circuit small for hackathon)

### 3.2 On-Chain Verifier Generation
```bash
cd circuits/balance_check
nargo compile
nargo execute witness
bb write_vk -b ./target/balance_check.json -o ./target/vk
bb contract -k ./target/vk -o ../../contracts/src/UltraVerifier.sol
```

### 3.3 Proof Generation Script (TypeScript)
Using `@noir-lang/noir_js` + `@noir-lang/backend_barretenberg` to generate proofs client-side.

---

## Phase 4: Smart Contracts (Day 3-4)

### 4.1 `SentinelVerifier.sol`
Wraps the auto-generated `UltraVerifier.sol`:
- `verifyAndRegister(bytes proof, bytes32[] publicInputs)` → verifies proof, stores verified status
- Mapping: `address => bool isVerified`
- Emits `ProofVerified(address user, uint256 threshold)`

### 4.2 `SentinelVault.sol`
The "Consumer Contract" that interfaces with Aave V3:
- Only callable by verified users (checked via `SentinelVerifier`)
- `supplyToAave(address asset, uint256 amount)` → calls `IPool.supply()`
- Later: `borrowFromAave(address asset, uint256 amount)` for GHO credit lines

### 4.3 Deployment Script
Deploy to Ethereum Sepolia using Foundry:
1. Deploy `UltraVerifier.sol`
2. Deploy `SentinelVerifier.sol(ultraVerifierAddress, threshold=10000)`
3. Deploy `SentinelVault.sol(sentinelVerifierAddress, aavePoolAddress)`

---

## Phase 5: Safe Account Abstraction (Day 4-5)

### 5.1 Safe Deployment
- Deploy a Safe via `SafeFactory` on Sepolia
- 1-of-1 owner for hackathon simplicity
- Enable `Safe4337Module` for ERC-4337 compatibility

### 5.2 ERC-4337 Integration
- Bundler: **Pimlico** (free tier, supports Sepolia)
- `Safe4337Pack` from `@safe-global/relay-kit` to construct UserOperations
- UserOp flow: User signs → Bundler submits → EntryPoint validates → Safe executes

### 5.3 Custom ZK Verification Module (Nice-to-have)
If time permits, build a Safe Module that:
- Validates ZK proof before executing transactions
- Acts as a gatekeeper: only ZK-verified Safes can call Aave

---

## Phase 6: Aave V3 Integration (Day 5-6)

### 6.1 Basic Supply Flow
1. Mint test USDC from Aave faucet (`0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D`)
2. Approve USDC to Aave Pool
3. Call `pool.supply(USDC, amount, safeAddress, 0)`
4. Verify aUSDC received by Safe

### 6.2 End-to-End Flow
```
User submits bank attestation
  → Generate ZK proof (client-side, ~2s)
  → Submit proof to SentinelVerifier (on-chain)
  → User becomes "verified"
  → Safe creates UserOp to supply USDC to Aave
  → Bundler submits to EntryPoint
  → Safe executes supply via SentinelVault
  → aUSDC credited to Safe
```

---

## Phase 7: Polish & Demo (Day 6-7)

- End-to-end test script that runs the full flow
- Simple frontend (optional): React + wagmi showing the flow
- README with architecture diagram
- Demo video / presentation slides

---

## Key Dependencies

**Smart Contracts (Foundry):**
- `forge-std`
- `@account-abstraction/contracts` (v0.7)
- `@safe-global/safe-contracts` (v1.4.1)
- Aave V3 IPool interface (from `@aave/v3-core`)

**TypeScript (app/):**
- `@noir-lang/noir_js`, `@noir-lang/backend_barretenberg`
- `@safe-global/protocol-kit`, `@safe-global/relay-kit`
- `ethers` v6, `viem` v2
- `@reclaimprotocol/js-sdk`

**CLI Tools:**
- `nargo` + `bb` (Noir toolchain)
- `forge` (Foundry)
- Node.js 18+

---

## Verification Plan

1. **Circuit**: `nargo test` + `nargo prove` with mock inputs
2. **Contracts**: Foundry tests (`forge test`) for SentinelVerifier and SentinelVault
3. **Integration**: TypeScript script that runs the full flow on Sepolia:
   - Generate mock attestation → Create Noir proof → Verify on-chain → Supply to Aave
4. **AA flow**: Test UserOp submission via Pimlico bundler on Sepolia

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Noir/bb version incompatibility | Pin exact versions, verify with `noirup`/`bbup` at start |
| Aave Sepolia addresses changed | Verify against live `aave-address-book` repo before starting |
| Reclaim provider for Bancolombia unavailable | Start with mock attestation server, layer Reclaim on top |
| Paymaster too complex for timeline | Paymaster is nice-to-have; core flow works without it |
| Circuit proving too slow for large inputs | Keep attestation data small (32 bytes hash), verify signature off-circuit |
