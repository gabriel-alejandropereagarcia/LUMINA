# Lumina

**Impacto sin fricción.** Lumina ilumina el camino. Conecta las ganas de ayudar con la necesidad.

La app emite el informe. Ese informe queda en el recibo y libera el dinero. El **97,5%** llega a la app. La familia no paga. Si no hay informe, el dinero vuelve y Lumina cobra **0%**.

Hoy hay una luz real: el 19/9, MIRA emitió un cribado. El horizonte es el mismo camino, lleno de empresas y de apps.

Hay dos puertas. **Empresas en Lumina** es adopción: la empresa entra con CUIT y mail, sin billetera. **Recibos Lumina** es para el jurado: el dinero está en Stellar, y se puede abrir.

**Recorrido para el jurado, en este orden**

1. [La luz de hoy](https://lumina-dusky-pi.vercel.app/?vista=hoy&nodo=e2e-19-9#camino) — una luz real. Elegí el nodo: se ilumina el camino.
2. [El horizonte](https://lumina-dusky-pi.vercel.app/?vista=horizonte#camino) — la visión. Muchas empresas, muchas apps, un campo de luces.
3. [Recibos del 19/9](https://lumina-dusky-pi.vercel.app/jury) — cómo entra Stellar. Tres transacciones, un contrato.
4. [Empresas en Lumina](https://lumina-dusky-pi.vercel.app/empresa) · [Apps en Lumina](https://lumina-dusky-pi.vercel.app/connect#registro)
5. [Probar Lumina](https://lumina-dusky-pi.vercel.app/invest) — firmás el depósito con Freighter.

Nacimos en Salta. Sirve donde haya alguien que quiere ayudar y alguien que no puede pagar.

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-7D5BA6?logo=stellar&logoColor=white)
![Soroban](https://img.shields.io/badge/Soroban-Lumina-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Qué significa

Una empresa quiere ayudar en salud, educación o asistencia. Una familia lo necesita. La ayuda se pierde en meses de espera y en quien decide en el medio.

Lumina saca a ese intermediario del camino. La empresa elige la app. La app emite el informe que ya le entrega a quien ayudó. Ese informe es la condición del pago.

MIRA emite el informe del cribado. PuenteMAE emite el informe del mes de ayuda a docentes: las horas quedan dentro de ese informe, no se pagan de a una. El archivo no entra a Lumina. Entra su código. El mismo código no libera el dinero dos veces.

La empresa no compra cripto y no abre billetera. Hace llegar la ayuda. El cobro en pesos está **en trabajo**. La familia no paga. No es una donación deducible.

El horizonte es la visión: muchas empresas, muchas apps, un campo de luces. Hoy la luz real es una, la del 19/9.

## Cómo entra Stellar

El recibo no es una fila en una base. Es un contrato Soroban en Stellar testnet. Lumina no custodia el dinero. El contrato lo recibe, lo guarda a nombre de quien pagó, y solo lo suelta con la firma de la app que esa persona eligió.

Tres llamadas. Las tres corrieron el 19/9, con 40 USDC Circle de prueba.

1. **`deposit`** — quien paga transfiere al contrato. El saldo queda a su nombre. `withdraw_escrow` rechaza el retiro antes de 12 meses (360 días en el ledger). Si no hay informe, Lumina cobra 0%.
2. **`assign_oracle`** — elige la app que puede liberar ese saldo. El contrato solo acepta una app que el admin ya autorizó con `add_oracle`. Si firma otra cuenta, `OracleMismatch`.
3. **`release_impact`** — la app firma con su cuenta de Stellar y envía el código del informe, 32 bytes. El contrato parte el monto: `(monto × 25) / 1000` a Lumina y el resto a la cuenta de cobro de la app. Si ese código ya está guardado, `ReportAlreadyVerified`. El PDF no viaja.

`deposit_asset` y `allow_asset` dejan entrar otro activo por el mismo contrato. USDT0 oficial de mainnet: **próximamente**. No hay USDT0 de testnet y no lo inventamos.

| Qué pasó | Dónde se abre |
|---|---|
| Contrato Soroban | [`CBZAI24…M3EJ`](https://stellar.expert/explorer/testnet/contract/CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ) |
| USDC Circle de prueba | [`CBIELTK6…DAMA`](https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA) |
| `deposit` · la empresa pagó 40 USDC | [`9fdbc2e8…`](https://stellar.expert/explorer/testnet/tx/9fdbc2e8865a0a94339884d6345eb628c2d6ee16792ab5ebfe5f0a946765812f) |
| `assign_oracle` · eligió MIRA | [`0f58d322…`](https://stellar.expert/explorer/testnet/tx/0f58d322ce32855649d7f8c821987cd822d4181ea7121d0ce3829dfa5f48f9c3) |
| `release_impact` · MIRA cobró el 97,5% | [`a26a3626…`](https://stellar.expert/explorer/testnet/tx/a26a36263013a9d38370c4ef55bb9a7f96fa860213e11f4805873b8a2995a522) |
| Código del informe | `4c39fcc97b18fddae23671ccebf5bb182db64a9e9e27f5f4e01cb365b21664ca` |
| App (firma) | `GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W` |
| Quien pagó | `GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E` |

## Adopción

| Quién | Dónde | Qué hace |
|---|---|---|
| Empresa | [`/empresa`](https://lumina-dusky-pi.vercel.app/empresa) | CUIT y mail. Elige la app. Cuando el informe existe, se enciende la luz y sale el recibo. Sin billetera. |
| App | [`/connect#registro`](https://lumina-dusky-pi.vercel.app/connect#registro) | En la ficha dice qué informe emite. El alta queda en revisión. |
| Jurado | [`/invest`](https://lumina-dusky-pi.vercel.app/invest) | Deposita con Freighter y elige la app. El informe de prueba libera el 97,5%. |

El 1% / 1% / 0,5% (apps, empresas, sistema) es cómo Lumina usa su 2,5% adentro. No son tres pagos.

---

## Correr el contrato

```bash
cd contracts/lumina_escrow
cargo test
```

```bash
cd lumina-web
cp env.empresa.example .env.local
npm install
npm run dev
```

```
contracts/lumina_escrow/   Soroban (Rust)
lumina-web/                Next.js — empresa, invest, connect, jury
examples/certify.ts        La app envía el código del informe
scripts/e2e-usdc.ps1       deposit + assign_oracle + release_impact (40 USDC)
customer-discovery/        4 entrevistas (Salta — origen, no el tamaño del mercado)
```

Node 22+. Freighter en testnet. USDC: [faucet.circle.com](https://faucet.circle.com/) (Stellar Testnet).

---

Gabriel Alejandro Perea García · Adriano Gabriel Perea Martin · Hub Salta.

MIT. Argentina Builder Challenge · Scale · BAF × Stellar.
