# Lumina — contexto Scale

Protocolo RSE en Stellar: la empresa lockea con factura (sin wallet), la app cobra el **97,5% on-chain** cuando el hito es real, quien usa el servicio **no paga**. Track **Scale**, Argentina Builder Challenge 2026, Hub Salta.

## Hechos

- Escrow v3: `CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ`
- Demo: https://lumina-dusky-pi.vercel.app
- USDC Circle testnet SAC: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
- USDT0: solo mainnet oficial. No hay token de testnet inventado.
- Fee on-chain: `amount * 25 / 1000` a una `platform_wallet`. El 1/1/0,5 es interno.
- MIRA y PuenteMAE son apps de Connect, no este repo.
- Contratos EVM en `contracts-evm/` están archivados.

## Superficies

| Quién | Ruta |
|---|---|
| Empresa | `/empresa` |
| App (alta) | `/connect#registro` |
| API | `/developers` |
| Demo on-chain | `/invest` |
| Hashes | `/jury` |

## No hacer

No recategorizar a Genesis. No integrar obras sociales. No absorber FX minorista. No fabricar USDT0 de testnet. No commitear secretos ni PII.
