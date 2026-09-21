# Lumina

**Hay ganas de ayudar. Hay quien no puede pagar. Lumina las une cuando el hito es real.**

La empresa lockea con una factura — sin wallet. La app de impacto cobra el **97,5% on-chain**. Quien usa el servicio **no paga**.

Nació en Salta. El riel es global.

[Live](https://lumina-dusky-pi.vercel.app) · [Evidencia](https://lumina-dusky-pi.vercel.app/jury) · [Portal empresa](https://lumina-dusky-pi.vercel.app/empresa) · [Registrá tu app](https://lumina-dusky-pi.vercel.app/connect#registro)

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7D5BA6?logo=stellar&logoColor=white)
![Soroban](https://img.shields.io/badge/Soroban-escrow%20v3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## El problema

Hay capital de RSE / impacto que quiere llegar. Hay familias, escuelas y clínicas que no pueden pagar el servicio. En el medio hay planillas, meses de atraso, y apps que hacen el trabajo y cobran tarde — o no cobran.

Eso no es un problema argentino. En Salta lo escuchamos primero (una tesorería que **no puede tocar cripto**, docentes MAE, un hospital). El producto no se queda ahí: cualquier empresa que quiera pagar impacto con prueba, y cualquier app que certifique un hito, entra al mismo riel.

## Qué es (y qué no)

Lumina **no** es la clínica ni el sponsor. Es el protocolo:

1. La empresa paga una **factura de servicio**. No abre Freighter. No compra cripto.
2. Una app listada en Connect certifica un hito (unidad + cantidad, nunca un DNI).
3. El escrow Soroban paga **97,5%** a esa app y **2,5%** al protocolo, solo al `release`. Sin hito a los 12 meses, withdraw y Lumina cobra **0%**.

MIRA (cribado) y PuenteMAE (ayuda social a docentes) son **apps de ejemplo** en Connect. Viven en otros repos. Este repo es el riel.

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
