---
name: copy-abuela
description: Reescribe y audita textos visibles de Lumina para adopción y hackathon. Usar al tocar copy, UI, README, Navbar, Footer, empresa, connect, invest, jury, presentation, certificados, o cuando el usuario pida textos, voz, abuela, adopción, o ganar el hackathon.
---

# Copy abuela · Lumina

Leé `.cursor/rules/copy-adopcion.mdc` y aplicá **toda** la superficie tocada, no un string.

## Cómo revisar

1. Inventariá strings visibles (tsx de `app/` y `components/`, `impact-apps.ts`, README raíz, metadata).
2. Cada string: ¿lo entiende alguien sin saber blockchain? Si no, reescribí.
3. Blockchain = recibo. Nunca el titular. Stellar/comprobante solo cuando el usuario **pide ver** el pago (`/invest`, `/jury`).
4. Incompleto = `en trabajo` / `próximamente`. Nunca “No se finge”, WIP, OS, script interno.
5. Freighter y “Conectar wallet” solo en `/invest` (y admin). Home/empresa/jury no piden billetera.
6. `/jury`: título **Recibos Lumina**. Hashes con etiqueta: pagó / eligió la app / cobró.
7. Nav: Empresas · Apps · Recibos · Probar. Nunca Connect ni Portal como marca.

## Pitch (no diluir)

Impacto sin fricción. Lumina ilumina el camino. Empresas en Lumina / Apps en Lumina. Factura → 97,5% a la app → familia no paga.

## No tocar

IDs de contrato, txs E2E, claves env, status keys (`pendiente_psav`, `en_escrow`). Solo labels.
No recategorizar Genesis, no fingir USDT0, no inventar PII.

## Salida

Lista corta: archivo → antes → después. Si queda jerga, es bug.
