# Lumina Project Memory & Context Directory

Este archivo es la **fuente única de verdad (Single Source of Truth)** para el desarrollo y mantenimiento del protocolo Lumina en Stellar/Soroban. Debe ser consultado y leído al inicio de cada sesión para evitar la pérdida de contexto sobre decisiones arquitectónicas, estado del código, límites del MVP y convenciones del equipo.

---

## 🎯 1. Concepto y Visión de Lumina
Lumina es un **protocolo descentralizado de financiamiento de impacto social y clínico programable (ReFi)** sobre la red Stellar. 

### Diferenciador Clave de Hackathon:
En un ecosistema donde todos pitchean modelos aislados de Inteligencia Artificial, Lumina se posiciona como la **infraestructura de confianza financiera**. La IA (en este caso MIRA AI) es el motor que ejecuta la acción clínica, pero Lumina es el riel que valida criptográficamente esa acción y destraba los pagos automáticos on-chain desde fondos corporativos de RSE.

---

## 🛑 2. Alcance del MVP vs. Hoja de Ruta (Roadmap)

Es crucial no confundir la funcionalidad implementada hoy con lo planificado para el futuro:

### Implementado en el MVP (Fase 1 - Actual):
*   **Financiación y Custodia:** Los sponsors depositan USDC en custodia en el smart contract de Soroban.
*   **Cribado Clínico y Hashing:** El cuidador/padre realiza el test en MIRA AI. La aplicación genera un reporte PDF clínico y calcula su hash SHA-256 en el navegador.
*   **Oráculo y Notarización:** El backend de MIRA actua como Oráculo firmado. Toma el hash del PDF, genera la firma criptográfica y remite la transacción a Soroban.
*   **Liberación de Fondos a la Plataforma:** El smart contract verifica la firma del oráculo y transfiere los fondos de recompensa ($40 USDC) de la cuenta del sponsor a la wallet de la plataforma/sostenibilidad (no a médicos individuales).
*   **Deduplicación:** El hash del PDF se almacena temporalmente para evitar que se cobre dos veces el mismo reporte.

### Roadmap Futuro (NO IMPLEMENTADO en el MVP actual):
*   **Bounties de Pediatras (Fase 2):** Directorio on-chain donde los pediatras independientes se registran para validar casos complejos y recibir recompensas directas de Lumina en USDC.
*   **Stellar Disbursement Platform (SDP) (Fase 3):** Distribución directa de micro-crants automáticos en USDC a las billeteras móviles de las familias con diagnósticos de alto riesgo para cubrir terapias.

---

## 🛠 3. Arquitectura y Direcciones de Contratos (Testnet)

*   **Red de Stellar:** `Testnet`
*   **USDC Token Contract (SAC):** `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
*   **Lumina Escrow Contract:** `CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA`
    *   *Nota:* Este contrato cuenta con un **Registro de Oráculos Autorizados** gestionado por el Admin.
*   **MIRA Oracle Address:** `GDWOBCG7XPQZOMO7FAOJB73RDDJX4TV3OHP5CIBRYPI3TXMWRYMJ6FHV`
    *   *Secret Key:* `<ROTATED — stored in .env only, never in code>` (Configurado en el `.env.local` de MIRA).
*   **Admin / Platform Receiver Wallet:** `GANSQVDKALMQSXVNOBUWJGXJZ5OZFST6VVDDCOOYPQ5GSIZ2C2SHHPTF` (Dirección del Freighter del usuario).

---

## ⚠️ 4. Convenciones Técnicas y "Gotchas" del Proyecto

### 1. Compilación del Smart Contract (Rust):
El compilador por defecto de Rust (1.82+) genera binarios WASM con features de *multi-value* y *reference-types* que causan pánico al subir a Soroban.
*   **Solución:** Agregar el target de Soroban y compilar explícitamente usando:
    ```bash
    rustup target add wasm32v1-none
    cargo build --target wasm32v1-none --release
    ```

### 2. Aprobación de USDC (SAC `approve` arguments):
El método `approve` en el Stellar Asset Contract requiere **4 argumentos** en JavaScript:
*   Firma de llamada: `approve(from, spender, amount, expiration_ledger)`
*   `from`: Dirección del titular que autoriza (el Sponsor).
*   `spender`: Dirección del contrato Lumina.

### 3. Expiración Dinámica de Aprobación (`live_until` error):
Configurar un bloque absoluto fijo como `500,000` causa rechazo si la secuencia actual de la red de pruebas Stellar ya superó ese número.
*   **Solución:** Consultar el ledger actual vía RPC (`rpc.getLatestLedger()`) y sumarle bloques en el futuro (ej. `latestLedger + 120_000` bloques, que equivale a unos ~7 días).

### 4. Desestructuración de Freighter API:
La función `signTransaction` de `@stellar/freighter-api` no devuelve un string simple con el XDR firmado; devuelve un objeto conteniendo `{ signedTxXdr }`.
*   **Solución:** Desestructurar la variable `const { signedTxXdr } = await signTransaction(xdr, ...)` antes de enviarla a `submitSorobanTransaction()`.

### 5. Resiliencia de MIRA (No Bloqueante):
La notarización no debe interferir con la experiencia del médico o la familia. Si Stellar falla o no está configurado el oráculo, el error se registra en consola pero la descarga del PDF clínico se ejecuta normalmente.

### 6. Polling Límite en Transacciones (NOT_FOUND):
El Soroban RPC puede tardar en procesar o reflejar transacciones bajo congestión de Testnet.
*   **Gotcha 1:** El uso de bucles `while (status === "NOT_FOUND")` indefinidos congela la interfaz del usuario si una transacción se atasca.
*   **Solución:** Forzar un límite de intentos (máximo 30 segundos) con reintentos controlados y lanzar una excepción de timeout explícita para desbloquear el estado del cliente y notificar al usuario.
*   **Gotcha 2 (TRY_AGAIN_LATER):** Si el servidor RPC está congestionado, `sendTransaction` devuelve un estado `TRY_AGAIN_LATER` o `DUPLICATE` en lugar de `PENDING`. Si no se valida este estado antes del polling, el sistema buscará un hash que nunca se procesó, quedando en bucle infinito.
*   **Solución:** Lanzar error de inmediato si la respuesta no es `"PENDING"`.

### 7. Sincronización de Firmas de Contratos:
Al modificar firmas en el smart contract (como añadir `oracle` como primer argumento en `release_impact`), se deben actualizar todas las llamadas en el cliente JS.
*   **Bug Corregido:** El simulador de MIRA ([mira_bridge.ts](file:///f:/APLICACIONES/Lumina/lumina-web/src/lib/mira_bridge.ts)) seguía enviando solo 3 argumentos en lugar de 4, provocando que las transacciones fallaran en la simulación de Soroban. Ya está sincronizado con la firma del Registro de Oráculos.

### 8. Retroalimentación Visual de UI/UX y Simulación SEP-24:
*   **Feedback del Estado:** El spinner de carga (`Loader2` animado) en la caja de estado debe renderizarse condicionalmente basado en `loading` o `fiatLoading`. Al finalizar la transacción con éxito, debe reemplazarse por un check de validación (`ShieldCheck`) para evitar la sensación visual de que la operación sigue en curso.
*   **Acreditación en SEP-24 (ARS):** Debido a que el flujo bancario de pesos (ARS) es simulado sin firma de Freighter en cliente (el dinero tradicional entra al Anchor), la actualización del balance de custodia se simula en el cliente acumulando el valor en un estado local (`simulatedOffset`) que se suma al balance real leído en blockchain (`escrowBalance`). Esto actualiza los saldos en pantalla de manera instantánea al confirmarse la transferencia.

### 9. Time-Locks de Tarifas on-Chain y Compilación WASM:
*   **Time-locks en Rust:** La validación temporal se realiza comparando `env.ledger().timestamp()` con el último registro guardado. Para pruebas automatizadas de testutils, se importa `soroban_sdk::testutils::Ledger as _` para poder manipular el tiempo de bloque mediante `env.ledger().set_timestamp(time)`.
*   **Compilador `wasm32v1-none`:** En entornos Rust 1.82+, el compilador estándar WASM genera características avanzadas (como reference-types y multi-value) incompatibles con Soroban. Se debe compilar usando `--target wasm32v1-none` en lugar del clásico `wasm32-unknown-unknown` para asegurar la compatibilidad del bytecode al subirlo a la red.

---

## 📈 5. Modelo de Negocio y Riel de Sustentabilidad
Para financiar el mantenimiento del código abierto, incentivar a desarrolladores y hacer publicidad para atraer sponsors corporativos tradicionales, Lumina cobra una **comisión de protocolo del 2.5%** sobre cada liberación de impacto exitosa:
*   **1.0% para Desarrollo Abierto (Dev Bounties):** Financiamiento de programadores que aporten al core del protocolo o conecten nuevas aplicaciones.
*   **1.0% para Difusión y Publicidad:** Campañas de marketing para captar nuevos sponsors corporativos.
*   **0.5% para Soporte e Infraestructura:** Mantenimiento de nodos RPC de Soroban, hosting y auditorías de seguridad.

El **97.5%** restante se transfiere íntegramente a la plataforma ejecutora del impacto clínico para el soporte de la evaluación, sin intermediarios financieros. El pago a pediatras individuales queda relegado a la Fase 2 del Roadmap.

---

## 📁 6. Mapa de Directorios y Rutas
*   [contracts/lumina_escrow](file:///f:/APLICACIONES/Lumina/contracts/lumina_escrow/): Smart contract en Rust de Soroban.
*   [lumina-web](file:///f:/APLICACIONES/Lumina/lumina-web/): Frontend en Next.js del Portal de Sponsors y Deck de Presentación.
    *   `src/app/page.tsx`: Landing Page corporativa (sin referencias al hackathon, terminología de cribado estricta).
    *   `src/app/jury/page.tsx`: Portal exclusivo para el jurado (contratos, enlaces de testnet, guías locales).
*   [MIRA](file:///f:/APLICACIONES/Lumina/MIRA/): Repositorio de MIRA AI donde se implementó el hashing en cliente y el endpoint de oráculo.
*   `customer-discovery/methodology.md` — Guía de preguntas y metodología para las 3 entrevistas obligatorias de la Hackathon.
*   `business_architecture_proposal.md` (interno) — Propuesta estratégica de negocio, costos dinámicos, aportes parciales y diseño de dashboards corporativos. No incluido en el repo público.
