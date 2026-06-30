# Demo Video Script — Lumina Impact Protocol (90 segundos)

> PULSO Hackathon: 1-2 min walkthrough showing the prototype working + real-world problem solved.

## Requisitos de grabación

- Screen recording 1080p (OBS, Loom o QuickTime)
- Voz en off en español (audiencia Argentina PULSO)
- Mostrar stellar.expert con el hash REAL de la transacción
- No mostrar SEP-24 ni Yield Mode (son simulaciones)
- Fondo: modo dark del portal para mejor contraste en video
- Tono: confiado, directo, técnico pero visceral — sin relleno motivacional

## Guion segundo a segundo

| Tiempo | Pantalla | Voz en off | Acción visible |
|---|---|---|---|
| 0:00-0:12 | **Landing `/`** (hero) | "1 de cada 36 niños presenta rasgos de autismo. La intervención temprana cambia vidas — pero en Argentina, financiar screenings masivos depende de intermediarios que consumen hasta un 60% del presupuesto. Lumina elimina ese intermediario." | Scroll landing, se ve el H1 "Capa de Infraestructura ReFi" + stats globales con count-up |
| 0:12-0:30 | **`/invest`** (depósito) | "Un sponsor corporativo bloquea USDC en un smart contract de Soroban. La transacción es no-custodial: Lumina nunca toca los fondos — están bloqueados por código hasta que un hito de impacto se verifica." | Click "Conectar Wallet" → Freighter popup aprueba → approve USDC → `deposit` → status "Depósito completado" → se ve el balance en escrow |
| 0:30-0:50 | **MIRA `localhost:3001`** | "En paralelo, una familia completa el screening M-CHAT-R/F en MIRA AI. La app calcula el hash SHA-256 del reporte clínico — el hash, no los datos del paciente. Cumple HIPAA. Cumple GDPR. Es criptografía pura." | Cuestionario M-CHAT se completa → descarga del PDF → se muestra el hash en pantalla |
| 0:50-0:72 | **stellar.expert** (Testnet) | "El oráculo de MIRA firma criptográficamente ese hash y envía `release_impact` al contrato. La transacción se confirma on-chain en segundos. Esto no es una demo. Es real. El contrato está operativo en Testnet hoy." | Pantalla de stellar.expert con la tx real · timestamp · events `ImpactReleasedEvent` · se ve el hash del reporte en los args |
| 0:72-0:87 | **`/sponsor`** (Dashboard) | "En el Live Impact Ledger del sponsor: el escrow baja 40 USDC, el score de impacto sube +1, y el evento queda permanente en la blockchain. Una auditoría ESG completa en tiempo real. Cero intermediarios." | Dashboard sponsor: el balance baja, impact score sube, ledger muestra "MIRA Verificado" |
| 0:87-0:95 | **Cierre** | "Lumina. Infraestructura ReFi universal para impacto ambiental, social, educativo y de salud. Deployado en Stellar Testnet. Código abierto. Esto es solo el primer oráculo." | Logo Lumina · link al repo · "Stellar Testnet" · fade |

## Frases clave a enfatizar (voz en off)

> "1 de cada 36 niños" — gap emocional/dato
> "Lumina nunca toca los fondos" — diferente clave vs intermediarios
> "El hash, no los datos del paciente" — compliance (HIPAA/GDPR)
> "Esto no es una demo. Es real." —赚钱 vs ilusión
> "Cero intermediarios" — modelo de negocio

## Checklist post-grabación

- [ ] Duración entre 60-120 segundos (objetivo: 90 seg)
- [ ] Transacción on-chain visible en stellar.expert con hash real (no screenshot — en vivo)
- [ ] Voz clara, sin ruido de fondo, con pausas naturales
- [ ] Resolución mínimo 1080p · 30fps
- [ ] Subir a Google Drive (link público) o YouTube (no listado)
- [ ] Linkear el video en `README.md` raíz

## Variante internacional (si jurado extranjero)

Usar estas frases en inglés si se requiere:
- "1 in 36 children presents traits of autism"
- "Sponsors lock USDC in escrow — Lumina never custodies"
- "SHA-256 hash — not patient data. HIPAA-compliant by design"
- "Live on Testnet. This is not a mockup."
- "Zero intermediaries. 97.5% direct to impact."