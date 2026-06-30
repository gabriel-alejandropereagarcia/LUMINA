# Lumina: Decentralized Impact Funding Protocol

Lumina is a generalized, decentralized ReFi (Regenerative Finance) protocol built on Stellar/Soroban designed to fund and verify early-stage social and clinical impact milestones. 

While its first production integration is with **MIRA AI** (an early developmental delay screening platform), Lumina is designed as an open, application-agnostic standard. Any healthtech, edtech, or clinical screening application can integrate with Lumina to unlock milestone-based escrow payments upon verified on-chain proof of impact.

---

## 🔗 Official Project Assets
*   **Interactive Presentation / Slide Deck:** [Lumina Pitch Deck](https://lumina-impact-protocol.vercel.app/presentation)
*   **Video Demo & Clinical Validation Document:** [Drive Document & Demo](https://drive.google.com/file/d/1kEHDNnzn5UxXz16Is6pA1KgRaV8OHCDp/view)

---

## 🧠 Scientific & Clinical Validation
Lumina ties capital release to concrete, evidence-based milestones. The integration with autism screening tools (such as **M-CHAT-R/F** used by MIRA) is supported by deep clinical research:

*   **M-CHAT-R/F Sensitivity:** Meta-analyses show a pooled sensitivity of **~83% (0.83)** for detecting autism spectrum disorder (ASD) in toddlers, making it a highly effective tool for early identification.
*   **Positive Predictive Value (PPV):** The probability that a child with a positive screen has ASD is estimated at **57.7%** in general populations (increasing significantly in high-risk samples). 
*   **The "Follow-Up" (F) Component:** The structured follow-up protocol is key to minimizing false positives, filtering out noise, and improving specificity before clinical escalation.
*   **Early Intervention Impact:** Identifying developmental delays during the critical 16–30 month developmental window dramatically improves long-term outcomes and reduces lifetime care costs by up to 50%.

Lumina leverages this clinical validity by requiring the MIRA Oracle to notarize SHA-256 hashes of generated clinical screening PDFs directly on the Soroban ledger, triggering escrow payouts only for verified, high-quality screenings.

---

## 🛠 How it Works (Generalized Protocol Flow)
1.  **Fund Custody:** Sponsors (governments, NGOs, impact investors) deposit USDC into the `lumina_escrow` smart contract.
2.  **Clinical Impact Event:** A caregiver completes a screening on a clinical app (like MIRA). The app generates a PDF report and computes its SHA-256 hash.
3.  **Oracle Notarization:** The clinical platform acts as a secure Oracle, signing the report hash and submitting a `release_impact` transaction to Soroban.
4.  **On-Chain Verification:** The smart contract verifies the Oracle signature, checks for duplicate hashes (preventing double-spend of clinical events), and transfers $40 USDC to the pediatrician bounty/platform wallet.
5.  **Impact Ledger:** The transaction is permanently registered on the Stellar blockchain, generating verified, auditable Impact Tokens.

---

## 🚀 Getting Started

### 1. Setup Environment
Create a `.env.local` file inside this directory:
```env
NEXT_PUBLIC_LUMINA_CONTRACT_ID="CBCSOFCBS7OYZQXF3XMWFXGB7XFMYPAW4MWQKATVLQQC3OK5C34BHYKY"
NEXT_PUBLIC_USDC_CONTRACT_ID="CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
```

### 2. Run the Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the Sponsor Dashboard and the ReFi Escrow Portal.
