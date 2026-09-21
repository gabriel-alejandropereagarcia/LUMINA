# Lumina

**Impacto sin fricción.**

Hoy, una empresa quiere financiar salud, educación o asistencia. Una familia lo necesita, pero el capital se pierde en informes, meses de espera y burocracia.

Lumina lo resuelve.

La empresa paga una factura simple — sin wallets, sin cripto. La app certifica el hecho: una unidad, una cantidad. Si ocurrió, se cobra el **97,5%** en Stellar. Si no ocurrió, el capital vuelve. El usuario final nunca paga.

Nacimos en Salta. El protocolo no tiene fronteras.

[Live](https://lumina-dusky-pi.vercel.app) · [Evidencia](https://lumina-dusky-pi.vercel.app/jury) · [Portal empresa](https://lumina-dusky-pi.vercel.app/empresa) · [Registrá tu app](https://lumina-dusky-pi.vercel.app/connect#registro)

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7D5BA6?logo=stellar&logoColor=white)
![Soroban](https://img.shields.io/badge/Soroban-escrow%20v3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## El problema

Una empresa quiere financiar salud, educación o asistencia. Una familia lo necesita. El capital se pierde en informes, meses de espera y burocracia.

Eso no es un problema de un país. Es lo que pasa cada vez que el impacto se rinde en una planilla y el servicio se cobra en la puerta. En Salta lo vimos de cerca. El protocolo sirve donde haya presupuesto para ayudar y alguien que no pueda pagar.

## Qué es (y qué no)

Lumina **no** es la clínica ni el sponsor. Es el protocolo:

1. La empresa paga una **factura de servicio**. No abre Freighter. No compra cripto.
2. Una app listada en Connect certifica el hecho (unidad + cantidad, nunca un DNI).
3. El escrow Soroban paga **97,5%** a esa app y **2,5%** al protocolo, solo al `release`. Sin hecho a los 12 meses, withdraw y Lumina cobra **0%**.

**Por qué ahora.** El capital de impacto necesita trazabilidad y velocidad. Lumina convierte burocracia en ejecución inmediata.

**Visión.** Escalar desde Argentina al mundo.

MIRA (cribado) y PuenteMAE (ayuda social a docentes) son **apps de ejemplo** en Connect. Viven en otros repos. Este repo es el protocolo.

---

## Evidencia live (testnet, 19/9/2026)

| Qué | Valor |
|---|---|
| Escrow v3 | [`CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ`](https://stellar.expert/explorer/testnet/contract/CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ) |
| USDC SAC (Circle testnet) | [`CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`](https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA) |
| Deposit 40 USDC | [`9fdbc2e8…`](https://stellar.expert/explorer/testnet/tx/9fdbc2e8865a0a94339884d6345eb628c2d6ee16792ab5ebfe5f0a946765812f) |
| Release / certify | [`a26a3626…`](https://stellar.expert/explorer/testnet/tx/a26a36263013a9d38370c4ef55bb9a7f96fa860213e11f4805873b8a2995a522) |
| reportHash | `4c39fcc97b18fddae23671ccebf5bb182db64a9e9e27f5f4e01cb365b21664ca` |
| Oracle (firma) | `GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W` |
| Sponsor demo | `GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E` |

USDT0 oficial existe **solo en mainnet**. No hay token de testnet inventado. Esa prueba queda pendiente hasta una tx en [usdt0.to/transfer](https://usdt0.to/transfer).

---

## Recorre el demo

| Paso | Ruta | Qué es |
|---|---|---|
| 1 | [`/empresa`](https://lumina-dusky-pi.vercel.app/empresa) | Factura, sin Freighter. El cobro ARS está **simulado** y rotulado. |
| 2 | [`/invest`](https://lumina-dusky-pi.vercel.app/invest) | Freighter + USDC Circle testnet: `deposit` + `assign_oracle`. Live. |
| 3 | Botón **Certificar hito** en `/invest`, o hashes en [`/jury`](https://lumina-dusky-pi.vercel.app/jury) | `release_impact_asset` → 97,5% a la app. |

El PDF del portal **no** afirma un payout on-chain hasta que exista el release.

---

## Contrato

`assign_oracle` obligatorio · `OracleConfig.payout` = wallet de la app · fee `(amount * 25) / 1000` a `platform_wallet` · hash único · lock 12 meses.

```bash
cd contracts/lumina_escrow
cargo test
```

```
contracts/lumina_escrow/   Soroban (Rust)
lumina-web/                Next.js — empresa, invest, connect, jury
examples/certify.ts        Certify por API
scripts/e2e-usdc.ps1       Approve + deposit + assign + certify (40 USDC)
customer-discovery/        4 entrevistas (Salta — origen, no el TAM)
```

```bash
cd lumina-web
cp env.empresa.example .env.local
npm install
npm run dev
```

Node 22+. Freighter en testnet. USDC: [faucet.circle.com](https://faucet.circle.com/) (Stellar Testnet).

On-chain: **2,5% a una sola wallet** y **97,5% a la app**. El 1% / 1% / 0,5% (Connect, captación, infra) es asignación interna, no tres transfers.

---

Gabriel Alejandro Perea García · Adriano Gabriel Perea Martin · Hub Salta.

MIT. Argentina Builder Challenge · Scale · BAF × Stellar.
