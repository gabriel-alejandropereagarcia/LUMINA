# ABC Scale — nota de continuidad (leer esto primero)

**Cualquier agente / sesión nueva: leé esta nota entera antes de tocar código.**  
No reabrir debates locked. No inventar USDT0 de testnet. No commitear ni pushear salvo que Mst. lo pida. No imprimir secretos.

Última revisión: **martes 15 septiembre 2026.**  
Workspace: `D:\aplicaciones\Lumina` · branch **`scale/abc-2026`** · remoto `https://github.com/gabriel-alejandropereagarcia/LUMINA` (privado).  
Usuario: Mst. · `gh` = `gabriel-alejandropereagarcia`.  
Hoy el reloj ABC: checkpoints código **20/9 y 24/9** · submit + Demo Day virtual **26/9** (reglamento; la landing a veces dice 27/9).

---

## 0. En 30 segundos

Lumina es el **protocolo**, no la app de impacto ni el sponsor. Track **Scale** (Integración abierta). **No recategorizamos a Genesis.**

Ganar-ganar-ganar:

1. **Empresa RSE** — lockea capital 12 meses, ve hash, no abre wallet, **no compra cripto**.
2. **App de impacto** — certifica un hito y **cobra el 97.5%**. Connect es el enchufe. La app es la **payee**.
3. **Quien usa esa app** — **no paga**. Se beneficia del servicio. Nunca una seed.

Lumina cobra **2.5% al release** (no al depósito). Si no hay hito a los 12 meses, withdraw = **0%** para el protocolo.

**Tres carriles, no un pivot:**

| Carril | Quién | Qué |
|---|---|---|
| **Scale** | Este equipo, este repo | Protocolo + Connect + portal `/empresa` + demo USDC |
| **Genesis A** | **Otro equipo**, repo nuevo post-12/9 | Mini-app user-facing USDT0 (trustline + [usdt0.to/transfer](https://usdt0.to/transfer)) |
| **Genesis B / paralelo** | **Otro equipo** o repo aparte | **PuenteMAE**: ayuda social a docentes de inclusión. **No se mete con obras sociales.** |

Lumina **no baja a Genesis**. Un Instaward activo por equipo: no presentamos dos contests.

---

## 1. Tesis locked — no pivotar

- No decir: ICP = developers; payee = hospital/familia; la app solo firma y cobra otro.
- BCRA: corporates AR (Nadia / ARLI) no pueden tener cripto. Eso **no cambia el producto**. Pagan una **factura de servicio RSE**. Tesorería Lumina deposita USDC **propio**.
- Demo pool = stand-in de RSE. No hay sponsor live. Rotularlo.
- **MIRA** (`D:\aplicaciones\INCLU-IA`, repo privado `MIRA`) = app WIP de cribado. **Cero Stellar.** Ejemplo Connect, no el piloto.
- No mockear Aula Abierta / EcoForest / FitSteps.
- Freighter queda para juez/admin/app en `/invest`. Empresa = email, cero wallet.

---

## 2. Qué NO hacer

- Inventar USDT0 de testnet / otro issuer `USDT`.
- OFT `quote_send`/`send` desde Lumina (Instaward, no ABC).
- CosmosPay como wallet de la empresa. BlindPay como onramp-de-la-minera.
- Inscribir a Lumina como PSAV en estos días.
- Absorber FX retail ARS→USDC (~278 bps): se come el 2.5%.
- Meter CUD, DNI, diagnóstico, escuela on-chain.
- Integrar obras sociales, cesiones, facturación a OS, recupero de glosas. **Caos. Fuera.**
- Usar PAIA como marca (listas de padres 2025).
- Recategorizar este repo a Genesis.
- Commit / push / `--no-verify` salvo pedido explícito.
- Secrets en git o en el chat.

---

## 3. Reloj, forms, equipo

Evento BAF × Stellar, 12–26/9/2026. Jurado 25% problema / negocio / producto / técnica.

Premio: camino a Instaward (hasta 3 equipos, USD 1–5k, 30 días, XLM, SDF decide). No SCF Build Award.

**PII confirmada 19/9 (Mst.):**

| | Lead | Compañero |
|---|---|---|
| Nombre | Gabriel Alejandro | Adriano Gabriel |
| Apellido | Perea García | Perea Martin |
| Email | gabrielsalta@gmail.com | adrianogabrielpm@gmail.com |
| WhatsApp | +54 9 387 5970375 | — |
| Ciudad / país | Salta, Argentina | Salta, Argentina |
| GitHub | https://github.com/gabriel-alejandropereagarcia | https://github.com/adrianogabrielpm-lab |
| Rol | Founder / Development | Development |
| Reside AR | Sí | Sí |

**ABC enviado 19/9** — confirmación on-page: “¡Recibimos tu aplicación!” a gabrielsalta@gmail.com. Track Scale, equipo Lumina (2). Apex = cuenta + Create Your Team (no reemplaza ABC).

**Cheat sheet Scale — campos del form live (15/9).** Pegá en orden. `[PII]` no inventar. Campos Genesis (cómo aplicás, teammates, categoría, tiempo) **no aparecen** si marcás Scale: no los busques.

### A. Sobre vos (lead)

| Campo live | Pegar |
|---|---|
| Nombre / Apellido / Email / WhatsApp / Ciudad | Gabriel Alejandro · Perea García · gabrielsalta@gmail.com · +54 9 387 5970375 · Salta |
| Provincia | Salta |
| ¿Residís actualmente en Argentina? | Sí |
| GitHub (URL o usuario) | https://github.com/gabriel-alejandropereagarcia |
| Rol principal | Founder (alternativa: Blockchain Developer) |
| Nivel blockchain / Stellar | Trabajo actualmente en blockchain |
| ¿Construiste anteriormente sobre Stellar? | **Sí** → se abre el textarea |
| Tecnologías | TypeScript · React · Next.js · Node.js · Rust · Soroban · AI / LLM tools |
| Track | **Scale — Proyectos existentes** |

**Contanos brevemente qué construiste o en qué participaste** (aparece si Sí):

```
Construí Lumina: el riel en Stellar que libera capital RSE solo cuando una app de impacto certifica que el hito ocurrió. La tesorería no abre wallet (paga una factura). La app cobra el 97,5% on-chain. Quien usa esa app no paga. El producto corre hoy en testnet con USDC Circle y tiene camino al USDT0 oficial de mainnet.
```

### B. El proyecto (bloque Scale)

| Campo live | Pegar |
|---|---|
| Nombre del proyecto | Lumina |
| Nombre del equipo | Lumina |
| GitHub repository | https://github.com/gabriel-alejandropereagarcia/LUMINA |
| Demo o producto | Hasta URL pública: `https://github.com/gabriel-alejandropereagarcia/LUMINA` — demo local `/empresa` `/invest` `/jury`. Después reemplazá por el HTTPS. |
| ¿En qué etapa se encuentra el proyecto? | **Producto activo** (testnet). No “Proyecto con usuarios”: no hay sponsor corporativo live. |
| ¿Actualmente utiliza Stellar? | **Sí** → se abre “cómo utiliza” |
| ¿Recibieron anteriormente financiamiento de Stellar? | **No** (no se abre “¿A través de qué programa?”) |
| Building blocks | **Soroban smart contracts · SDKs · Wallets del ecosistema · Activos locales.** No Anchors. No DeFi. No “todavía no lo definimos”. |
| ¿Cuántos integrantes tiene el equipo? | **2** |
| Hub | Sí — Salta |
| Compromiso activo | Sí |
| GitHub personal | Sí |
| Enterado por | BAF |
| Checkboxes | Los 4 de confirmación / reglas / contacto |
| Uso de imagen | Autorizo el uso de fotos y videos |

**¿Qué problema resuelve y quiénes son sus usuarios?**

```
En Argentina una tesorería RSE no puede abrir una wallet (BCRA) y hoy “audita” impacto con planillas, meses tarde. Las apps que sí hacen el trabajo —cribado, apoyo escolar— no tienen cómo cobrar el día que el hito ocurrió. Quien usa esa app termina pagando o no recibe el servicio.

Lumina es el riel, no la app ni el sponsor. La empresa lockea 12 meses con una factura (no compra cripto). La app certifica y cobra el 97,5%. Si no hay hito, la empresa recupera y el protocolo cobra 0%. Tres ganadores: compliance, builders, familias.

Validado en Salta con docentes MAE y con compliance de minera (ARLI): el dolor no es “falta blockchain”, es que no pueden tocar cripto y igual tienen que mostrar impacto.
```

**¿Cómo utiliza Stellar actualmente?** (aparece si Sí)

```
Stellar es el settlement, no un slide. Un contrato Soroban de escrow ya deployado libera on-chain el 97,5% a la wallet de la app y 2,5% al protocolo, solo si esa app está asignada al pozo. La empresa nunca firma: tesorería Lumina deposita. El demo ABC usa USDC Circle en testnet; el path de producción es el SAC oficial USDT0 en mainnet (no existe USDT0 de testnet — no lo inventamos). Freighter es para el juez y para la app; la tesorería RSE entra por factura.

Escrow v3 testnet: CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ.
```

**¿Qué quieren entregar durante el Argentina Builder Challenge?**

```
La feature Scale que le faltaba al producto: que una tesorería argentina pueda usar el riel sin wallet, y que cualquier app cobre cuando el hito es real.

1. Connect — una app entra con su unidad de hito y certifica por API.
2. Un loop que el jurado recorre solo: portal empresa (factura) → depósito USDC → certify → 97,5% a la app, con hashes en /jury.
3. Panel de tesorería en unidades (10 niño-mes), no solo dólares, más PDF auditable de tres bloques.
4. Evidencia del USDT0 oficial en mainnet. Sin token de juguete.
```

**¿Cómo medirían si tuvieron éxito al finalizar las dos semanas?**

```
Un jurado entiende la tesis en 20 segundos y termina el loop sin pedirnos Zoom: /empresa sin Freighter, /invest con Freighter, un release en el explorer. El panel cuenta unidades, no solo dólares. Eso es Scale: un producto que ya existía más la pieza que hacía falta para que una tesorería argentina y una app de impacto se encuentren en Stellar.
```

**Integrantes del equipo** (pegar):

```
1. Gabriel Alejandro Perea García — gabrielsalta@gmail.com — https://github.com/gabriel-alejandropereagarcia — Founder / Development — Salta, Argentina — reside AR: sí
2. Adriano Gabriel Perea Martin — adrianogabrielpm@gmail.com — https://github.com/adrianogabrielpm-lab — Development — Salta, Argentina — reside AR: sí
```

Luma hub Salta (aparte del form): https://luma.com/1jp3wlnj — kickoff ya fue 12/9; igual sirve si el form pide reservar.

### C. Apex (stellarapex.nearx.com.br) — no reemplaza ABC

Rounds Instaward: **coming soon**. Igual hay que existir como equipo.

1. Crear cuenta (email del lead).
2. **Create Your Team** → nombre `Lumina`.
3. Invitar al compañero (mismo email que en ABC).
4. No esperar el round abierto para tener el equipo.

**Bio / about (pegar):**

```
Argentine CSR treasuries cannot hold crypto — and still have to prove impact. Lumina is the Stellar rail: companies lock funds with an invoice (no wallet), impact apps certify a real milestone and receive 97.5% on-chain, end users never pay. Live Soroban escrow, invoice portal, Connect API. ABC demo: Circle USDC. Production path: official USDT0.
```

**Pitch corto (si pide 1 línea):**

```
RSE sin cripto → la app cobra el 97,5% cuando el hito es real → el usuario no paga.
```

Reglamento: https://argentinabuilderchallenge.netlify.app/reglamento  
Genesis = repo desde el 12/9, sin código propio anterior como base. Scale = producto que ya existe + feature en branch nueva.

---

## 4. Estado del código HOY (14/9 noche) — esto pisa secciones viejas

### Escrow v3 (live testnet)

`CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ`

- `allow_asset` + `assign_oracle` obligatorio.
- `OracleConfig.payout` = wallet de la app (97.5%).
- `release_impact_asset` / withdraw por asset.
- Fee on-chain: `protocol_fee = amount * 25 / 1000`.
- Tests en `contracts/lumina_escrow` (incl. allowlist + assign). Snapshots sucios: regenerar, no commitear `contracts/target`.

v2 legacy esta PC: `CBYAN67NOJD5OMXHEAKJWB7IZJ3TZWQ4KZ6SBALZLWRJU47J524UGM45`  
Legacy otra PC: `CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA`

### Identities Stellar CLI (esta PC)

`lumina-admin` · `lumina-oracle` · `lumina-sponsor`  
Admin: `GBKDKKKCMCB5CQG25R37F7VIHGO62557HZQUU4CZWTOTUK6HKLMNUDMK`  
Oracle demo: `GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W`  
Sponsor demo: `GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E`  
USDC testnet SAC: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`  
Secrets: `lumina-web/.env.local` (gitignore).

### Web (`lumina-web`, Next.js, `npm run dev` :3000)

| Superficie | Qué hace |
|---|---|
| `/invest` | Juez: Freighter, USDC testnet, assign. No tocar el riel empresa. |
| `/connect` `/developers` `/jury` `/presentation` | Connect, certify, evidencia, deck Demo Day. |
| `/empresa` `/empresa/portal` `/empresa/impacto` | Empresa: email, orden, panel de unidades, pack RSE. Sin Freighter. |
| `/c/[id]` | Certificado 3 bloques: impacto + pago + alcance. Hash del hecho. |
| `POST /api/v1/certify` | Bearer + `fact` (unidad, commitments) o hash legado. Unicidad schema+período+sujeto. Demo: `examples/certify.ts`. |
| `POST /api/connect/listing` | Alta de ficha (pending). PATCH pausa con Bearer. |
| `POST /api/empresa/aportes` | Crea orden. Si hay keys Koywe → PAYIN; si Circle → wire; si no → simulación. |
| Webhooks | `/api/empresa/webhooks/{koywe,circle,blindpay}` — 503 sin secret. |
| Tesorería | `TREASURY_DEPOSIT_ENABLED=true` + `TREASURY_SECRET` → approve+deposit+assign. **Opt-in. Off por default.** |

Nombres de env (sin valores): `lumina-web/env.empresa.example`.

Store demo empresa: `lumina-web/.data/empresa.json` (gitignore). Alias demo `lumina.rse.demo`. CBU ceros. FX ilustrativo **1 USD = 1.400 ARS**.

Connect `add_oracle` es real (admin firma). Catálogo curado: MIRA + PuenteMAE (fichas con unidad). Altas nuevas = pending hasta auditoría chica.

### Toolchain local

Node 24 · rustc 1.98.1 · target `wasm32v1-none` · Stellar CLI 28.0.0 · WinLibs MinGW.  
PowerShell: `$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"`

---

## 5. USDT0 — conector nativo, no un puente casero

Live mainnet **2/9/2026**. No es wrap. Pineado en `lumina-web/src/lib/official-assets.ts`.

| Superficie | Address |
|---|---|
| Classic | `USDT0:GATISXX6BZ6NC7IKQBY37CJD4SOZL3CYZJWXEDG6JVIY4WBS6KXJHN6Q` |
| SAC | `CBSJZEIO5C7KC2SF3MKSNXXJSW5G3VTNBX4ATMKUI3B2MR4JKM4R26YF` |
| OFT | `CBOWOLFSDM5PZXNFIVDMP5NZ7U2GSIHED6H6R446QOHF266XINKUMMF6` |
| OneSig | `CBCZ5CETG3XR5MZVDC7QBDOTIH6P7MOLUH2SSC52J3NVBYIV45D4QKR6` |
| EID / EndpointV2 | `30600` · `CCQLLRE5JBAWYCW3KTWOIWLMFDUOKROQVZNSALQMGOSXNW3ERUOWTZGK` |
| Transfer UI | https://usdt0.to/transfer |

SDF: *“USDT0 needs no special integration code on Stellar.”* SAC `decimals()=7`. OFT shared 6.

**No existe:** testnet oficial; rampa ARS→USDT0 Stellar (Koywe sin Stellar; BlindPay Stellar = **USDC**; Circle/MoneyGram = USDC); SDK OFT copy-paste en Soroban (docs = Solidity).

**Path Scale (nosotros):** allowlist SAC (hecho) + copy/link a la Transfer UI + I5 dust mainnet si aparece 1 unidad. Inbound: HQ manda USDT0 a G tesorería con trustline → `deposit()`. Demo ABC = **USDC Circle**.

**Path Genesis A (otro equipo):** repo nuevo, user-facing: abrir trustline Freighter + deep-link a la UI + mostrar saldo. No forkear Lumina. Sin eso es demo técnico y el reglamento lo baja.

---

## 6. Riel fiat (empresa) — marco legal

La empresa **paga un servicio**, no compra USDC.

1. **SA argentina:** Koywe **PAYIN** ARS→ARS, cobrador Alerce SRL **PSAV CNV N°24**.
2. **HQ Canadá/US:** Circle Mint (wire USD, mint **US$ 0**). SWIFT del banco ~US$ 15–45.
3. BlindPay Transfers→USDC Stellar = reserva técnica. Sin razón social PSAV verificada.

T3.0 techo al cobrador ARS: **0.8%**. Cotizar lock **en USD**; el ARS es al tipo del día (la empresa banca el FX).

Código: `lumina-web/src/lib/empresa/{rails,koywe-payin,circle-mint,treasury,settle,store}.ts`.

---

## 7. Números de negocio (no es dictamen)

Fee **solo al certificar**. US$ 10.000 liberados → app **9.750** · protocolo **250** (interno pitch: 1% OSS + 1% captación + 0.5% infra).

| Riel sobre US$ 10k, si Lumina absorbe costos | Neto protocolo |
|---|---|
| Circle HQ (SWIFT ~US$ 25) | **~US$ 225** |
| PAYIN + convert. mayorista | **~US$ 145** |
| PAYIN + FX retail ~2.78% | **−US$ 108 — nunca** |

Piso Circle ~US$ 2.000 (si no, el SWIFT se come el fee). PAYIN vive desde el demo de US$ 40.

IVA: no facturar el capital entero como “venta”. El 2.5% puede ser riel; el resto mandato. Pedir contador.

Break-even opex magro ~US$ 1.500/mes ≈ **US$ 60k certificados/mes** si el FX lo paga la empresa.

---

## 8. PuenteMAE — ayuda social, en paralelo, sin obras sociales

**Dolor (contexto, no integración):** MAE/docentes de inclusión, monotributistas. Atraso típico de OS 60–120 días (IOSEP jul 2026 ~4 meses; OSEP Catamarca ene 2026, >350 MAE). Planillas, glosas. Nomenclador Res. 2775/2026: módulo Maestro de Apoyo **$489.559,25/mes**; **hora MAE $16.068,31** (no confundir con prestación de apoyo **$20.550,64**). Foro: nomenclador ~40% atrás de costos. Ley 24.901 sigue existiendo **afuera** de este producto.

**Producto (locked 14/9 noche):** ayuda social con plata de RSE. **No facturamos a la OS. No cesión. No recupero. No glosas. No cartilla.** La OS es un problema del país; nosotros no lo operamos.

Flujo:

1. Empresa lockea RSE en Lumina (fiat / portal).
2. **PuenteMAE** (la app, payee 97.5%) certifica **horas de apoyo efectivamente dadas** (hash ciego: período + horas + id interno).
3. La app cobra on-chain y **paga ARS al CBU del docente** (ayuda / complemento de continuidad).
4. Familia y niño **no pagan**. No wallet.
5. El docente puede seguir cobrando (o intentando cobrar) su OS por su lado. **Eso no es nuestro sistema.**

On-chain: hash de horas. Nunca CUD, DNI, diagnóstico, escuela. Cero abono a la familia (eso sería prepaga ilegal). Docente nunca recibe cripto.

**ABC (este equipo):** card Connect / oracle de ejemplo, como MIRA. No un segundo contest.

**Genesis B (otro equipo):** repo `D:\aplicaciones\PuenteMAE` (14/9). App user-facing: horas, recibo, CBU. Nota de inicio: `CONTINUAR.md`. Llama `POST /api/v1/certify` cuando Lumina esté live. Personería coop/SAS = post-ABC.

Entrevistas ya hechas (Salta): educación ×2 (Gianella; Gustavo MAE), minera Nadia (ARLI, no cripto). Hospital pendiente.

---

## 9. Qué falta para el 26/9 (todo ahora — no hay Instaward si no ganamos)

Orden. Si hay que recortar: **nunca Connect ni el E2E USDC.**

1. **E2E live USDC:** faucet Circle (2×20, captcha en tu browser) → `powershell -File scripts/e2e-usdc.ps1` (approve + deposit + assign signer `GBJJCKJ…` + certify) → pegar hashes en `/jury`.
   Trustline classic USDC (issuer `GBBD47…`) abierta. **15/9 ~18:10 ART: 20.0000000 USDC** en sponsor `GBRR6QWYT5UIHATCC7SYJITERMDWKLE5HHJCNM5PP6GK2DRB4YPKSP5E`. Falta el segundo 20 (Circle: 20 / 2 h). Faucet: https://faucet.circle.com/ · Stellar Testnet. `/jury` pega hashes sin rebuild.
2. **USDT0 oficial mainnet:** vos comprás ≥1 unidad (usdt0.to/transfer). Pegamos el hash en `NEXT_PUBLIC_USDT0_PROOF_TX` y `/jury`. No entra al escrow testnet.
3. Forms: **ABC enviado 19/9** (Scale, Lumina, 2). Apex pendiente: cuenta + Create Your Team = Lumina.
4. URL pública + deck `/presentation` + video 3 min (guion en canvas war-plan) + freeze.
5. Commit + push **19/9** a `scale/abc-2026` (+ `master` para Vercel). No commitear `.env.local`.
6. Keys Koywe/Circle: si no llegan, portal simulado y **rotulado**. No bloquea el Demo Day.

Hydration overlay en home/`/empresa` (posible `useCountUp` / theme): preexistente; no es el riel. No perseguirlo si no rompe el demo.

---

## 10. Congelado (no reabrir)

CosmosPay wallet · Trustless Work · OFT `send` · CCTP E2E · DeFindex/Soroswap como feature Scale · Cavos/Privy salvo que Connect+Kit ya demean y sobra una sesión · USDT0 casero de testnet · tiles de sponsors inventados · integrar OS/cesión/factoring.

Koywe **widget** de `/invest` (onramp + Freighter) ≠ Koywe **PAYIN** del portal empresa.

**Anclap (Grupo Anchor S.A.) — estacionado, no ABC.** Sitio: https://home.anclap.com/home-es/  
Ancla Stellar viva: `ARS:GCYE7C77EB5AWAA25R5XMWNI2EDOKTTFTTPZKM2SR5DI4B4WFD52DARS` (Peso Digital) + SEP-6/24. **No resuelve** el dolor BCRA: eso es token en una G, no factura RSE. Pay-in que publican = Pix Brasil, no CBU. Sin n° PSAV en la home. Pregunta post-26 a `info@anclap.com`: ¿cobro merchant ARS a Lumina + liquidación USDC a *nuestra* G, sin wallet de la SA? Hasta que sí, Koywe PAYIN / Alerce N°24 manda.

---

## 11. Canvases (al lado del chat)

Carpeta: `C:\Users\gabri\.cursor\projects\d-aplicaciones-Lumina\canvases\`

| Archivo | Para qué |
|---|---|
| `abc-scale-foda-plan.canvas.tsx` | FODA y plan Scale |
| `lumina-web-normal.canvas.tsx` | Empresa sin wallet |
| `legal-fiat-framework.canvas.tsx` | PAYIN vs onramp |
| `fiat-rails-ranking.canvas.tsx` | Ranking de rieles |
| `business-model-finance.canvas.tsx` | Unit economics |
| `usdt0-mae-parallel.canvas.tsx` | USDT0 + PuenteMAE (actualizar: ayuda social, Genesis = otros equipos) |
| `ecosystem-trust-three-reviews.canvas.tsx` | 15/9: Connect simple vs reputación. Ficha de hito. Tres revisiones (empresa, app, nosotros) |
| `abc-war-plan-26.canvas.tsx` | 15/9: plan de guerra hasta el 26. Sin Instaward como plan B. USDT0 se compra. |

`project_memory.md` tiene gotchas viejos (contrato `CBLKDMO6…`, MIRA notarize). **Esta nota manda.** Gotchas técnicos que sí heredan: `wasm32v1-none`; SAC `approve(..., expiration_ledger)` = `latestLedger+120000`; Freighter `{ signedTxXdr }`; RPC timeout 30s, fallar si ≠ `PENDING`.

---

## 12. Enlaces

- Challenge: https://argentinabuilderchallenge.netlify.app/
- Reglamento / aplicar: ver §3
- Apex: https://stellarapex.nearx.com.br/
- USDT0 SDF: https://developers.stellar.org/docs/tokens/usdt0-layerzero
- Transfer UI: https://usdt0.to/transfer
- Koywe PAYIN: https://docs.koywe.com/en/accepting-payments
- SCF integrations: https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/integration-track/integration-list

---

## 13. Prompt corto para el próximo agente

> Lumina = protocolo Scale, no Genesis. Tesis: empresa lockea RSE (factura, no cripto) → app certifica y cobra 97.5% → usuario no paga. Escrow v3 `CBZAI24…M3EJ`. Demo ABC = USDC testnet. Panel empresa suma unidades de la ficha (niño-mes / cribado), PDF 3 bloques, hash del hecho. Connect = ficha + auditoría chica, no open mic. PuenteMAE = ayuda social, sin OS. No inventar testnet USDT0. No commit salvo pedido. Leé `ABC-SCALE-NOTES.md`.

---

## Changelog

- 2026-09-12 — Track Scale, Connect + USDT0, rechazo a mocks y CosmosPay-thesis.
- 2026-09-13 — v3 escrow, assign, 97.5% a payout de la app, toolchain local.
- 2026-09-14 — Portal `/empresa`, riel PAYIN/Circle, unit economics, USDT0 = UI oficial no puente casero.
- 2026-09-14 noche — **Handoff reescrito.** Genesis = otros equipos. PuenteMAE = ayuda social, **fuera OS**. Esta nota es la fuente para continuar.
- 2026-09-15 — Panel de impacto: unidad en el hash, PDF 3 bloques, listing + unicidad, pack inversor `/empresa/impacto`.
- 2026-09-15 tarde — Plan de guerra: nada para Instaward. /jury live params, ToS listing, signer ≠ payout, guion 3 min. USDT0 lo compra Mst. E2E USDC espera faucet.
- 2026-09-15 noche — /jury pega hashes; `scripts/e2e-usdc.ps1` listo para cuando haya ≥40 USDC. Nav “Demo juez”. Forms ABC en /jury sin inventar PII.
- 2026-09-15 18:10 — Primeros 20 USDC Circle en sponsor. Anclap estacionado (no riel empresa).
- 2026-09-15 noche — :3000 OK. Faucet Circle pide reCAPTCHA (el agente no lo completa). E2E no corrió.
- 2026-09-15 19:10 — Cheat sheet ABC campo a campo contra el form live `/aplicar` (Scale; Genesis fields no se muestran). Apex bio lista. Sponsor USDC sigue en **20** (`200000000` stroops). Falta 2º faucet + PII para enviar.
- 2026-09-18 — Copy juez: forms ABC/Apex abren por problema (no por IDs). Home/presentation/jury/empresa/invest/connect/metadata alineados a una tesis de 20s.
- 2026-09-19 — **ABC enviado.** Scale · Lumina · 2 (Gabriel Alejandro Perea García + Adriano Gabriel Perea Martin). Confirmación on-page. Apex pendiente.
- 2026-09-19 tarde — Push Scale a GitHub (`scale/abc-2026` + `master`) para Vercel / workshop. 40 USDC listos para E2E.
