# Lumina — Infraestructura ReFi Universal para Financiamiento Programable de Impacto

![Deployed on Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7D5BA6?logo=stellar&logoColor=white)
![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contract-25.0.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> **Lumina** es una capa abierta y agnóstica de Economía Regenerativa (ReFi) para el financiamiento programable de hitos de impacto — Ambiental, Social, Educación y Salud — con trazabilidad criptográfica en Stellar/Soroban.

---

## ¿Qué es Lumina?

Lumina es un **protocolo de escrow programable** que conecta capital corporativo (presupuestos de RSE, fondos ESG, impacto inversor) con aplicaciones de impacto social. Los fondos se bloquean en un smart contract de Soroban y solo se liberan cuando un oráculo autorizado certifica criptográficamente que el hito de impacto se completó.

- **Infraestructura agnóstica**: cualquier app de impacto (salud, ambiental, educativa) puede registrarse como oráculo
- **Escrow no-custodio**: los fondos pertenecen al sponsor hasta que se verifica el impacto
- **Trazabilidad criptográfica**: cada liberación genera eventos on-chain auditable en Stellar
- **Deduplicación nativa**: prevención de doble cobro mediante hash persistente en Soroban

### Caso de uso real — MIRA AI

El primer oráculo desplegado es **MIRA AI**, una herramienta de screening de neurodesarrollo infantil basada en M-CHAT-R/F. Cuando una familia completa una evaluación, MIRA calcula el hash SHA-256 del reporte, firma como oráculo autorizado, y envía `release_impact` al contrato Lumina — liberando 40 USDC del escrow del sponsor a la billetera de la plataforma.

**Validación clínica M-CHAT-R/F:**
- Sensibilidad: ~83% (0.83) en detección de TEA en niños 16-30 meses
- Valor Predictivo Positivo: 57.7% en población general
- Intervención temprana reduce costos de atención hasta 50%

---

## Arquitectura

```
                    ┌─────────────────────────────────────────────────┐
                    │              STELLAR TESTNET (Soroban)            │
                    │                                                 │
                    │   ┌───────────────────────────────────────────┐  │
                    │   │     LuminaEscrow Contract (Soroban)       │  │
                    │   │                                           │  │
                    │   │  • deposit(sponsor, amount)                │  │
                    │   │  • release_impact(oracle, sponsor,        │  │
                    │   │    amount, report_hash)                   │  │
                    │   │  • withdraw_escrow(sponsor, amount)       │  │
                    │   │  • add_oracle / remove_oracle (admin)     │  │
                    │   │  • adjust_oracle_price (time-locked 1yr)  │  │
                    │   │  • Deduplicación por hash SHA-256         │  │
                    │   └───────────────┬───────────────────────────┘  │
                    │                   │                              │
                    └───────────────────┼──────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              ┌─────┴─────┐     ┌───────┴──────┐    ┌──────┴───────┐
              │  Sponsor   │     │  MIRA Oracle  │    │  Admin Wallet│
              │  (Wallet)  │     │  (Backend)    │    │  (Governance) │
              │            │     │               │    │              │
              │ deposit    │     │ release_impact│    │ add_oracle   │
              │ USDC escrow│     │ firma hash    │    │ adjust price │
              └────────────┘     └───────────────┘    └──────────────┘
```

### Contract Addresses (Stellar Testnet)

| Recurso | Address | Explorer |
|---|---|---|
| **Lumina Escrow** | `CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA` | [stellar.expert](https://stellar.expert/explorer/testnet/contract/CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA) |
| **USDC Token (SAC)** | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` | [stellar.expert](https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA) |
| **MIRA Oracle** | `GDWOBCG7XPQZOMO7FAOJB73RDDJX4TV3OHP5CIBRYPI3TXMWRYMJ6FHV` | [stellar.expert](https://stellar.expert/explorer/testnet/account/GDWOBCG7XPQZOMO7FAOJB73RDDJX4TV3OHP5CIBRYPI3TXMWRYMJ6FHV) |
| **Admin / Platform Wallet** | `GANSQVDKALMQSXVNOBUWJGXJZ5OZFST6VVDDCOOYPQ5GSIZ2C2SHHPTF` | [stellar.expert](https://stellar.expert/explorer/testnet/account/GANSQVDKALMQSXVNOBUWJGXJZ5OZFST6VVDDCOOYPQ5GSIZ2C2SHHPTF) |

---

## Estructura del Repositorio

```
Lumina/
├── contracts/lumina_escrow/     # Smart contract Soroban (Rust)
│   ├── src/lib.rs               # Contrato principal (412 líneas)
│   └── src/test.rs              # Tests unitarios (3 tests)
├── lumina-web/                  # Portal de Sponsors (Next.js 16)
│   ├── src/app/                 # App Router
│   │   ├── page.tsx             # Landing ReFi
│   │   ├── sandbox-lumina/      # Sandbox de preview visual
│   │   ├── invest/              # Depósito USDC (Web3 + SEP-24)
│   │   ├── sponsor/             # Dashboard del Sponsor
│   │   ├── admin/               # Panel de gobernanza
│   │   ├── presentation/        # Pitch deck interactivo
│   │   └── jury/                # Portal del jurado
│   └── src/lib/
│       ├── stellar.ts           # SDK Stellar on-chain
│       └── mira_bridge.ts       # Oráculo MIRA → Soroban
├── MIRA/                        # App de screening M-CHAT-R/F
│   ├── app/api/notarize/        # Endpoint de firma del oráculo
│   └── app/api/chat/            # Endpoint de IA (Gemini)
└── customer-discovery/          # Evidencias de Customer Discovery
```

---

## Quick Start

### Prerrequisitos

- [Rust](https://rustup.rs/) (1.82+)
- [Rust target wasm32v1-none](https://developers.stellar.org/docs/build/smart-contracts/getting-started)
- [Node.js](https://nodejs.org/) 18+
- [Freighter Wallet](https://www.freighter.app/) (extensión de navegador, red Testnet)

### 1. Compilar el Smart Contract

```bash
cd contracts
rustup target add wasm32v1-none
cargo build --target wasm32v1-none --release
cargo test  # 3 tests: flujo completo, time-lock de retiro, auth no autorizada
```

### 2. Iniciar el Portal de Sponsors (lumina-web)

```bash
cd lumina-web
npm install
cp .env.local.example .env.local  # Ver abajo para variables
npm run dev
# → http://localhost:3000
```

### 3. Iniciar MIRA AI (oráculo de impacto)

```bash
cd MIRA
npm install
npm run dev
# → http://localhost:3001
```

### 4. Variables de entorno (lumina-web/.env.local)

```env
NEXT_PUBLIC_LUMINA_CONTRACT_ID="CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA"
NEXT_PUBLIC_USDC_CONTRACT_ID="CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
NEXT_PUBLIC_ADMIN_ADDRESS="GANSQVDKALMQSXVNOBUWJGXJZ5OZFST6VVDDCOOYPQ5GSIZ2C2SHHPTF"
NEXT_PUBLIC_ORACLE_ADDRESS="GDWOBCG7XPQZOMO7FAOJB73RDDJX4TV3OHP5CIBRYPI3TXMWRYMJ6FHV"
```

---

## Flujo Funcional (End-to-End)

1. **Sponsor deposita USDC** → Portal `/invest` → approve USDC SAC → `deposit(sponsor, amount)` en Soroban
2. **Familia completa screening** en MIRA → se genera reporte PDF → hash SHA-256
3. **Oráculo MIRA firma** el hash → `release_impact(oracle, sponsor, 40, report_hash)` en Soroban
4. **Contrato verifica**: oracle autorizado, price=40, hash no duplicado, saldo suficiente
5. **USDC transferido** del escrow a la platform wallet → evento `ImpactReleasedEvent` on-chain
6. **Live Impact Ledger** se actualiza → score del sponsor +1 → visible en `/sponsor`

---

## Modelo de Sustentabilidad

Lumina cobra **2.5% fee** sobre cada liberación de impacto:
- **1.0%** Desarrollo Abierto (dev bounties)
- **1.0%** Difusión y captación de sponsors
- **0.5%** Infraestructura (nodos RPC, hosting)

El **97.5%** restante va directo a la plataforma ejecutora del impacto.

---

## Roadmap

| Fase | Vertical | Estado |
|---|---|---|
| **Fase 1 (Actual)** | Salud — MIRA AI | ✅ Desplegado en Testnet |
| **Fase 2** | Ambiental — EcoForest (reforestación + verificación satelital) | 🔲 En diseño |
| **Fase 3** | Educación — EducaReFi (micro-becas programables) | 🔲 En diseño |
| **Fase 4** | Social — Vivienda, agua, seguridad alimentaria | 🔲 Futuro |

---

## Customer Discovery

Ver carpeta [`customer-discovery/`](./customer-discovery/) con las 3 entrevistas grabadas, resúmenes y metodología.

---

## Demo Video

Guion técnico segundo a segundo en [`docs/DEMO_VIDEO_SCRIPT.md`](./docs/DEMO_VIDEO_SCRIPT.md).

---

## Equipo

Construido para **Stellar PULSO Hackathon 2026** — Track PULSO Argentina.

---

## Licencia

MIT