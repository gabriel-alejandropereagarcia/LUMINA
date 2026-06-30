# Entrevista de Validación: Sector Minería y Relaciones Comunitarias

* **Entrevistada:** Ing. Claudia Herrera
* **Cargo:** Responsable de Administración y RSE
* **Empresa:** Minera del Norte S.A. (Operación de Litio, Salta, Argentina)
* **Fecha:** 30 de Junio de 2026
* **Foco de Validación:** Auditoría de impacto en comunidades locales, gobernanza de fondos de RSE, escrows programables y cumplimiento de normativas de Compliance.

---

### Bloque 1: Exploración del Problema (Gobernanza y Rendición de Cuentas)

**Pregunta 1: Actualmente, ¿cómo estructuran y auditan las donaciones o fondos que destinan al desarrollo de las comunidades cercanas a la operación?**

> **Respuesta de Claudia Herrera:**
> "Es uno de nuestros dolores de cabeza más grandes. Hoy trabajamos con presupuestos anuales asignados por RSE que se canalizan a través de cooperativas, ONGs locales o directamente convenios con los municipios. El flujo es simple: ellos presentan un proyecto (por ejemplo, refaccionar un colegio o hacer un censo sanitario local), nosotros les transferimos un adelanto del 50%, y el resto se va liberando contra presentación de facturas de avance de obra. 
> El problema es que el control es puramente analógico. Las facturas llegan tarde, a veces con conceptos dudosos, y no tenemos forma real de validar si el aula se pintó o si las raciones de comida llegaron a la gente, excepto mandando a nuestro propio personal a inspeccionar físicamente en el territorio, lo cual consume tiempo y recursos."

**Pregunta 2: ¿Cuáles son los principales cuellos de botella administrativos a la hora de liberar un presupuesto de RSE?**

> **Respuesta de Claudia Herrera:**
> "El cuello de botella es el control de rendición de cuentas y el compliance interno. Nosotros reportamos a nuestra casa matriz en Canadá. Ellos nos exigen normas anticorrupción muy estrictas (como la ley FCPA). Si transferimos fondos a un municipio y el municipio no rinde cuentas claras o utiliza el dinero para campaña política en lugar del fin social, legalmente la responsabilidad cae sobre la empresa. Por ende, la liberación de fondos pasa por tres niveles de aprobación interna en Salta y Buenos Aires, lo que hace que los desembolsos tarden meses y las ONGs locales se queden sin capital de trabajo en el medio."

**Pregunta 3: ¿Han tenido situaciones donde el dinero destinado a un hito no se pudo comprobar con certeza si se ejecutó correctamente?**

> **Respuesta de Claudia Herrera:**
> "Sí, lamentablemente pasa seguido. Hace un año financiamos un programa de asistencia pediátrica en una comunidad nativa mediante un intermediario local. Nos entregaron un reporte en Word con fotos genéricas y una planilla de Excel con firmas de los padres, pero no teníamos ninguna certeza científica o documental de que esas consultas realmente ocurrieron. Tuvimos que dar por buena la rendición porque legalmente no podíamos exigir un historial médico por temas de privacidad, pero nos quedó la duda de si se atendieron a los 100 niños presupuestados o solo a 10."

---

### Bloque 2: Reacción a la Solución de Lumina (Escrow & Apps Verificadoras)

**Pregunta 4: Imaginate un sistema donde la minera bloquea los fondos en una garantía digital (escrow). El dinero no se transfiere por adelantado al intermediario; queda custodiado y solo se libera automáticamente a la cuenta de la ONG local cuando una aplicación de salud provincial o un test digital certificado (como MIRA AI) firma criptográficamente que la evaluación médica de un niño se completó con éxito. Si el proyecto no avanza o no se cumplen los hitos en 12 meses, la minera recupera el 100% de su capital. ¿Qué opinás de este flujo?**

> **Respuesta de Claudia Herrera:**
> "A nivel administrativo, me parece brillante y nos resolvería el 80% de las fricciones con compliance legal. El concepto de 'pago contra hito verificado' elimina de raíz el riesgo de malversación de fondos o desvío político, porque el dinero va directo de nuestra cuenta en garantía a la cuenta de quien ejecuta el impacto en el momento exacto en que ocurre. Además, el time-lock de 12 meses para recuperar los fondos si la ONG no ejecuta es una red de seguridad espectacular que hoy no tenemos; hoy si transferimos un adelanto y la ONG desaparece, ese dinero se da por perdido."

---

### Bloque 3: Validación del Modelo de Negocio y Barreras Corporativas

**Pregunta 5: Lumina genera un hash criptográfico inalterable on-chain de cada reporte de hito cumplido (sin revelar datos personales). ¿Cómo impactaría esto en sus reportes anuales de ESG para auditorías internacionales?**

> **Respuesta de Claudia Herrera:**
> "Sería un salto de calidad enorme. Los auditores de ESG internacionales (como MSCI o Sustainalytics) son súper exigentes y cada vez desconfían más de las planillas de Excel firmadas a mano o los reportes en PDF corporativos porque son fácilmente alterables. Tener un ledger público e inalterable donde cada transacción esté atada criptográficamente a una firma digital verificada (como el oráculo de MIRA o un sensor satelital) nos permitiría automatizar la auditoría. Ya no tendríamos que contratar consultores externos costosos para validar los reportes de RSE en campo; la blockchain es la prueba inalterable."

**Pregunta 6: A nivel legal y corporativo en el sector minero, ¿cuál sería el principal freno o barrera para adoptar Lumina?**

> **Respuesta de Claudia Herrera:**
> "La traba principal no es técnica, es normativa sobre la tesorería corporativa. Nosotros no podemos operar criptomonedas ni stablecoins (como USDC) de forma directa en nuestro balance contable. Por regulaciones del Banco Central y normativas corporativas internas, las mineras solo podemos hacer transferencias bancarias en Pesos (ARS) o Dólares (USD) oficiales. 
> Si Lumina nos ofrece un 'fiat-to-crypto gateway' (es decir, que nosotros hagamos una transferencia bancaria normal a un fideicomiso en Argentina que convierta eso a USDC y lo bloquee en el contrato de Soroban sin que nosotros toquemos el token directamente), la adopción sería inmediata. Si nos obligan a abrir una cuenta corporativa en un exchange de cripto y comprar USDC, legalmente no podemos hacerlo hoy."

---

### 📌 Conclusiones de la Validación:
1. **Validación del dolor:** La falta de auditoría real en campo y el miedo a desvíos políticos de fondos es un dolor crítico en el sector de minería y RSE.
2. **Validación de solución:** El modelo de escrow no-custodial con retiro temporal (time-lock) es percibido como la mejor red de seguridad de cumplimiento.
3. **Pivote clave de Roadmap:** Para venderle a corporativos tradicionales, Lumina debe desarrollar una pasarela de pago bancario en fiat que interactúe con el smart contract de Soroban por detrás, evitando que la tesorería corporativa tenga que custodiar criptoactivos directamente.
