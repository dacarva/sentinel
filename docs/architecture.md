# Project Sentinel - Architecture Overview

> Privacy-preserving bridge from Web2 financial data to on-chain DeFi.

## System Overview

Sentinel is built as a **5-layer pipeline** where each layer transforms trust from one domain to the next:

| Layer | Component | Role |
|-------|-----------|------|
| 1 | **zkTLS Attestation** | Proves bank data came from a real HTTPS session |
| 2 | **ZK Proof (Noir)** | Proves eligibility ("balance > threshold") without revealing the balance |
| 3 | **Smart Contracts** | Verifies the proof on-chain and gates access |
| 4 | **Account Abstraction (Safe)** | Provides gasless, user-friendly transaction execution |
| 5 | **DeFi (Aave V3)** | Executes the actual supply/borrow against verified users |

---

## System Architecture

```mermaid
graph TB
    subgraph "Layer 1: zkTLS Attestation"
        BANK["Bank HTTPS Server"]
        RECLAIM["Reclaim Protocol SDK"]
        ATT["Signed Attestation<br/>(data, hash, signature)"]
    end

    subgraph "Layer 2: ZK Proof Generation"
        NOIR["Noir Circuit<br/>(balance_check)"]
        BB["Barretenberg Backend"]
        PROOF["ZK Proof + Public Inputs"]
    end

    subgraph "Layer 3: On-Chain Verification"
        UV["UltraVerifier.sol<br/>(auto-generated)"]
        SV["SentinelVerifier.sol<br/>(wrapper + registry)"]
    end

    subgraph "Layer 4: Account Abstraction"
        SAFE["Safe Smart Account"]
        MOD["Safe4337Module"]
        BUNDLER["Pimlico Bundler"]
        EP["EntryPoint v0.7"]
    end

    subgraph "Layer 5: DeFi Execution"
        VAULT["SentinelVault.sol"]
        POOL["Aave V3 Pool<br/>(Sepolia)"]
        ATOKEN["aUSDC / aWETH"]
    end

    BANK -->|"TLS session"| RECLAIM
    RECLAIM -->|"signed claim"| ATT
    ATT -->|"private input"| NOIR
    NOIR --> BB
    BB -->|"prove"| PROOF
    PROOF -->|"calldata"| UV
    UV -->|"verify"| SV
    SV -->|"register verified"| VAULT
    SAFE -->|"UserOp"| MOD
    MOD --> BUNDLER
    BUNDLER --> EP
    EP -->|"execute"| SAFE
    SAFE -->|"delegatecall"| VAULT
    VAULT -->|"supply()"| POOL
    POOL -->|"mint"| ATOKEN
```

---

## End-to-End Data Flow

```mermaid
sequenceDiagram
    actor User
    participant Bank as Bank HTTPS
    participant Reclaim as Reclaim SDK
    participant Noir as Noir Circuit
    participant BB as Barretenberg
    participant SV as SentinelVerifier
    participant Safe as Safe Account
    participant Bundler as Pimlico
    participant EP as EntryPoint
    participant Vault as SentinelVault
    participant Aave as Aave V3 Pool

    User->>Bank: Login & request balance
    Bank-->>Reclaim: TLS session intercepted
    Reclaim-->>User: Signed attestation (data, hash, sig)

    Note over User,BB: Client-side proof generation (~2s)
    User->>Noir: Private inputs (balance, attestation_data)
    User->>Noir: Public inputs (threshold, attestation_hash)
    Noir->>BB: Compiled circuit + witness
    BB-->>User: ZK proof bytes

    User->>SV: verifyAndRegister(proof, publicInputs)
    SV->>SV: UltraVerifier.verify() + store isVerified[user]
    SV-->>User: ProofVerified event

    Note over User,Aave: Gasless execution via Account Abstraction
    User->>Safe: Sign UserOp (supply USDC to Aave)
    Safe->>Bundler: Submit UserOp
    Bundler->>EP: handleOps()
    EP->>Safe: validateUserOp + execute
    Safe->>Vault: supplyToAave(USDC, amount)
    Vault->>Vault: require(isVerified[msg.sender])
    Vault->>Aave: pool.supply(USDC, amount, safe, 0)
    Aave-->>Safe: aUSDC minted to Safe
```

---

## Smart Contract Interactions

```mermaid
graph LR
    subgraph "Noir Toolchain (off-chain)"
        CIRCUIT["balance_check.nr"]
        VK["Verification Key"]
    end

    subgraph "Ethereum Sepolia"
        UV["UltraVerifier.sol"]
        SV["SentinelVerifier.sol"]
        VAULT["SentinelVault.sol"]
        SAFE["Safe Proxy"]
        POOL["Aave V3 Pool"]
        USDC["USDC"]
        AUSDC["aUSDC"]
    end

    CIRCUIT -->|"bb contract"| UV
    CIRCUIT -->|"bb write_vk"| VK

    UV -->|"verify(proof, inputs)"| SV
    SV -->|"isVerified mapping"| VAULT

    SAFE -->|"delegatecall"| VAULT
    VAULT -->|"supply()"| POOL
    USDC -->|"transferFrom"| POOL
    POOL -->|"mint"| AUSDC

    SV -.->|"reads"| UV
    VAULT -.->|"reads"| SV
```

**Contract deployment order:**
1. `UltraVerifier.sol` - auto-generated from Noir circuit
2. `SentinelVerifier.sol(ultraVerifier, threshold)` - wraps verifier + maintains trust registry
3. `SentinelVault.sol(sentinelVerifier, aavePool)` - gates Aave access to verified users

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **zkTLS Provider** | TLSNotary (v0.1.0-alpha.14) | MPC-TLS browser extension + local verifier. Webhook-based verification avoids binary proof parsing. |
| **Signature verification** | Off-circuit (off-chain) | Keeps the Noir circuit small and fast (~2s proving). Attestation binding is via Pedersen hash of data. |
| **Hash function** | Pedersen (in-circuit) | Native to Noir/Barretenberg, much cheaper in-circuit than SHA-256. |
| **Public inputs** | 2 Fields (threshold + hash) | Using `Field` instead of `[u8; 32]` reduces public inputs from 34 to 2, saving ~64k gas. |
| **Smart Account** | Safe (1-of-1) | Full ERC-4337 support on Sepolia via `Safe4337Module`. Battle-tested, extensible. |
| **Target chain** | Ethereum Sepolia | Only testnet with full Aave V3 deployment + GHO token. Base Sepolia has no Aave. |
| **Bundler** | Pimlico | Free tier supports Sepolia. Compatible with Safe's `Safe4337Pack`. |
| **Trust registry** | Persistent mapping | `SentinelVerifier` stores `address => bool` on-chain. Verify once, use many times. |

---

## Trust Chain

The cryptographic binding flows unbroken from the bank's TLS session to the Aave transaction:

```
Bank TLS Session (sentinel-d75o.onrender.com, CA-signed cert)
  → MPC-TLS: Browser Extension + local Verifier co-participate in TLS handshake
    → Verifier witnesses session; sends webhook to backend (X-TLSN-Secret auth)
      → Backend stores webhook; client submits merged results[]
        → Backend subset-matches results to stored webhook → proof is verified
          → Backend signs Attestation (secp256k1, notary key)
            → POST /verify checks signature + balance threshold + tx consistency
              → isValid: true (data provably from a real TLS session)
                → ZK proof: "I know data D such that hash(D) = H and balance(D) > T"
                  → On-chain verification: UltraVerifier confirms proof validity
                    → SentinelVerifier registers address as verified
                      → SentinelVault gates Aave access to verified addresses only
                        → Aave V3 executes supply/borrow for the Safe account
```

**What is proven without revealing:**
- The user has a bank balance above a threshold (without revealing the exact balance)
- The data came from a legitimate TLS session (without revealing account details)
- The user's address is cryptographically linked to this proof (without revealing PII)

---

## Monorepo Structure

```
zk-credit/
├── circuits/                  # Noir ZK circuits
│   └── balance_check/
│       ├── Nargo.toml
│       ├── src/main.nr        # Circuit: balance > threshold + attestation binding
│       └── Prover.toml
├── contracts/                 # Solidity (Foundry)
│   ├── foundry.toml
│   ├── src/
│   │   ├── UltraVerifier.sol  # Auto-generated from Noir circuit
│   │   ├── SentinelVerifier.sol  # Proof verification + trust registry
│   │   └── SentinelVault.sol  # Aave integration, gated by verification
│   ├── script/                # Deployment scripts
│   └── test/                  # Foundry tests
├── app/                       # TypeScript application
│   ├── src/
│   │   ├── attestation/       # Reclaim SDK / mock attestation
│   │   ├── proof/             # Noir proof generation (noir_js + bb)
│   │   ├── aa/                # Safe + ERC-4337 + Pimlico
│   │   └── aave/              # Aave V3 interaction helpers
│   └── package.json
├── docs/                      # Architecture documentation
│   ├── architecture.md
│   └── architecture.excalidraw
└── specs/                     # Project specifications
    ├── initial-idea.md
    └── project-overview.md
```
