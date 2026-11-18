# Auditoría integral de Agntia Finanzas y plan de sus 42 campañas

**Repositorio:** [uniscrolliabrain-cloud/agntia-finanzas](https://github.com/uniscrolliabrain-cloud/agntia-finanzas/tree/f811638c9bee34efa99d46be5422e044089794db)  
**Referencia revisada:** `f811638c9bee34efa99d46be5422e044089794db` · **Fecha:** 13-11-2026  
**Naturaleza:** auditoría documental y guía para implementación futura, no asesoramiento financiero, contable, fiscal o jurídico.

## 1. Resumen para el propietario

Agntia Finanzas propone un SaaS de tesorería y FP&A capaz de convertir información económica autorizada en posición de caja, presupuestos, escenarios y reportes explicables. Se vincula a `agente`, donde vive el agente canónico, mediante un twin acotado; también contempla clientes externos con portal propio.

La decisión más importante del diseño es distinguir **fuente, cálculo, hipótesis y efecto**. Un saldo observado no siempre es saldo disponible; una factura no es dinero cobrado; una previsión no es caja real; un presupuesto aprobado no autoriza un pago. El LLM puede explicar o proponer, pero no debe determinar hechos, cálculos monetarios, permisos, órdenes bancarias o decisiones profesionales por sí solo.

El repositorio revisado es **DOCUMENTATION_ONLY**: no contiene app, SDK, proveedores conectados ni tests de producto ejecutados. Sus 42 campañas son fases de ingeniería `NOT_STARTED`; 294 tareas y 84 escenarios son planificación, no comprobaciones realizadas. No existe un boilerplate ejecutable que pueda auditarse como código de producción.

**Recomendación principal:** elegir una primera vertical de datos sintéticos y solo lectura: extractos y facturas → staging sin verificar → mapping revisado → conciliación propuesta → posición de caja con fechas y monedas → presupuesto/escenario → revisión humana → reporte reproducible. `PaymentProposal` puede ser un borrador, pero en el piloto **no ejecuta transferencias, pagos, cambios de cuenta, asientos o presentaciones fiscales**.

### Diagnóstico por área

| Área | Acierto | Brecha y mejora |
|---|---|---|
| Modelo monetario | Decimal, divisa, exponente y signos explícitos. | Definir precisión y redondeo por operación, fuente y jurisdicción; verificar cálculos con fixtures y propiedades. |
| Fuente y conciliación | Distingue observación, mapping y propuesta. | Un importe igual no prueba un match; requiere evidencia, conflictos y revisión. |
| Posición de caja | Conserva fuente y fecha y no confunde proyección con saldo. | Falta definir cobertura, disponible vs contable, saldos stale, duplicados y FX. |
| Forecast | Declara escenarios e incertidumbre. | No hay validación de backtesting, criterios de aptitud o garantías de liquidez. |
| Efectos | Pagos y contabilizaciones fuera del piloto. | Debe existir una frontera técnica real que impida writes o transferencias, no solo un aviso. |
| Proveedores | Investiga ERPNext, ledgers y Metabase como candidatos. | Ediciones, permisos, licencias y binding por empresa no se han probado; elegir un camino. |
| Seguridad | JWT, ACL, mandatos y aislamiento end-to-end previstos. | Probar DB, workers, búsqueda, ficheros, dashboard embebido y exports con roles reales. |
| Operación | Propone idempotencia, outbox, escenarios de fallo y restore. | No se ha medido coste, latencia, recuperación, carga o SLA. |

## 2. Alcance y fuentes revisadas

Se examinó el árbol remoto y se contrastaron README, instrucciones, contratos, runtime, adaptadores, evaluación, handoff e información recuperada del manifiesto. Las 42 fases siguientes se derivan del índice, contratos, escenarios de evaluación y extractos accesibles del manifiesto. **La extracción del manifest se truncó; no se afirma haber leído exhaustivamente sus 294 tareas.** Cada ficha y su entrada completa deben leerse al ejecutar la fase.

Referencias fijadas: [índice de campañas](https://github.com/uniscrolliabrain-cloud/agntia-finanzas/blob/f811638c9bee34efa99d46be5422e044089794db/docs/campaigns/README.md) · [manifest](https://github.com/uniscrolliabrain-cloud/agntia-finanzas/blob/f811638c9bee34efa99d46be5422e044089794db/docs/campaigns/campaign.json) · [contratos](https://github.com/uniscrolliabrain-cloud/agntia-finanzas/blob/f811638c9bee34efa99d46be5422e044089794db/docs/contracts/01-contratos.md) · [evaluación](https://github.com/uniscrolliabrain-cloud/agntia-finanzas/blob/f811638c9bee34efa99d46be5422e044089794db/docs/09-evaluacion.md) · [handoff](https://github.com/uniscrolliabrain-cloud/agntia-finanzas/blob/f811638c9bee34efa99d46be5422e044089794db/docs/release/HANDOFF.md) · [fuentes y repos](https://github.com/uniscrolliabrain-cloud/agntia-finanzas/tree/f811638c9bee34efa99d46be5422e044089794db/docs/research).

El mapa documental del padre indica `54b8d5407a8576459448c4d059a877297d18ca7a`; es una lectura selectiva y no se ha auditado de nuevo el código completo. No se han usado cuentas bancarias, instalado ERPNext o Metabase, verificado proveedores o hecho una revisión fiscal, jurídica o de licencias exhaustiva. Los precios y normativas deben revisarse en el momento y territorio aplicables.

Este archivo está en el espacio de trabajo de la conversación, **no en el repositorio remoto de finanzas**. No se ha modificado ni publicado ningún repo externo.

## 3. Hallazgos prioritarios

### P0.1 — Precisión y semántica monetaria

**Riesgo.** Un informe puede verse convincente y estar equivocado por un signo, escala, exponente, moneda, tasa o fecha. `float` binario, redondeo implícito y conversiones múltiples pueden producir diferencias que el modelo no detecte.

**Propuesta.** `Money` debe transportar cantidad decimal exacta, currency y exponente; cada cálculo declara precisión, redondeo, unidad y convenciones de signo por fuente. Guardar fecha contable `bookedAt`, fecha valor `valueAt`, fecha de extracción y periodo económico sin tratarlas como sinónimos. No sumar monedas directamente. Testear importes negativos, comisiones, devoluciones, parciales, monedas con exponentes distintos y límites de precisión. El cálculo se ejecuta con una DSL o funciones permitidas, no `eval` o código generado por el modelo.

### P0.2 — Caja observada no equivale a caja disponible

**Riesgo.** Sumar balances de días distintos, cuentas incompletas o monedas distintas puede fabricar una cifra de tesorería.

**Propuesta.** Cada `CashPosition` identifica cuenta, fuente, balance observado y disponible si la fuente lo afirma, fecha y zona, cobertura, restricciones y freshness. Sumar directamente solo saldos verificados comparables y misma moneda/as-of; si se usa FX, informar moneda base/cotizada, tasa, fuente, fecha y redondeo por separado. Datos `missing`, `unknown`, `stale` y cero son distintos. Un saldo proyectado nunca se etiqueta como confirmado por banco.

### P0.3 — Conciliar no es contabilizar ni pagar

**Riesgo.** Dos proveedores pueden tener movimientos con el mismo importe; cargos agrupados, abonos y pagos parciales complican el match. Un match heurístico erróneo podría ocultar deudas o duplicar ingresos.

**Propuesta.** `ReconciliationProposal` debe indicar candidatos, evidencia, diferencias de fechas/moneda/importe, tolerancia y explicación reproducible; ambigüedad produce `needs_review` o conflicto, no confirmación automática. Un humano revisa conforme al alcance; el piloto no postea conciliaciones al ERP, no borra originales y no transforma coincidencia en asiento oficial.

### P0.4 — Pagos, beneficiarios y aprobación separados

**Riesgo.** Una factura que vence o un presupuesto aprobado no autorizan transferir dinero. Un mensaje hostil o cambio de IBAN es una superficie crítica de fraude.

**Propuesta.** Mantener capacidades de transferencia, cambio de beneficiario y billing deshabilitadas en el piloto. Un borrador `PaymentProposal` no es una instrucción de pago. Si se plantea un futuro proceso real, requerirá otro encargo, verificación independiente de beneficiario, segregación de funciones, revalidación y aprobación ligada a importe, moneda, cuenta, propósito, revisión y expiración. Cambio de cuenta o importe invalida la aprobación; un LLM o un sí hablado nunca aprueba.

### P0.5 — Autorización y aislamiento financiero

Verificar JWT Supabase con firma, issuer, audience y tiempos; resolver membership y ACL por empresa, cuenta, recurso, documento y campo en servidor. Separar tenant origen del operador y tenant objetivo del mandato. Exigir PEP en API, workers, DB/RLS, Storage, búsqueda/vector, caché, Realtime, exports y dashboard embebido. `service_role` o un token ERP con múltiples empresas no sustituyen control por tenant. Ningún `tenantId`/capability escrito por el modelo es autoridad.

### P0.6 — Efectos distribuidos y audit

Preview local no hace HTTP de escritura, paga, firma, registra ni gasta. Si en una futura autorización existiera una operación externa permitida, persistir intent, hash, idempotency key, audit y outbox en transacción local; revalidar mandato/approval/scope inmediatamente antes del efecto. La transacción no incluye el proveedor. Timeout tras posible aceptación = `outcome_unknown`; consultar referencia fiable o bloquear y escalar, nunca cambiar key o proveedor para forzar un resultado. No existe promesa genérica de exactly-once HTTP.

### P1 — Planificación útil y honesta

1. **Modelo reproducible:** versionar periodo, fuente, moneda, convenciones, reglas y supuestos. Preservar snapshot aceptado; datos tardíos crean revisión o reapertura.
2. **Separar contabilidad y gestión:** el ERP/banco custodia originales; proyecciones locales sirven para análisis. La gestoría o profesional competente decide lo fiscal y contable que corresponda; el piloto no presenta impuestos ni afirma cierre oficial.
3. **Escenarios, no predicciones ciertas:** horizonte, ingresos/salidas, fecha de corte y supuestos con fuente y sensibilidad. Impago, retraso y shocks deben ser visibles; no prometer liquidez o rentabilidad.
4. **Coste de servicio diferente de presupuesto de cliente:** las bolsas ilustrativas 30/70/300 € no son precios verificados ni autorizan gasto o inversión. Medir modelos, infraestructura, almacenamiento y revisión humana con workload real antes de ofertar.
5. **Elegir un camino de datos:** CSV sintético primero y, si se autoriza, un ERP o fuente bancaria read-only con versión, licencia y rol probados. No instalar ERPNext, dos ledgers y Metabase para aparentar cobertura.

## 4. Modelo económico: las distinciones que no se pueden perder

| Concepto | Qué representa | Qué no demuestra |
|---|---|---|
| `TransactionFact` | Movimiento con fuente, identidad, importe, moneda, fechas y signo normalizado. | Que sea único o que esté conciliado por coincidir el importe. |
| `Receivable` | Derecho de cobro según factura/contrato y estado. | Que la venta esté cobrada o libre de disputa. |
| `Payable` | Obligación o factura con vencimiento y estado revisado. | Autorización de pagar o cambiar beneficiario. |
| `CashPosition` | Vista de saldos comparables con fecha, fuente y cobertura. | Disponibilidad inmediata si el banco no la confirma. |
| `BudgetVersion` | Plan versionado de ingresos/costes/periodos. | Un gasto individual autorizado o saldo bancario. |
| `ForecastRun` | Cálculo de flujos bajo supuestos y horizonte concretos. | Garantía de liquidez o un hecho futuro. |
| `Variance` | Actual − presupuesto bajo convención declarada. | Causa automática de la desviación. |
| `Runway` | Resultado condicionado a definición de caja, burn y ventana. | Fecha segura o estimación válida con burn cero sin tratamiento explícito. |
| `CloseChecklist` | Cierre analítico con cutoff y pendientes. | Cierre contable/fiscal oficial certificado. |
| `PaymentProposal` | Borrador de finalidad, importe y beneficiario. | Orden de pago o aprobación ejecutable en el piloto. |

### Ejemplo de caja y tratamiento de datos

Dos cuentas sintéticas, una en EUR y otra en USD, tienen fechas distintas. El sistema debe mostrar ambas con su fecha y cobertura, no sumarlas como si fueran una sola cifra en euros. Si se decide una conversión analítica, debe preservar tasa, base/cotización, fuente, fecha y método de redondeo; una tasa desconocida bloquea ese total o lo marca pendiente. Una factura de 1.000 EUR con cobro parcial de 400 EUR conserva el hecho original, el cobro y el saldo pendiente conforme a reglas revisadas; no elimina la factura ni la marca pagada íntegramente.

Un gasto de 100 EUR frente a presupuesto de 80 EUR puede mostrarse como `actual − budget = +20 EUR`, pero si la convención de presentación dice que positivo es desfavorable para gasto debe indicarse. No atribuir la desviación a un proveedor o campaña sin evidencia adicional. Este es un ejemplo conceptual, no un resultado calculado por el producto.

## 5. Boilerplate y arquitectura futura

El stack propuesto por el repo es TypeScript/Hono/pnpm, Postgres/Supabase, workers/outbox y adaptadores. En el SHA revisado no existe una app o lockfile. Los siguientes paths son **recomendaciones futuras de esta auditoría**, no archivos existentes. Las fichas proponen `docs/implementation/cNN/README.md`, `EVIDENCE.md`, `TESTS.md` y `RISKS.md` por fase.

```text
apps/api/src/                # rutas nominadas, DTOs, PEP
apps/worker/src/             # revalidación, outbox, reconciliación
apps/portal/                 # revisión y reportes por ACL
packages/contracts/src/      # Money, eventos, errores y validación
packages/auth/src/           # JWT, membership, scope, mandato
packages/domain/src/         # CompanyFact, periodos, AuthorityMap
packages/imports/src/        # CSV seguro, staging, fuente y dedup
packages/mapping/src/        # mappings versionados y revisión
packages/ledger/src/         # proyecciones, no posteo fiscal automático
packages/reconcile/src/      # candidatos, evidencia y conflictos
packages/cash/src/           # posición, cobertura y freshness
packages/receivables/src/ payables/src/ # facturas y estados
packages/budget/src/         # presupuesto y CAS
packages/formulas/src/       # AST tipado, DAG, unidades y Decimal
packages/scenarios/src/      # supuestos, forecast y stress
packages/fx/src/             # fuentes, fecha, base/cotización, rounding
packages/reporting/src/      # snapshots y definición de métricas
packages/adapters/           # ERP/ledger/banco/reporting opcionales
packages/jobs/ outbox/       # idempotencia y resultados inciertos
packages/sdk/ host-bridge/   # interfaz nominada al padre
migrations/                  # FKs, RLS, roles y versionado
 tests/security/ integration/ e2e/ # fixtures sintéticos A/B/P
```

No crear paquetes vacíos por adelantado. El núcleo recibe hechos y contexto autorizado, no credenciales ni consultas libres del LLM. Los adaptadores solo implementan lecturas y operaciones concretas, ligadas a empresa remota/rol/versión; un `CapabilityReport` caduca cuando cambia el rol o edición. El modelo puede explicar un cálculo obtenido de funciones deterministas, pero no ejecutar fórmulas o SQL arbitrarios.

**Frontera canónica:** banco/ERP custodian hechos originales; el servicio conserva proyecciones y versiones; gestoría gobierna lo fiscal delimitado; un profesional revisa cuando corresponda. `Actor.tenantId` de origen no se sustituye por targetTenant; el twin conserva `runtimeId`, `roleId`, `personaId?`, `kernelTurnId?`, provenance y delegante/ejecutor. Eventos propios no se inventan como enums del padre; `SystemEvent` nativo `"1.0"` se mapea solo tras cotejo. `HOST_BRIDGE_NOT_VERIFIED` permanece visible si solo hay fake.

## 6. Agentes autónomos y control de ejecución

Los roles de coordinador, implementador, revisor financiero humano, seguridad, integración y verificador son funciones operativas, no nuevos agentes canónicos. Un único escritor por contratos o migraciones; revisión independiente cuando sea posible. El modelo no adquiere competencia profesional por su nombre y no puede aprobar, ejecutar pagos, modificar `agente` o usar credenciales sin autorización.

Para cada campaña: leer ficha y manifest al SHA, registrar baseline y precondiciones, proponer archivos/diff, implementar solo tras autorización posterior, usar fixtures A/B/P, ejecutar comprobaciones adecuadas con exit real y registrar `PASS`, `BLOCKED`, `NOT_VERIFIED` o `NOT_STARTED`. Mantener por separado capacidades y entornos: fake, sandbox y proveedor real no son intercambiables. Sin cuenta, red, licencia o Docker, el gate real queda sin verificar y la capacidad apagada.

**Checkpoints:** C05/C10/C15/C20/C25/C30/C35/C40/C42. Cada reporte incluye SHA/diff/PR si existe, fuentes y versiones, fixtures y estado protegido, tests ejecutados/pasados/fallidos/skipped, receipts sanitizados, costes medidos o desconocidos, riesgos y dependencia siguiente. No volcar extractos, IBAN, tokens, PII o prompts privados a Git.

**Dependencias opcionales:** ERPNext C13, Beancount/hledger C14, banca C15 y Metabase C32 son candidatos, no una obligación de desplegarlos todos. Conservar la secuencia del manifest; documentar selección/no selección y estado sin verificación, y solicitar decisión explícita del gate antes de avanzar por una capacidad dependiente. Si hace falta cambiar dependencias, proponer ADR y modificación autorizada; no marcar PASS a un proveedor omitido ni habilitarlo.

### Contrato breve para un agente implementador

```text
Fase FIN-Cxx; SHA y fuentes; gate anterior; archivos autorizados y diff propuesto.
Fixture A/B/P: documentos ficticios y datos de importación no personales.
Invariantes: Decimal/divisa/fecha; provenance; JWT/ACL/mandato; no pagos;
  aprobación humana donde aplique; idempotencia; audit y resultado incierto.
Pruebas: comando/entorno/versión/exit/resultado/estado protegido y revisor.
Cierre: PASS/BLOCKED/NOT_VERIFIED, capacidad deshabilitada, riesgos y siguiente gate.
Prohibido: datos reales, producción, submit ERP, transferencia, fiscalidad automática,
  secretos en logs, SQL/HTTP/shell libre o cambios al padre.
```

## 7. Las 42 campañas explicadas

Las fichas originales contienen las siete tareas y dos gates previstos de cada fase. Las rutas de código siguientes son propuestas de esta auditoría; los archivos de evidencia por fase son también futuros. Los resultados enumerados son **gates a ejecutar**, no tests ya pasados.

### FIN-C01 — Baseline, fuentes y alcance

Congelar SHA del repo, padre y referencias, instrucciones, permisos y herramientas; registrar discrepancias y entorno disponible. **Archivos:** `docs/implementation/c01/` y opcional `docs/baseline.md`. **Gate:** cambio del padre obliga a cotejar contratos; no usar cuentas reales o un mock como prueba de proveedor.

### FIN-C02 — Autoridad por dominio y contrato SaaS

Definir operador, empresas, custodios, responsable de cálculo, revisor, gestoría y único ejecutor por efecto. **Archivos propuestos:** `docs/authority-map.md`, `packages/domain/src/work-order.ts`, evidencia C02. **Gate:** dos servicios no procesan el mismo efecto dos veces; contratar el SaaS no autoriza pagar o acceder a todas las cuentas.

### FIN-C03 — Supabase JWT y principal

Verificar firma, issuer, audience y tiempos; resolver membership y scope de empresa/cuenta/recurso/campo en servidor. **Archivos:** `packages/auth/src/`, `tests/security/jwt.test.ts`, evidencia C03. **Gate:** token A no revela recurso B; revocación bloquea jobs. No `user_metadata` como permiso ni fallback owner.

### FIN-C04 — Twins y nomenclatura canónica

Vincular agente del padre con twin y mandato de origen→target limitado por finalidad, recursos, presupuesto y caducidad. **Archivos:** `packages/domain/src/twin-binding.ts`, `tests/security/twin.test.ts`, evidencia C04. **Gate:** mandato revocado o revisión obsoleta bloquean nuevo efecto; no copiar memorias de clientes.

### FIN-C05 — DTOs, esquemas y errores

Definir Money decimal/currency/exponente, IDs opacos, EvidenceRef, estado financiero y errores discriminados. **Archivos:** `packages/contracts/src/`, `tests/contracts.test.ts`, evidencia C05. **Gate:** NaN, float ambiguo, fecha inválida o campos extra se rechazan; identidad JSON no es permiso. **Checkpoint 5.**

### FIN-C06 — Persistencia, RLS y migraciones

Modelar empresas, hechos/versiones, audit, idempotency, inbox/outbox y FKs scoped. **Archivos:** `migrations/`, `packages/storage/src/`, `tests/integration/storage.test.ts`, evidencia C06. **Gate:** escritura cross-tenant falla para roles reales y una caída no deja intent/audit parcial.

### FIN-C07 — Mandatos, finalidad y aprobaciones

Ligar revisión humana a recurso, hash, importe, moneda, destinatario, finalidad, policy, vigencia y revocación cuando corresponda. **Archivos:** `packages/domain/src/approval.ts`, `tests/approval-binding.test.ts`, evidencia C07. **Gate:** cambio de importe o beneficiario invalida approval; ningún borrador se convierte en pago.

### FIN-C08 — Secretos, discovery y aislamiento remoto

Registrar conexión por tenant/empresa, endpoint/secretRef y capacidades verificadas por versión y rol. **Archivos:** `packages/integrations/src/`, `packages/secrets/`, `tests/security/egress.test.ts`, evidencia C08. **Gate:** token/empresa B no actúa en A; sin permisos no hay fallback admin, URL libre ni datos simulados presentados reales.

### FIN-C09 — Modelo económico y períodos

Definir entidad económica, calendario fiscal/analítico, base de devengo, moneda y períodos con fecha/zona explícitas. **Archivos:** `packages/domain/src/company.ts`, `period.ts`, `tests/period-boundaries.test.ts`, evidencia C09. **Gate:** dos ejercicios o zonas no se mezclan por fecha de carga; ledger de gestión no certifica cumplimiento fiscal.

### FIN-C10 — Ingesta CSV y extractos

Procesar archivo sintético con hash, binding de cuenta, filas, formato y fecha, conservando original bajo política y staging unverified. **Archivos:** `packages/imports/src/csv.ts`, `tests/import-idempotency.test.ts`, evidencia C10. **Gate:** replay no duplica; entradas con fórmulas CSV, tamaño excesivo o encoding ambiguo se tratan con seguridad. **Checkpoint 10.**

### FIN-C11 — Mapping de cuentas

Proponer correspondencia fuente→categoría local con versión, responsable y evidencia. **Archivos:** `packages/mapping/src/account-map.ts`, `tests/mapping.test.ts`, evidencia C11. **Gate:** cuenta desconocida permanece bloqueada o pendiente, no clasificada por la confianza del LLM; deducibilidad fiscal no se infiere de texto.

### FIN-C12 — Hechos monetarios

Normalizar decimal, moneda/exponente, signo y fechas de registro/valor sin perder procedencia. **Archivos:** `packages/contracts/src/money.ts`, `packages/ledger/src/fact.ts`, `tests/money-properties.test.ts`, evidencia C12. **Gate:** un abono y una entrada negativa conservan semántica fuente; no usar float o confundir fechas.

### FIN-C13 — Adaptador ERPNext

Si se selecciona, validar release/licencia y `siteBinding`/`companyBinding`, rol y DocTypes allowlist en laboratorio. **Archivos:** `packages/adapters/erpnext/src/`, `tests/integration/erpnext.test.ts`, evidencia C13. **Gate:** company B no se consulta con conexión A; no exponer submit/post/unlink genéricos ni usar admin de fallback.

### FIN-C14 — Ledgers Beancount/hledger

Evaluar parser y proyección de journal bajo alcance y commodity definidos, con aislamiento y revisión de licencia por componente. **Archivos:** `packages/adapters/ledger/`, `tests/ledger-parser.test.ts`, evidencia C14. **Gate:** journal malformado falla; no se inventa un asiento equilibrado ni se ejecutan scripts/red de contenido importado.

### FIN-C15 — Fuentes bancarias read-only

Si se autoriza un proveedor concreto, validar contrato, consentimiento, scope de cuenta, acceso de solo lectura y freshness; sin screen scraping ni credenciales en el modelo. **Archivos:** `packages/adapters/bank-read/`, `tests/integration/bank-read.test.ts`, evidencia C15. **Gate:** fuente no configurada = `unsupported`/pendiente, no saldo simulado presentado real. **Checkpoint 15.**

### FIN-C16 — Idempotencia y revisiones

Conservar `externalIdentity`, contentHash, versión de origen y local; diferenciar replay idéntico de una corrección. **Archivos:** `packages/imports/src/revisions.ts`, `tests/sync-conflicts.test.ts`, evidencia C16. **Gate:** transacción corregida crea revisión o conflicto, no duplicado ni sobrescritura silenciosa de una revisión aceptada.

### FIN-C17 — Conciliación propuesta

Generar candidatos con evidencia, tolerancias, fechas y moneda; separar propuesta y revisión. **Archivos:** `packages/reconcile/src/matching.ts`, `tests/reconciliation.test.ts`, evidencia C17. **Gate:** mismo importe de dos proveedores no confirma un match; no postear conciliación ni borrar movimientos en piloto.

### FIN-C18 — Caja y posición

Proyectar balances con cuenta, fecha, moneda, fuente, cobertura, restricciones y estado; distinguir observado y disponible. **Archivos:** `packages/cash/src/position.ts`, `tests/cash-position.test.ts`, evidencia C18. **Gate:** cuentas de fechas distintas muestran freshness y no se agregan como si fueran simultáneas; FX explícito cuando proceda.

### FIN-C19 — Cuentas por cobrar

Representar factura, vencimiento, cobros, parciales, devolución y disputa con historial. **Archivos:** `packages/receivables/src/`, `tests/receivables.test.ts`, evidencia C19. **Gate:** pago parcial/devolución actualizan una versión sin borrar original; factura emitida no es dinero cobrado.

### FIN-C20 — Cuentas por pagar

Mostrar obligaciones, vencimientos, estado y evidencia sin capacidad de transferencia o cambio de beneficiario. **Archivos:** `packages/payables/src/`, `tests/payables-fraud.test.ts`, evidencia C20. **Gate:** solicitud fraudulenta de cuenta nueva se bloquea y escala; un vencimiento no autoriza pagar. **Checkpoint 20.**

### FIN-C21 — Presupuesto versionado

Crear líneas, drivers, periodos y propietario con versión, diff y aprobación humana. **Archivos:** `packages/budget/src/`, `tests/budget-cas.test.ts`, evidencia C21. **Gate:** ediciones concurrentes producen conflicto CAS; presupuesto aprobado no autoriza cada gasto.

### FIN-C22 — Motor de fórmulas

Diseñar AST/DSL cerrada, dependencias DAG, unidades y contexto Decimal; no `eval`, macros ni scripts del LLM. **Archivos:** `packages/formulas/src/ast.ts`, `evaluate.ts`, `tests/formula-properties.test.ts`, evidencia C22. **Gate:** ciclos, unidades incompatibles, división por cero y overflow se manejan explícitamente antes de entregar cálculo.

### FIN-C23 — Escenarios y supuestos

Registrar supuestos, fuente, fecha efectiva, versión, límites e incertidumbre; distinguir declaración de hecho observado. **Archivos:** `packages/scenarios/src/assumptions.ts`, `tests/scenario-version.test.ts`, evidencia C23. **Gate:** precio o FX inciertos no producen forecast presentado como cierto; un modelo no inventa inputs faltantes.

### FIN-C24 — Forecast de caja

Ejecutar flujos futuros por horizonte y reglas de entrada/salida con fecha de corte y supuestos versionados. **Archivos:** `packages/scenarios/src/cash-forecast.ts`, `tests/forecast.test.ts`, evidencia C24. **Gate:** impago y retraso muestran sensibilidad y ruptura posible; forecast no promete liquidez ni equivale a saldo confirmado.

### FIN-C25 — FX y conversiones

Registrar fuente, fecha, base/quote, política de triangulación, precisión y redondeo. **Archivos:** `packages/fx/src/rates.ts`, `convert.ts`, `tests/fx-rounding.test.ts`, evidencia C25. **Gate:** inversa y triangulación se comprueban con tolerancia declarada; no sumar monedas sin tipo de cambio y cobertura. **Checkpoint 25.**

### FIN-C26 — Variaciones y drivers

Comparar actual y presupuesto del mismo periodo/unidad con definición explícita y evidencia de cada driver. **Archivos:** `packages/reporting/src/variance.ts`, `tests/variance.test.ts`, evidencia C26. **Gate:** falta de driver queda pendiente; una correlación no autoriza relato causal inventado.

### FIN-C27 — Unit economics

Definir cohorte, ingresos brutos/netos, asignación de costes y denominador; mostrar limitaciones. **Archivos:** `packages/analytics/src/unit-economics.ts`, `tests/unit-economics.test.ts`, evidencia C27. **Gate:** ventas brutas no se intercambian por netas; sin costes suficientes no se muestra margen o beneficio ficticio.

### FIN-C28 — Runway y stress test

Relacionar caja elegible, ventana de burn y escenarios explícitos, con restricciones de liquidez. **Archivos:** `packages/scenarios/src/runway.ts`, `stress.ts`, `tests/runway.test.ts`, evidencia C28. **Gate:** burn cero o positivo tiene comportamiento definido sin división errónea; runway no se presenta como fecha garantizada.

### FIN-C29 — Cierre analítico

Crear checklist, cutoff, fuentes, pendientes, revisor y freezeHash del snapshot de gestión. **Archivos:** `packages/close/src/checklist.ts`, `tests/close-reopen.test.ts`, evidencia C29. **Gate:** dato tardío genera reapertura o revisión, no altera silenciosamente el informe; cierre analítico no certifica cuentas o impuestos.

### FIN-C30 — Workbook y export

Generar workbook editable con grafo de fórmulas, valores cacheados, locale y trazabilidad; controlar inyección y acceso de export. **Archivos:** `packages/export/src/workbook.ts`, `tests/workbook-recalculation.test.ts`, evidencia C30. **Gate:** cambiar input recalcula bajo motor y entorno declarados; no basta un Excel visualmente correcto o números hardcodeados. **Checkpoint 30.**

### FIN-C31 — Propuestas de pago

Solo preparar borradores de beneficiario, importe, propósito, scope y caducidad; no ejecutar transferencia/billing en el piloto. **Archivos:** `packages/payments/src/proposal.ts`, `tests/payment-boundary.test.ts`, evidencia C31. **Gate:** cambio de IBAN o importe invalida approval; no existe ruta de pago ni modificación de cuenta habilitada por esta fase.

### FIN-C32 — Reporting Metabase o local

Evaluar dashboard local o integración Metabase bajo bindings, query templates y ACL por tenant; no SQL libre del LLM. **Archivos:** `packages/reporting/src/dashboard.ts`, `packages/adapters/metabase/` si se selecciona, `tests/reporting-isolation.test.ts`, evidencia C32. **Gate:** manipular filtros/URL no expone empresa B; colección con nombre distinto no demuestra aislamiento ni licencia de funciones Enterprise.

### FIN-C33 — Reportes, dashboard e infografías

Crear snapshots con métricas, fuente, definición, periodo, moneda, cobertura y revisión. **Archivos:** `packages/reporting/src/snapshot.ts`, `tests/report-scope.test.ts`, evidencia C33. **Gate:** dato tardío genera revisión, no modifica informe aceptado; el modelo no rellena saldos o fechas ausentes.

### FIN-C34 — Portal responsive, chat y Anam

Ofrecer al owner/revisor vistas scoped para explicar fuente, cálculo, diferencias y bloqueos; avatar no es identidad ni firma. **Archivos:** `apps/portal/`, `packages/presence/anam/`, evidencia C34. **Gate:** cambio de tenant cierra contexto/URLs/suscripciones anteriores; texto alternativo y grabación off cuando no haya política habilitada.

### FIN-C35 — SDK TypeScript, Hono y tools

Definir cliente y herramientas nominadas para lectura/propuesta con PEP único y allowlist exacta de rutas/métodos. **Archivos:** `packages/sdk/src/`, `apps/api/src/routes/`, `tests/sdk-contract.test.ts`, evidencia C35. **Gate:** SQL/HTTP/execute genérico se rechaza; tools de lectura o propuesta no conceden pago, admin o export_all. **Checkpoint 35.**

### FIN-C36 — Bridge de agente y eventos

Mapear hechos confirmados a eventos nativos compatibles, preservando provenance y `SystemEvent` `"1.0"`. **Archivos:** `packages/host-bridge/`, `docs/host-patch-proposal.md`, evidencia C36. **Gate:** evento financiero nuevo no se envía como enum inventado; fake no acredita host real y `agente` no se modifica.

### FIN-C37 — Cooperación y handoff empresarial

Definir permisos y estados offered/ACK/working/completed/returned con marketing, gestoría y hermanos. **Archivos:** `packages/handoffs/`, `docs/sibling-contracts.md`, evidencia C37. **Gate:** hermano ausente produce bloqueo o pendiente, no saldo/dictamen fabricado; emitir evento no prueba recepción o ejecución.

### FIN-C38 — Modelos, coste y observabilidad

Medir tokens, procesamiento, storage, sesiones y revisión con reservas y trazas sanitizadas por tenant. **Archivos:** `packages/usage/`, `packages/observability/`, `docs/cost-workloads.md`, evidencia C38. **Gate:** coste o retención no aprobados bloquean fallback; los planes ilustrativos no autorizan gasto ni garantizan volumen.

### FIN-C39 — Privacidad y pruebas adversariales

Probar BOLA, inyección indirecta en extractos y facturas, CSV/HTML/XML, SSRF, claves y consultas cross-tenant en todas las superficies. **Archivos:** `tests/security/`, `docs/threat-model.md`, evidencia C39. **Gate:** archivo B o prompt hostil no llega al contexto A ni cambia beneficiario; fuga, secreto o bypass detienen rollout.

### FIN-C40 — Vertical E2E y fallos distribuidos

Ejecutar fixtures A/B/P desde importación a reporte con revisión, datos faltantes, revocación y fallos distribuidos. **Archivos:** `tests/e2e/`, `tests/evals/`, `docs/e2e-evidence.md`, evidencia C40. **Gate:** timeout tras aceptación no duplica por takeover; resultado correcto con acción intermedia prohibida falla. **Checkpoint 40.**

### FIN-C41 — Operaciones, CI, backup y release

Fijar versiones, CI con skips visibles, runbooks de errores, retención, reconciliación, restore e incidentes. **Archivos:** `.github/workflows/ci.yml`, `docs/operations/`, `infra/` si está autorizado y resulta necesario; evidencia C41. **Gate:** restore reaplica restricciones y no reenvía operaciones; no desplegar producción por completar la fase.

### FIN-C42 — Aceptación, evidencia y handoff final

Consolidar fase/capacidad, SHA, entorno, pruebas reales, costes, límites profesionales y pendientes; entregar demo sintética reproducible. **Archivos:** `docs/release/final-report.md`, `acceptance.md`, `handoff-next.md`, evidencia C42. **Gate:** fallo crítico bloquea aceptación; no afirmar pagos, cierre fiscal oficial, proveedor real o paridad mundial. **Checkpoint 42.**

## 8. Vertical sintética paso a paso

Este ejemplo es **un diseño futuro, no una operación ejecutada**:

1. Crear empresas ficticias A/B y operador P, con cuentas y facturas sintéticas, mandatos distintos y roles owner/revisor/colaborador. Ningún extracto o IBAN real.
2. Aporta dos extractos ficticios y una factura: cada archivo se guarda con hash, binding, fecha, versión y estado `unverified`. Una fuente B no puede importarse bajo A por elegir un ID en el CSV.
3. El preview indica filas válidas, errores, signos y cuentas desconocidas. Importar de nuevo el mismo archivo no crea movimientos duplicados; un cambio de origen crea revisión/conflicto.
4. El agente propone mapping de categorías; un revisor humano verifica la clasificación. Una categoría desconocida no se rellena con inferencia ni se decide deducibilidad fiscal.
5. El motor propone conciliaciones mostrando referencias y diferencias. Dos facturas por importe idéntico permanecen ambiguas hasta revisión; no se postea ningún asiento al ERP.
6. La posición de caja muestra saldos por cuenta, moneda, as-of y cobertura. Una cuenta USD y otra EUR no se suman sin un FX con fuente, fecha y redondeo explícitos; dato no disponible no se sustituye por cero.
7. El responsable crea un presupuesto versionado y compara actual − presupuesto para periodo y unidad compatibles. Una posible causa se etiqueta hipótesis salvo evidencia.
8. Se calcula un escenario base y otro de retraso de cobro con supuestos y horizonte registrados. El resultado no es una garantía de liquidez ni una recomendación de inversión.
9. Un humano revisa el snapshot y genera un reporte que rastrea cada cifra a su fuente, mapping y versión; un dato tardío crea revisión nueva.
10. Si existe un borrador de pago, está marcado como propuesta sin ejecución. Cambiar su beneficiario o importe invalida aprobación; no hay transferencia, cambio de cuenta o presentación fiscal.
11. Probar revocación, acceso A→B, reimportación, datos stale y timeout de un efecto de laboratorio autorizado. Si el proveedor pudo aceptar, reconciliar o bloquear, sin retry ciego ni proveedor alternativo.

## 9. Evidencia y pruebas futuras

No se han ejecutado estas pruebas durante la auditoría.

| Frontera | Evidencia futura | No basta |
|---|---|---|
| Dinero | Tests de propiedades para signos, exponentes, límites, precisión, redondeo y moneda. | Una cifra coincidente en un ejemplo de demostración. |
| Tiempo y cobertura | Cutoff, zona, fuente, fechas contable/valor y freshness por cuenta. | Fecha de carga o un total que oculta fuentes ausentes. |
| Importación | Replay, corrección, colisión de IDs, CSV adversarial y audit del original. | Sumar filas y asumir unicidad. |
| Conciliación | Candidatos con evidencias y casos ambiguos revisados. | Mismo importe o texto similar. |
| Forecast | Versión de inputs, supuestos, horizonte, escenarios y sensibilidad. | Una línea de tendencia presentada como saldo real. |
| Workbook | Cambiar inputs y verificar fórmulas/grafo/recalculo en entorno definido. | Un valor cacheado o una captura correcta. |
| Pagos | Capacidad de transferencia deshabilitada y tests negativos por cuenta/importe. | Que el botón no aparezca o que el LLM diga que no pagará. |
| ERP/banco | Empresa/rol/versión, operación read-only y licencia probados en entorno autorizado. | README o mock. |
| Aislamiento | API, DB/roles, workers, archivos, búsqueda, caché, Realtime, dashboard y exports. | Una colección de dashboard distinta o un filtro de UI. |
| Recuperación | Intent/receipt/reconciliación y restore sin reenviar ni perder restricciones. | Un retry nuevo o promesa de exactly-once. |

Además de los escenarios A–I del repo, medir precisión de cálculo, cobertura, discrepancias y latencia bajo workload declarado; si no hay información suficiente, el resultado correcto puede ser abstenerse. Un texto final correcto con un acceso o efecto prohibido durante la trayectoria falla. Un profesional competente debe revisar los usos contables, fiscales o financieros aplicables antes de cualquier operación real.

## 10. Riesgos de planificación y mejoras del repo

1. **Fases genéricas:** muchas tareas comparten plantilla; pedir evidencia específica por fecha, divisa, fuente, resultado observado y rol, no copiar el mismo reporte 42 veces.
2. **Alternativas encadenadas:** ERP, ledgers, banca y Metabase no deben instalarse todos. Mantener la secuencia formal y decidir explícitamente qué queda deshabilitado/no verificado sin falsear PASS.
3. **FX aparece después del forecast:** C24 puede construir forecast con una única divisa sintética y sin conversión implícita; no producir un forecast multimoneda hasta completar C25 y validar fuente/redondeo.
4. **Idempotencia aparece después de ingesta:** C10 debe tener controles suficientes para no duplicar en su laboratorio; C16 completa las revisiones/sync. No presentar la integración completa como fiable antes de ensayar concurrencia y recuperación.
5. **Dashboard puede ocultar fallos:** cada cifra necesita definición, periodo, fuente, moneda y cobertura; un resultado `missing`/`stale` no se transforma en cero o cifra actual.
6. **Modelo de permisos no es controles contables:** autenticación no acredita representación, competencia profesional, beneficiario ni segregación de funciones. El piloto no habilita pagos o posteos.
7. **Versiones y licencias:** ERPNext/hledger/Beancount/Actual/Metabase son referencias observadas, no releases aprobadas. Revisar licencia por componente, edición, distribución y permisos antes de incorporar código.
8. **Backtesting y calidad de forecast:** guardar información disponible al momento de cada corte y comparar con resultados posteriores cuando existan; un buen ajuste retrospectivo no garantiza precisión futura ni asesoramiento apto.

## 11. Decisiones del propietario antes de implementar

- Definir el primer usuario financiero, un revisor competente y qué decisiones siguen siendo exclusivamente humanas.
- Escoger un caso sintético de caja o presupuesto y su moneda, periodo, convención de signos y fuente inicial.
- Determinar custodio de cada dato y cómo se resuelven conflictos entre extracto, ERP, gestoría y proyección local.
- Escoger si se prueba una integración read-only y bajo qué cuenta/entorno autorizado; mantener todas las escrituras sensibles deshabilitadas.
- Acordar criterios de calidad de datos, tratamiento de missing/stale, fechas y reglas de revisión.
- Fijar límites de coste y retención de modelos; no enviar extractos ni datos bancarios a proveedores no aprobados.
- Solicitar autorización independiente para datos reales, banca, pagos, contabilización, presentación fiscal, despliegue o modificación del padre.

## 12. Límites que nunca deben maquillarse

- No usar `float` para compromisos monetarios ni mezclar divisas, fechas o unidades sin declarar conversión.
- No presentar forecast como saldo, devengo como caja, factura como cobro, presupuesto como permiso de pago o cierre analítico como cierre fiscal oficial.
- No usar un LLM para decidir beneficiario, cuenta, impuesto, deducibilidad o autorización por una descripción plausible.
- No ejecutar pagos, transferencias, cambios de cuenta, asientos de conciliación, asesoramiento de inversión personalizado o presentación fiscal en piloto.
- No importar credenciales bancarias, datos reales, extractos o PII a logs, Git o prompts; no usar screen scraping de una cuenta personal.
- No tratar un mock como ERP o banco probado; no cambiar de key/proveedor tras timeout para ocultar incertidumbre.
- No permitir SQL/HTTP/shell genérico, admin fallback ni compartir datos por pertenecer a la misma familia de servicios.
- No afirmar ROI, ahorro, SLA, cumplimiento universal o precisión financiera sin medición y revisión aplicable.

## 13. Especificación financiera ampliada para la futura implementación

### 13.1. Identidad de movimiento y deduplicación

Una transacción necesita identidad contextual: tenant, conexión, cuenta remota, fuente, identificador externo cuando exista, fechas, moneda, importe y versión. El hash de un archivo completo sirve para detectar replay de ese archivo, pero no resuelve por sí solo duplicados de filas importadas en extractos solapados. Tampoco se debe usar únicamente importe/fecha como clave: dos pagos legítimos pueden coincidir. Cuando el proveedor no ofrece identificador estable, registrar el método de matching y la incertidumbre; si no se puede distinguir una corrección de un nuevo movimiento, generar conflicto revisable.

Los cursores y watermarks avanzan después de que el lote y sus enlaces queden confirmados localmente. Una descarga parcial, página repetida, movimiento tardío o cambio de cuenta remota debe dejar evidencia y permitir reintentos de lectura acotados. El sistema conserva la versión anterior de un hecho revisado y genera una nueva revisión cuando cambia el origen. Ningún algoritmo debe borrar o inventar una transacción para cuadrar un saldo.

### 13.2. Política de importación y fuentes

Una importación comienza en staging con hash de archivo, procedencia, autorización de acceso, cuenta y empresa resueltas por el servidor, fechas, formato y parser/version. El CSV puede contener números con separadores de miles y decimales distintos, moneda no declarada, fechas ambiguas, columnas ausentes o fórmulas activas. Las ambigüedades bloquean esa fila o requieren una configuración revisada; no se convierten en cero ni se dejan al modelo para adivinar. El original y su contenido sensible tienen retención separada del audit mínimo.

El preview debe mostrar conteos, cobertura, duplicados potenciales y errores sin volcar extractos completos en logs. Aceptar el staging no es confirmar una conciliación ni autorizar un asiento contable. Las conexiones bancarias read-only, cuando se evalúen, necesitan contrato, alcance, cuenta y expiración de autorización; una credencial válida para varias cuentas no autoriza consultar todas. La ausencia de una fuente bancaria deja el saldo como no disponible, no reemplazado por una cifra ficticia.

### 13.3. Conciliación revisable y casos complejos

Una propuesta debe conservar las referencias de ambos lados y las reglas que produjeron el candidato. Casos a diseñar incluyen uno a uno, varios movimientos para una factura, un movimiento que liquida varias facturas, pagos parciales, comisiones, devoluciones, abonos, diferencias de cambio y fechas de liquidación. Para cada caso declarar tolerancias, reglas de redondeo, moneda y evidencia adicional. Dos candidatos con mismo importe o proveedor ambiguo no producen match definitivo por puntuación alta; quedan en cola de revisión.

La acción humana debe poder aceptar o rechazar una propuesta dentro del ámbito que tiene autorizado, con motivo y versión de evidencia. En el piloto el resultado es una proyección o propuesta de gestión; no postea asientos ni cambia el ERP. Si una fuente cambia después de la revisión, registrar conflicto o nueva versión y preservar el estado previo. Un snapshot de caja no debe asumir que una propuesta equivale a conciliación bancaria confirmada.

### 13.4. Cálculo, forecast y métricas

El motor debería representar una expresión mediante nodos tipados y operadores permitidos, no texto ejecutable. Antes de evaluar, validar aciclicidad, unidades, monedas, división por cero, límites de complejidad, precisión y política de rounding. Registrar versión de fórmula y referencias a inputs; un cambio en un supuesto produce una nueva ejecución, no altera un informe congelado. Los tests de propiedades deben comprobar, entre otras cosas, que el replay con inputs y versión iguales conserva el resultado bajo el contexto Decimal declarado.

Un `ForecastRun` identifica fecha de corte, horizonte, periodicidad, saldos iniciales, cuentas cubiertas, reglas de cobro/pago, supuestos, FX y advertencias. Para backtesting es importante congelar los inputs que estaban disponibles en la fecha de corte; introducir datos conocidos después produciría una evaluación engañosa. Comparar escenarios de cobro tardío, gastos adicionales o pérdida de ingreso sin convertirlos en una garantía de rango estadístico si no existe un modelo que lo justifique.

Para runway, documentar si el burn es neto o bruto, el periodo histórico, caja elegible y fecha. Un burn cero, caja insuficiente o entradas inciertas requieren resultados y mensajes explícitos; no devolver un infinito numérico sin explicar qué significa. Unit economics exige definir ingresos netos o brutos, costes incluidos, moneda, periodo, cohorte y denominador; con costes ausentes se muestra cobertura limitada y no un margen inventado.

### 13.5. Exports y revisión humana

El workbook debe conservar fórmulas, referencias, unidades, moneda y origen de cada input cuando el formato y los permisos lo permitan. Los datos no confiables exportados a CSV u hojas se neutralizan frente a interpretación como fórmula; el sistema no habilita macros o enlaces externos por defecto. El preflight debería comprobar que el grafo de fórmulas corresponde a la versión aprobada, que las celdas calculadas no se sustituyen por constantes y que el recálculo se ha probado con un motor concreto. Una revisión posterior de fuente no modifica silenciosamente un archivo ya entregado; crea otra versión.

El revisor necesita ver fuente, warnings, criterios de mapping, diferencias y datos faltantes antes de aceptar. Un botón de aprobación sin información suficiente es un control débil. Para funciones profesionales o reguladas se requiere la autoridad y revisión competente en el contexto real; una sesión con avatar o una explicación fluida no son representación ni dictamen.

## 14. Integración con marketing y otros servicios

Marketing puede proponer presupuesto o reportar atribución; finanzas no debe convertir automáticamente el presupuesto propuesto en obligación o pago. Una cifra de ingresos atribuida por una plataforma no es por sí sola una venta única de negocio; la fuente autorizada de ventas y sus devoluciones deben poder reconciliarse con el dato analítico. No sumar conversiones de varios canales ni llamar causal a una atribución por incorporarla a un dashboard financiero.

Cada handoff debe fijar empresa/tenant, finalidad, fuente, fecha, moneda, campos mínimos, evidencia, estado de aprobación y destinatario; un evento recibido no sustituye un ACK o una revisión. Branding puede solicitar información para un presupuesto de diseño sin recibir extractos o cuentas bancarias completas. Gestoría o ERP mantienen la autoridad acordada sobre contabilidad y fiscalidad; el servicio no crea una obligación o dictamen por la ausencia de un hermano.

Si el cliente pide mover dinero, el piloto debe detenerse en una propuesta sin ejecución y explicar la frontera. Una futura vía de pago requerirá otro proyecto de autorización y diseño de seguridad, verificación independiente del beneficiario, segregación de funciones, mandatos, límites y evidencia, además de comprobación de proveedor y regulación aplicable. El presente documento no autoriza ni implementa esa ampliación.

## 15. Escenarios de prueba y revisión por riesgo

| Riesgo | Fixture o simulación futura | Evidencia esperada |
|---|---|---|
| Mismo importe legítimo | Dos facturas iguales y un único cobro de proveedor incierto. | Ambos candidatos y motivo; sin match automático ficticio. |
| Replay y corrección | Archivo importado dos veces y después fila corregida en fuente. | Un movimiento lógico y revisión/conflicto trazable, sin borrar anterior. |
| Caja multimoneda | Saldos EUR/USD en fechas diferentes y FX ausente. | Cobertura y fechas visibles; total convertido bloqueado o pendiente. |
| Fechas ambiguas | Movimiento con `bookedAt` en un periodo y `valueAt` en otro. | Ambas fechas preservadas y criterio del reporte explícito. |
| Redondeo | Conversión inversa y múltiples divisiones con escala declarada. | Diferencias dentro de tolerancia documentada o error explícito; sin float. |
| Fórmula hostil | AST cíclico, unidad incompatible y solicitud de shell. | Rechazo antes de evaluación o IO, sin ejecución de código libre. |
| Cambio de beneficiario | Propuesta aprobada cuyo IBAN o importe cambia. | Approval previa inválida; ningún pago disponible en el piloto. |
| Empresa equivocada | Credencial remota con dos companies, binding de A pide B. | Denegación antes de consulta y sin metadatos de B. |
| Dashboard manipulado | Filtro, URL o embedding intentan quitar tenant scope. | Query y resultado siguen scoped o se rechazan, con roles reales. |
| Timeout y restore | Proveedor sandbox acepta una escritura autorizada y cae ACK; backup anterior a revocación. | `outcome_unknown` y reconciliación/bloqueo; restore no reenvía ni revive permisos. |

Todas estas pruebas están pendientes. Para una fase futura, la evidencia debe registrar comando o procedimiento, versión, entorno, actor/scope, fixture inicial/final, resultado esperado/observado y responsables, sin mostrar extractos, cuentas o datos personales. Una prueba negativa pasada en un fake no acredita controles de la cuenta bancaria o ERP real.

## 16. Ejemplo de organización de agentes por fase

En C12 un agente de dominio propone contratos de moneda y fechas; otro especializado en verificación prepara propiedades de precisión, signs y edge cases; el implementador trabaja en archivos autorizados; un revisor financiero competente valida que la convención tenga sentido por fuente. Ninguno selecciona la moneda o el signo a partir de una frase de un usuario sin contrastarlo con el binding y metadatos de origen.

En C17 el agente puede sugerir matches y explicar sus señales, pero la policy controla el acceso y la persistencia de propuestas. Un revisor examina evidencias y conflictos. El coordinador no habilita posteo al ERP por haber conciliado los fixtures. En C24–C25, hasta completar y probar FX, los escenarios multidivisa permanecen bloqueados: una demo monodivisa no se vende como cobertura de todas las monedas.

La salida de cada agente se revisa frente al gate anterior y al estado protegido. Si las pruebas muestran que un proveedor acepta una llamada distinta de la esperada, se bloquea la capacidad y se documenta la discrepancia; no se corrige ampliando el rol remoto o introduciendo un fallback de administrador. La aceptación final pertenece al owner y a los responsables competentes, no al agente que implementó.

## 17. Decisión final

La primera demostración de valor debe ser una cadena reconstruible desde documento sintético → hecho monetario → mapping → propuesta revisable → caja/escenario → reporte, con fechas, monedas y cobertura visibles y cero ejecución de pagos. Las 42 fases siguen siendo un plan documental hasta que se implementen y pasen sus gates reales. Esta auditoría no modificó finanzas ni `agente`.
