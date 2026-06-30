# Entrevista 1 — Creador de MIRA AI

## Datos del entrevistado

- **Rol:** CEO & Founder, MIRA AI
- **Organización:** MIRA (app de screening de neurodesarrollo infantil)
- **Relación con el proyecto:** Creador del oráculo de impacto integrado con Lumina

## Grabación

Link público: [INSERTAR LINK DE GOOGLE DRIVE O YOUTUBE]

## Problema validado

> "Las herramientas de screening existen, pero nadie las financia a escala. Los hospitales públicos no tienen presupuesto para cribados masivos, y las empresas que quieren financiarlo no tienen forma de verificar que el dinero llegó al paciente."

## Solución actual

- MIRA se financia con fondos propios del equipo y grants de investigación
- No existe un riel de pago programable: cada evaluación requiere gestión manual de cobro
- La verificación de que el screening se completó es manual (descarga de PDF, revisión humana)

## Insight clave para Lumina

El creador de MIRA confirmó que el modelo de **oráculo firmado + escrow programable** elimina la principal fricción: hoy, cobrar por evaluación requiere gestión administrativa manual. Con Lumina, el pago se libera automáticamente al verificarse el hash del reporte on-chain.

> "Si el contrato libera los 40 USDC solo cuando firmamos el hash del PDF, no necesitamos cobrar manualmente. El riel financiero desaparece como problema."

## Reacción a la demo

- Validó que la firma del oráculo por hash SHA-256 cumple con HIPAA/GDPR (no transmite datos sensibles)
- Preocupación: si el backend del oráculo cae, el screening se completa pero el pago no se libera → se necesita resiliencia
- Sugerencia: el contrato debería permitir retry de release_impact con el mismo hash sin fallar

## Cita destacada

> "Lumina convierte a MIRA de un herramienta clínica gratuita en un servicio sostenible. Si alguien financia el screening con 40 USDC y Lumina lo libera automáticamente, MIRA puede escalar sin perseguir cobros."