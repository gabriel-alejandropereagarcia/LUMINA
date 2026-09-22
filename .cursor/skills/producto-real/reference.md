# Frentes que un producto real no puede “dejar para después” sin fila

Cada ítem vive en `ROADMAP.md`. Acá está el porqué.

## Identidad y panel

- CUIT validado (dígito + padrón ARCA). Razón social no se tipea.
- Magic link al mail corporativo. Dominio de la empresa, no Gmail. CUIT solo no alcanza: es público.
- Varios mails bajo la misma CUIT (tesorería, RSE).
- El panel es de la CUIT, no de la cookie del browser.
- En el tablero: órdenes, informe, PDF. Cada movimiento: pagó / eligió / cobró, con enlace al recibo. No Freighter. No “donación”.
- Rate limit, auditoría de accesos, cierre de sesión.

## Persona jurídica Lumina

- SAS/SRL con CUIT, IVA RI, Ganancias, IIBB, punto de venta, CAE.
- Cuenta bancaria / CBU para devolver a los 12 meses.
- Contrato tipo: mandato + honorario 2,5% si hubo trabajo. Visto del contador.
- Términos, privacidad (Ley 25.326), DPA con la app.

## Plata

- Merchant Koywe a la CUIT de Lumina. Alerce cobra, no factura.
- Webhook firmado, idempotencia, conciliación orden ↔ acreditación.
- Tesorería: reserva al acreditar. Claves fuera del `.env` de Vercel (KMS / firmante).
- Si no hay tesorería, el panel no dice que la plata ya está reservada en vivo.
- Devolución a CBU de la empresa, no a una cuenta cripto de la tesorería.
- La app cobra 97,5% y paga al beneficiario en pesos (promesa de la app).

## Factura ARCA

- Dos papeles: orden/recibo de fondos (capital) y Factura A/B del 2,5% + IVA (honorario).
- WSFEv1 o Comprobantes en línea. Numeración, nota de crédito si se anula.
- No emitir CAE al capital. Confirmar con contador.

## Persistencia y ops

- Base (Postgres). `.data/*.json` no es producción.
- Backups, staging ≠ prod, logs, alertas de cobro fallido.
- Soporte: un canal y un responsable.

## Apps en Lumina

- Alta con ficha. Revisión humana. Pausa si rompe el esquema.
- Cuenta que confirma ≠ cuenta que cobra, gestionadas por la app.
- PuenteMAE y cada app nueva: oracle listo o no se ofrece como cobro vivo.
