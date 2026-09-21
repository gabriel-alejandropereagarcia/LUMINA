# Lumina

**Impacto sin fricción.** Lumina ilumina el camino de la RSE. Conecta a quien quiere ayudar.

Hoy, una empresa quiere financiar salud, educación o asistencia. Una familia lo necesita, pero el capital se pierde en informes, meses de espera y burocracia.

Lumina lo resuelve.

La empresa paga una factura — sin cuenta cripto. La app confirma que el trabajo se hizo: una unidad, una cantidad. Si ocurrió, se cobra el **97,5%**. Si no ocurrió, el capital vuelve. El usuario final nunca paga.

Nacimos en Salta. Sirve donde haya alguien que quiere ayudar y alguien que no puede pagar.

[Live](https://lumina-dusky-pi.vercel.app) · [Recibos Lumina](https://lumina-dusky-pi.vercel.app/jury) · [Empresas en Lumina](https://lumina-dusky-pi.vercel.app/empresa) · [Apps en Lumina](https://lumina-dusky-pi.vercel.app/connect#registro)

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7D5BA6?logo=stellar&logoColor=white)
![Soroban](https://img.shields.io/badge/Soroban-Lumina-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## El problema

Una empresa quiere financiar salud, educación o asistencia. Una familia lo necesita. El capital se pierde en informes, meses de espera y burocracia.

Eso no es un problema de un país. Es lo que pasa cada vez que el impacto se rinde en una planilla y el servicio se cobra en la puerta. En Salta lo vimos de cerca.

## Qué es (y qué no)

Lumina **no** es la clínica ni el sponsor. Es el camino:

1. **Empresas en Lumina** pagan una **factura**. No abren una cuenta cripto. No compran cripto.
2. **Apps en Lumina** confirman el trabajo (unidad + cantidad, nunca un DNI).
3. Esa app cobra **97,5%**. Lumina cobra **2,5%**, solo si hubo impacto. Sin trabajo a los 12 meses, el dinero vuelve y Lumina cobra **0%**.

**Por qué ahora.** El impacto necesita velocidad y un recibo que se pueda mostrar. Lumina convierte burocracia en cobro el mismo día.

**Visión.** Escalar desde Argentina al mundo.

MIRA (cribado) y PuenteMAE (ayuda a docentes) son las **primeras apps en Lumina**. Lumina no es la clínica ni la escuela.

---

## Recibos Lumina (19/9/2026)

| Qué | Valor |
|---|---|
| Reserva | [`CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ`](https://stellar.expert/explorer/testnet/contract/CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ) |
| USDC de prueba | [`CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`](https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA) |
| La empresa pagó 40 USDC | [`9fdbc2e8…`](https://stellar.expert/explorer/testnet/tx/9fdbc2e8865a0a94339884d6345eb628c2d6ee16792ab5ebfe5f0a946765812f) |
| MIRA cobró el 97,5% | [`a26a3626…`](https://stellar.expert/explorer/testnet/tx/a26a36263013a9d38370c4ef55bb9a7f96fa860213e11f4805873b8a2995a522) |
| Código del trabajo | `4c39fcc97b18fddae23671ccebf5bb182db64a9e9e27f5f4e01cb365b21664ca` |
| App (firma) | `GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W` |
| Empresa de prueba | `GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E` |

USDT0 oficial: **próximamente**. Hoy el recorrido usa USDC Circle de prueba.

---

## Recorre el demo

| Paso | Ruta | Qué es |
|---|---|---|
| 1 | [`/empresa`](https://lumina-dusky-pi.vercel.app/empresa) | Empresas en Lumina. Factura, sin cuenta cripto. Cobro en pesos: **en trabajo**. |
| 2 | [`/invest`](https://lumina-dusky-pi.vercel.app/invest) | Probar Lumina. Freighter + USDC de prueba. Live. |
| 3 | Confirmar el trabajo en `/invest`, o [`/jury`](https://lumina-dusky-pi.vercel.app/jury) | Recibos Lumina. 97,5% a la app. |

El PDF de Empresas en Lumina **no** dice que se pagó hasta que la app cobra.

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

El cobro: **2,5% a Lumina** y **97,5% a la app**. El 1% / 1% / 0,5% (apps, empresas, sistema) es cómo lo usamos adentro, no tres pagos separados.

---

Gabriel Alejandro Perea García · Adriano Gabriel Perea Martin · Hub Salta.

MIT. Argentina Builder Challenge · Scale · BAF × Stellar.
