# Lumina

**Impacto sin fricción.** Lumina ilumina el camino. Conecta las ganas de ayudar con la necesidad.

La app emite el informe. Ese informe queda en el recibo y libera el dinero. El **97,5%** llega a la app. La familia no paga. Si no hay informe, el dinero vuelve y Lumina cobra **0%**.

Hoy hay una luz real: el 19/9, MIRA emitió un cribado. El horizonte es el mismo camino, lleno de empresas y de apps.

**Recorrido para el jurado, en este orden**

1. [La luz de hoy](https://lumina-dusky-pi.vercel.app/?vista=hoy&nodo=e2e-19-9#camino) — una luz real. Elegí el nodo: se ilumina el camino.
2. [El horizonte](https://lumina-dusky-pi.vercel.app/?vista=horizonte#camino) — la visión. Muchas empresas, muchas apps, un campo de luces.
3. [Recibos del 19/9](https://lumina-dusky-pi.vercel.app/jury) — la empresa pagó, eligió MIRA, MIRA cobró el 97,5%.
4. [Empresas en Lumina](https://lumina-dusky-pi.vercel.app/empresa) · [Apps en Lumina](https://lumina-dusky-pi.vercel.app/connect#registro)

Nacimos en Salta. Sirve donde haya alguien que quiere ayudar y alguien que no puede pagar.

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7D5BA6?logo=stellar&logoColor=white)
![Soroban](https://img.shields.io/badge/Soroban-Lumina-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## El problema

Una empresa quiere ayudar en salud, educación o asistencia. Una familia lo necesita. La ayuda se pierde en meses de espera y en quien decide en el medio.

Eso no es un problema de un país. En Salta lo vimos de cerca.

## Qué es Lumina

Lumina ilumina el camino:

1. **Empresas en Lumina** hacen llegar la ayuda y eligen la app.
2. **Apps en Lumina** emiten el informe. MIRA: el informe del cribado. PuenteMAE: el informe del mes de ayuda. Las horas quedan dentro de ese informe.
3. Lumina toma el código de ese informe y libera el dinero. La app cobra **97,5%**. Lumina cobra **2,5%**, solo si el informe existió. A los 12 meses sin informe, el dinero vuelve y Lumina cobra **0%**. El archivo no entra a Lumina.

**Hoy y horizonte.** Hoy se recorre una luz real. El horizonte muestra el camino lleno: es la visión, y se distingue de la luz del 19/9.

**Por qué ahora.** La ayuda tiene que verse el mismo día. El recibo es la prueba.

---

## Recibos Lumina (19/9/2026)

| Qué | Valor |
|---|---|
| Reserva | [`CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ`](https://stellar.expert/explorer/testnet/contract/CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ) |
| USDC de prueba | [`CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`](https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA) |
| La empresa pagó 40 USDC | [`9fdbc2e8…`](https://stellar.expert/explorer/testnet/tx/9fdbc2e8865a0a94339884d6345eb628c2d6ee16792ab5ebfe5f0a946765812f) |
| MIRA cobró el 97,5% | [`a26a3626…`](https://stellar.expert/explorer/testnet/tx/a26a36263013a9d38370c4ef55bb9a7f96fa860213e11f4805873b8a2995a522) |
| Código del informe | `4c39fcc97b18fddae23671ccebf5bb182db64a9e9e27f5f4e01cb365b21664ca` |
| App (firma) | `GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W` |
| Empresa de prueba | `GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E` |

USDT0 oficial: **próximamente**. Hoy el recorrido usa USDC Circle de prueba.

---

## Recorre el demo

| Paso | Ruta | Qué es |
|---|---|---|
| 1 | [`/empresa`](https://lumina-dusky-pi.vercel.app/empresa) | Empresas en Lumina. La ayuda llega. Cobro en pesos: **en trabajo**. |
| 2 | [`/invest`](https://lumina-dusky-pi.vercel.app/invest) | Probar Lumina. Un pago de prueba. Live. |
| 3 | Confirmar el trabajo en `/invest`, o [`/jury`](https://lumina-dusky-pi.vercel.app/jury) | Recibos Lumina. 97,5% a la app. |

El PDF de Empresas en Lumina sale cuando la app cobra.

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
