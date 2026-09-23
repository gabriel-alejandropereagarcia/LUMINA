# Hoja de ruta · Lumina

Este proyecto debe ser real. La hackathon es un recorte de ese mismo producto, no otro.

Actualizado: 22/9/2026 (48 h · código). Fuente de verdad de este archivo. Si un agente dice “después”, tiene que existir una fila acá.

Dueños: **código** (estas 48 h: el modelo en el repo) · **org** (CUIT, banco, merchant) · **contador** · **app** (MIRA / PuenteMAE).

---

## A decidir · cierran el diseño (no se puede codear a ciegas)

Estas no son “visión”. Si no se cierran, el panel, la factura y el informe salen contradictorios. Cada fila pide un sí/no escrito. La columna **propuesta** es la recomendación de la investigación; no está firmada.

| Decisión | Por qué importa | Propuesta | Quién cierra | Estado |
|---|---|---|---|---|
| Quién es Lumina frente a tesorería | Sin un CUIT no hay factura ni CBU. Si el CUIT es ONG, Lumina deja de ser riel y pasa a ser la causa. | SAS argentina que factura el honorario. No fundación, no “solo contrato”, no PSAV. | org | a decidir |
| Qué entra la empresa | CUIT es público: pegar un CUIT no prueba nada. El mail sin CUIT es un browser, no una empresa. | **La cuenta es la CUIT.** La llave es un mail corporativo comprobado (magic link). Varios mails, el mismo tablero. Razón social del padrón, no tipeada. | org + código | en código |
| Qué ve la empresa en su tablero | Si no ve sus movimientos y el destino, tesorería no puede auditar. Si el titular es cripto, no lo usa. | Órdenes, informe, PDF. En cada movimiento: pagó / eligió / cobró, con enlace al recibo público. No Freighter. No se llama donación. | org + código | en código |
| Un producto o dos | Donación (tope 5%, RG 2681) y factura de servicio (art. 83) no conviven en el mismo riel. | Un riel: factura por trabajo hecho. No donataria. Copy del panel: orden / informe, nunca “donar”. | org | a decidir |
| De qué cobra el cobrador | Si Koywe cobra 0,8% del capital, el 2,5% no alcanza. | Quote escrito: ¿% del capital o del honorario? Si es del capital, no se esconde en el 2,5%. | org | a decidir |
| Moneda de la orden | FX ~278 bps se come el honorario si Lumina lo absorbe. | Precio en USD. La empresa paga pesos del día. Cotización visible en la orden. | org + código | a decidir |
| Fundación / association | Un segundo sujeto que cobre rompe “un solo intermediario”. | No ahora. Si un día existe, cero pesos RSE (solo IP/grants). | org | a decidir |
| Qué se ve en público | Si todo es privado, Lumina no se entiende. Si se publican niños, es ilegal. Si se publican donantes, Lumina pasa a ser ONG. | Tres capas: el riel es de la CUIT; el recibo es siempre público; el camino muestra unidades de trabajo sin identidad. Default: **Empresa anónima**. Opt-in: aparecer como luz pública (nombre de la CUIT). Nunca DNI, nombre, escuela, clínica. | org + código | en código · org firmó anónima / luz pública |

Hasta que org firme la fila, el código asume la **propuesta**. No se implementa la otra vía en paralelo.

---

## 48 horas · 22–24/9 · dueño: código

Dos días míos. No de org. El jurado recorre Vercel, no este chat.

**Norte.** Un juez abre Empresas en Lumina, entra con CUIT y un mail, ve el tablero de esa CUIT, ve pagó / eligió / cobró (si hay recibo, leído de la red; si no, en trabajo), ve el pago del 19/9 en Recibos, y entiende: factura, 97,5% a la app, familia no paga. Sin Freighter. Sin jerga.

**No entra a las 48 h (no se finge):** SAS, CBU, CAE, pesos reales, USDT0, padrón ARCA, dictamen. Si aparece una clave (`RESEND_API_KEY`, `DATABASE_URL`, tesorería), se prende en el acto. No se espera sentado.

| Bloque | Ventana | Qué se construye | Hecho-cuando · el jurado hace esto |
|---|---|---|---|
| 0 · Existe | 0–2 h | Subir lo ya armado: CUIT, mail, reset, tres recibos, informe | En vercel.app `/empresa` pide CUIT · `04934c3` |
| 1 · Recibo vivo | Día 1 mañana | Horizon + Soroban: cada paso muestra fecha y monto, no un hash suelto. El 97,5% se lee del cobro si existe. Un componente para panel, PDF y `/jury` | Clic en “la empresa pagó” abre el pago; el título es humano · en código |
| 2 · Dato | Día 1 | Store con Postgres (`DATABASE_URL`). Sin URL no se finge persistencia. Tokens, CUIT, órdenes, certificados. Tests de alta y reset | Redeploy con URL: la misma CUIT sigue; sin URL: el panel lo dice · en código (falta `DATABASE_URL` en Vercel) |
| 3 · Entrar | Día 1 tarde | Mail Resend de producto. Auditoría de quién pidió link. PuenteMAE sin cuenta que confirma no se ofrece como cobro vivo | Pedís el link; si hay key, llega. Gmail sigue afuera · en código (falta `RESEND_API_KEY`) |
| 4 · Estado on-chain | Día 2 mañana | El tablero pregunta al contrato: ¿reservado, asignado, cobrado? Sin wallet. El JSON deja de ser la única verdad cuando hay recibo | Orden con hash: el estado coincide con testnet · en código |
| 5 · Una historia | Día 2 | Home, Empresas, Apps, Recibos, Probar: el mismo pitch. Copy audit. Presentación alineada. Footer empresa sin IDs de contrato | El juez no se pierde entre cinco voces · en código |
| 6 · Cierre | Día 2 tarde | Tests (CUIT, tokens, hash, recibos). Recorrido 19/9 intacto. Lista de lo que está en trabajo, en voz Lumina | `/jury` sigue mostrando el pago del 19/9 · en código |

Orden: **0 es bloqueante.** 1 y 4 son la diferencia de un experto en cadena. 2 y 3 son producto. 5 es adopción. 6 es no romper lo que ya ganamos.

---

## Ahora · recorte hackathon (hasta ~26/9/2026)

El panel se recorre. No se transfiere dinero real. No se finge CUIT ni CAE.

| Ítem | Dueño | Hecho-cuando | Estado |
|---|---|---|---|
| Empresas eligen qué financiar (tarjetas MIRA / PuenteMAE) | código | Visible en `/empresa/portal` | hecho |
| Loop reserva → app confirma → 97,5% (testnet / simulación) | código | Recibos 19/9 en `/jury` | hecho |
| Copy: Lumina al centro, sin rastro de correcciones | código | Nav: Empresas · Apps · Recibos · Probar. El pie abre la luz del 19/9, no el horizonte. El panel no dice que se movió plata si no hay tesorería | ahora |
| Cobro ARS etiquetado en trabajo | código | Rail `simulation`, aviso de no transferir | ahora |
| Tesorería y Koywe no se venden como vivos | código | `ops.treasuryReady` / `koyweReady` en false en Vercel | ahora |
| Alta por CUIT + link al mail + reset | código | `/empresa` pide CUIT y mail, no el nombre | ahora |
| Tablero público del camino (nodos de trabajo hecho) | código | Home: Hoy = 1 luz real 19/9 (MIRA). Horizonte = mapa denso: muchas empresas y muchas apps. Elegir un nodo ilumina el camino. Sin nombres de niños. Sin hashes inventados. | ahora |

---

## Siguiente · capa de software (el panel de una CUIT)

Identidad, recibos vivos, Postgres-si-hay-URL y estado de la reserva están en código. Falta prender las claves en Vercel (org).

Sin estas filas, el panel no es de una empresa: es de un browser.

| Ítem | Dueño | Ventana | Hecho-cuando | Estado |
|---|---|---|---|---|
| Persona jurídica Lumina (SAS/SRL) + CUIT + IVA RI + punto de venta | org | 7–21 días (IGJ SAS ~72 h + altas) | Constancia de inscripción activa | siguiente |
| Cuenta bancaria / CBU a nombre de Lumina | org | junto al CUIT | CBU para cobro y para devolver | siguiente |
| Contrato mandato + honorario 2,5% (visto contador) | contador | 7–14 días | PDF firmable, no es dictamen del repo | siguiente |
| Alta: CUIT + magic link al mail corporativo | código | ahora | Misma CUIT, mismo panel, otro browser. Padrón ARCA: razón social | ahora |
| Mails autorizados por CUIT; no Gmail | código | ahora | Rechazo de dominio público | ahora |
| Reset de acceso: nuevo link + cierra las demás entradas | código | ahora | Epoch de sesión; tokens viejos no sirven | ahora |
| Persistencia Postgres (no `.data` en Vercel) | código | 48 h · bloque 2 | Redeploy no borra empresas ni órdenes si hay `DATABASE_URL` | ahora |
| Envío de mail (Resend) para el link | código + org | ahora | Link llega con `RESEND_API_KEY`. Sin key: en trabajo | ahora |
| Tres recibos por orden: pagó / eligió / cobró (hashes distintos, no un `txHash`) | código | checkpoint 23/9 | En el panel, cada paso con etiqueta humana y enlace al recibo | ahora |
| Informe de la empresa: unidades + PDF + CSV, filtrado por CUIT | código | checkpoint 23/9 | Tesorería imprime el mismo resumen en otro dispositivo | ahora |
| Merchant Koywe sandbox a la CUIT Lumina | org | 7–21 días (KYB) | PAYIN sandbox acredita una orden | siguiente |
| Webhook Koywe firmado + idempotencia + conciliación | código | junto al merchant | Orden pasa a reservado sin botón “simular” | siguiente |
| Tesorería: reserva al acreditar; secreto en KMS no en chat | código + org | junto a Koywe | `treasuryReady` true con evidencia de depósito | siguiente |
| Claves oracle de cada app (MIRA viva; PuenteMAE o no se ofrece vivo) | app | 7–14 días | Confirmación de trabajo de esa app | siguiente |
| Opt-in: publicar el nombre de la CUIT en el camino | código | ahora | Toggle en el panel; default Empresa anónima | ahora |
| Luces nuevas desde certificados cobrados (sin PII) | código | ahora | Home suma un nodo solo si el certificado tiene recibo de cobro y no es simulación. Nombre = CUIT, y solo con opt-in | ahora |

---

## Forma de existir (investigación 21/9)

Cierre escrito: sección **A decidir**. Abajo es el marco que el código asume hasta que org firme otra cosa.

No se asumió “es una empresa”. Se comparó fundación, cooperativa, protocolo sin CUIT, fideicomiso, PSAV, Foundation+OpCo, GiveDirectly, SDP/Stellar, Allo, Endaoment, Open Collective, SIB/VIS CABA, Giveth.

**Marco:** Lumina es el riel. Un solo sujeto cobra a la empresa. El contrato es el recibo. La app es el destino del trabajo. El cobrador de pesos no es intermediario social. Fundación no cobra. Protocolo solo no le sirve a tesorería.

| Ítem | Dueño | Ventana | Hecho-cuando | Estado |
|---|---|---|---|---|
| Persona jurídica que cobra: SAS argentina (CUIT). No ONG, no PSAV, no “solo contrato” | org | 7–21 días | Constancia de inscripción. Objeto: riel de pago por trabajo hecho | siguiente |
| Protocolo (Soroban) como recibo y regla 97,5/2,5 — no como quien factura | código | ya en testnet; vivo con tesorería | Empresa nunca paga en cripto | ahora |
| Cobrador = caño (Koywe/Alerce). No factura. No elige la causa | org | con merchant | Orden en pesos a la CUIT Lumina | siguiente |
| Fundación / association “estilo SDF”: solo IP/grants, **cero pesos RSE** | org | 12+ meses, opcional | Si se crea, no aparece en la factura de la empresa | fecha |
| No riel de donaciones; no Lumina-PSAV hasta custodiar AV de terceros | org | siempre | Un producto: riel, no ONG ni exchange | siguiente |

Lumina es una **empresa** (SAS/SRL). No es donataria. Investigación 21/9: Ley de Ganancias arts. 81/85 y 83; RG 2681; IVA 21%; Ganancias sociedades 25/30/35% (escala ARCA 2026); BCRA A 7175; Decreto Salta 517/11; mecenazgo CABA es otro régimen.

| Ítem | Dueño | Ventana | Hecho-cuando | Estado |
|---|---|---|---|---|
| Dictamen escrito: el pago a Lumina es **servicio documentado**, no donación | contador | 7–14 días, con el contrato | Memo de 2 páginas firmado. Copy del producto no dice “donar” | siguiente |
| No construir riel de donaciones (ONG / RG 2681) | org + código | siempre | Un solo producto: factura por trabajo hecho | siguiente |
| Precio en USD; la empresa paga pesos del día; Lumina no absorbe FX | org + código | antes del primer peso real | Cotización visible en la orden | siguiente |
| Quote del cobrador (Koywe): ¿% del capital o del honorario? | org | con el merchant | Número escrito. Si es sobre el capital, no entra escondido en el 2,5% | siguiente |
| P&amp;L mínimo: ticket de campaña (≥ US$ 1.000), no el cribado de US$ 40 | org | con el dictamen | Una hoja: honorario − cobrador − IIBB − opex | siguiente |
| Pesos 12 meses: cobrador o cuenta de anticipos, no caja operativa mezclada | contador + org | antes de Koywe live | Esquema que no sea captación de ahorro (BCRA) | siguiente |
| El PDF de unidades es prueba del gasto (fehaciencia art. 83) | código + contador | con la factura | El auditor de la empresa puede asentar el proveedor | fecha |
| Balance social / RT 36 (Salta): exportar unidades al informe de la empresa | código | 30–60 días | CSV/PDF que un contador pueda pegar al balance socioambiental | fecha |

---

## Factura y cumplimiento · cuando ya hay CUIT Lumina

| Ítem | Dueño | Ventana | Hecho-cuando | Estado |
|---|---|---|---|---|
| Factura A/B del **2,5% + IVA** al confirmarse el trabajo (WSFEv1 o Comprobantes en línea) | código + contador | 14–30 días post CUIT | CAE descargable en el panel, a la CUIT de la empresa | fecha |
| Recibo de fondos del capital (no es CAE de venta) | contador + código | junto a la factura | Dos papeles: fondos vs honorario | fecha |
| Nota de crédito / devolución a CBU a los 12 meses | código + org | antes del primer lock real | Plata vuelve a la empresa, Lumina cobra 0% | fecha |
| IIBB jurisdicción + alta impuestos | contador | con el CUIT | Inscripción visible en constancia | fecha |
| Términos, privacidad Ley 25.326, DPA con apps | org | 14 días | Links en Empresas y Apps | fecha |

---

## Operación continua

| Ítem | Dueño | Ventana | Hecho-cuando | Estado |
|---|---|---|---|---|
| Staging ≠ producción | código | con Postgres | Datos de prueba no mezclan con empresas reales | fecha |
| Backups diarios + alerta de cobro fallido | código | con Koywe live | Restore ensayado una vez | fecha |
| Roles en la empresa (quién paga vs quién mira) | código | 30–60 días | Dos mails, mismos aportes, permisos distintos | fecha |
| Revisión humana de altas de apps + pausa | org + código | ya en ficha; con proceso | App pending no sale al panel de empresas | fecha |
| Pago de la app al beneficiario en pesos (docente / familia no paga) | app | con cada app listed | Promesa en ficha; Lumina no ejecuta esa pata | fecha |
| USDT0 oficial (solo mainnet, no se finge testnet) | código + org | cuando exista unidad oficial | 1 unidad + hash en `/jury` | fecha |
| Empresas de HQ (Circle Mint, wire USD) | org | cuando haya cliente afuera | Orden Circle, SA argentina no es clienta | fecha |
| Más de una voz si hay disputa de un trabajo | org | 90+ días | Proceso escrito; en trabajo hasta entonces | fecha |

---

## Hecho-cuando mínimo para decir “una empresa ya puede usar Lumina”

1. CUIT Lumina + CBU + contrato visto por contador.  
2. Empresa entra con **su** CUIT y un mail que comprobó.  
3. Paga pesos reales a Lumina (Koywe).  
4. Lumina reserva.  
5. La app confirma. 97,5% sale. Factura A/B del 2,5% + IVA.  
6. El dato sigue ahí después de un deploy.

Hasta que eso esté, el producto se recorre y se dice **en trabajo**. No se pide transferir pesos.
