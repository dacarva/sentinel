# Sentinel Landing Page Strategy: "The Protocol of Verifiable Truth"

## 1. Core Narrative Pivot
**From:** "A Private Financial Passport" (Static, Consumer-only, Vague).  
**To:** "The Proof Engine for Source-Truth" (Dynamic, Institutional-grade, Process-focused).

**The Hook:** Stop sending insecure PDFs. Sentinel uses **zkTLS** and **AI-generated ZK Circuits** to prove facts directly from any web source (Banks, Gov, SaaS) without ever exposing your raw data.

---

## 2. Section-by-Section Copy Strategy

### A. The Hero Section (The Hook)
*   **Headline:** Verify the Fact. Hide the Data.
*   **Subhead:** The world’s first Proof Engine powered by zkTLS. Prove your bank balance, income, or credentials directly from the source—without revealing your identity or private history. 
*   **Primary CTA:** Generate Your First Proof
*   **Secondary CTA:** Explore the Trust Architecture
*   **UX Note:** Remove the "Backed By" placeholders unless they are real. Trust-signal inflation kills a security product.

### B. The "AI-Architect" Section (The Magic & Growth)
*   **Headline:** Natural Language to ZK Circuits.
*   **Copy:** 
    > "I want to prove my Bancolombia balance is over 1M COP."
    > 
    > Tell Sentinel what you want to reveal. Our AI builds and deploys a custom **Noir ZK Circuit** for that specific data source instantly.
*   **The Network Effect:** Once a circuit is built (e.g., for a specific bank API), it becomes part of the **Sentinel Global Library**. The next user can use it immediately by just setting their own threshold.
*   **Visual:** A terminal-like interface showing a prompt being converted into a cryptographic receipt.

### C. The "Andrés" Journey (The Relatable Entry)
*   **Headline:** Andrés needed a loan. He didn't want to share his life.
*   **The Conflict:** To get a cross-border loan, Andrés was asked for 6 months of bank statements. Every coffee purchase, medical bill, and personal habit would be exposed to a stranger.
*   **The Sentinel Way:** Andrés connected his bank via the Sentinel Extension. He generated a single "Trust Link" proving his average monthly income and current solvency.
*   **The Result:** The lender received a **Mathematical Guarantee**—not a fakeable PDF. Andrés kept his privacy. The bank got instant certainty.

### D. Institutional Power Play (B2B Use Cases)
*   **Headline:** Verification at the Speed of Software.
*   **Use Cases:**
    *   **M&A Exploratory Talks:** Prove assets and runway to partners without revealing your full cap table or transaction history.
    *   **Compliant DeFi:** Access institutional liquidity pools (e.g., Aave) by proving solvency and AML compliance privately.
    *   **Joint Ventures:** Verify operational health and audit-readiness between companies without cross-exposing PII.
    *   **Age/Residency:** Prove your users are over 18 or live in a specific region without seeing their passports.

### E. The Mechanics of Trust (Technical Deep Dive)
*   **Headline:** The "Blindfolded Notary" Principle.
*   **Key Pillars:**
    *   **zkTLS:** We extend the standard TLS handshake so a 3rd party (The Notary) can verify the data's origin without seeing the data itself.
    *   **Local-First Enclave:** All data extraction and proof generation happen on **your device**. Raw data never touches our servers.
    *   **Ephemeral Notary:** Our server acts as an MPC (Multi-Party Computation) participant to sign the session, ensuring it hasn't been tampered with. It sees the "Envelope," not the "Letter."

---

## 3. The "Verifier Experience" (The Product "End-Game")

This is the most critical missing piece. When someone clicks a Sentinel Link, they shouldn't see a landing page—they should see a **Verification Receipt**.

### Layout of the "Trust Link" Page:
1.  **Status Badge:** `[ VERIFIED BY SENTINEL PROTOCOL ]` (Green, Pulsing).
2.  **The Fact:** "User has proven a balance of **> 1,000,000 COP** at **Bancolombia**."
3.  **Timestamp:** "Verified on March 4, 2026, at 14:02 UTC."
4.  **Source Integrity:** "Cryptographic proof that this data originated from `https://api.bancolombia.com` via a TLS 1.3 session."
5.  **Technical Proof (Dropdown):**
    *   `Session Hash: 0x71...f3e`
    *   `ZK-Circuit: Noir/BalanceThreshold_v1`
    *   `Notary Signature: [Verified]`
6.  **Action:** "Download Verification JSON" (for automated systems).

---

## 4. Inconsistency & UX Audit Summary

*   **Identity Crisis:** The current page is 50% "Passport App" and 50% "Infrastructure." We should frame it as a **Protocol** that powers a **Passport**.
*   **PDF Obsession:** Use PDFs as the "Old World" example, but focus on the "New World" of **Programmatic Trust**.
*   **Growth Strategy:** Explicitly mention that the more people use Sentinel, the more "Sources" are added to the library, making it the "Wikipedia of Verifiable Truth."
*   **Friction Transparency:** Be honest about the browser extension for the web use case. Frame it as your "Personal Security Enclave."

---

## 5. Next Steps for Implementation
1.  **Rewrite Hero Section:** Focus on "Verify the Fact. Hide the Data."
2.  **Add AI Section:** Explain the natural language to ZK circuit flow.
3.  **Build the "Verification View":** This is the core "product" that users share.
4.  **Update README:** Align with the actual TLSN/Noir architecture.
