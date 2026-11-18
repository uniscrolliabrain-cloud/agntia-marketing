# Auditoría integral de Agntia Seguros y plan de sus 42 campañas

**Repositorio:** [uniscrolliabrain-cloud/agntia-seguros](https://github.com/uniscrolliabrain-cloud/agntia-seguros/tree/37ee1a94751ea35ebeb539a475316f1ccbe23b36)  
**Referencia:** `37ee1a94751ea35ebeb539a475316f1ccbe23b36` · **Fecha:** 13-11-2026  
**Naturaleza:** auditoría documental y diseño de una implementación futura. No es asesoramiento de seguros, dictamen actuarial, evaluación de solvencia ni habilitación para distribuir, mediar o decidir siniestros.

## 1. Resumen ejecutivo

Agntia Seguros propone un SaaS especialista de operaciones y asistencia profesional: declaración de riesgos, cartera de pólizas y endosos, necesidades y huecos de cobertura, preparación y comparación de ofertas, intake de siniestro con evidencias, seguimiento de plazos, renovaciones y reclamaciones. Se integra con `agente` mediante un twin acotado, con portal propio para clientes externos.

El árbol y el [README](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/README.md) declaran **DOCUMENTATION_ONLY**: no hay aplicación, SDK, conectores ni pruebas de producto ejecutadas. El [índice](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/campaigns/README.md) fija 42 campañas `NOT_STARTED`, 294 tareas y 84 escenarios `NOT_EXECUTED`. Son planificación, no evidencia. No existe todavía boilerplate ejecutable que auditar como producto.

La decisión de diseño más importante, y la que esta auditoría considera correcta, es que **la póliza original, sus endosos y la aseguradora u operador autorizado conservan la autoridad sobre cobertura y decisión**. El servicio organiza hechos declarados, custodia documentos, calcula proyecciones ilustrativas y prepara revisiones. El riesgo dominante es el contrario: que una proyección bien presentada, un precio bajo o una regla compuesta mal construida se lean como cobertura cierta, adecuación del producto o decisión de la aseguradora.

**Recomendación P0:** una vertical sintética sin efectos — empresa y póliza ficticias → perfil y alcance profesional → extracción revisada → necesidades y limitaciones → `ClaimNotice` con evidencias → preparación → revisión humana → handoff en sandbox con ACK — y referenciar la decisión externa sin generarla. En el piloto no se contrata, cancela ni tarifica; no se cobran primas; no se acepta, deniega ni paga un siniestro; no se asume distribución regulada por ser middleware. Bloquearlo técnicamente, no solo con un aviso.

| Área | Acierto del diseño | Brecha a cerrar antes del piloto |
|---|---|---|
| Autoridad de cobertura | Póliza/endoso y aseguradora deciden; el servicio proyecta. | No hay prueba de que una proyección no se pueda emitir ni presentar como cobertura confirmada. |
| Proyección de cobertura | Separa condiciones particulares, generales y endosos con fechas. | Falta precedencia explícita, tratamiento de endosos posteriores y de cláusulas en conflicto. |
| Reglas | Reglas atómicas con composición versionada; no infiere exclusiones ni franquicias. | Sin motor ni fixtures de precedencia; una regla compuesta errónea puede causar perjuicio. |
| Estimaciones | `Decimal`, divisa y parámetros revisados, marcadas ilustrativas. | Límites, sublímites, franquicias y copagos faltantes deben bloquear cifra firme, no estimarla. |
| Comparación de ofertas | Criterios, huecos, exclusiones y supuestos visibles. | El precio no puede ordenar adecuación; ofertas caducadas no son vigentes. |
| Siniestros | EvidenceRef, cadena decisional y handoff con ACK. | La decisión adversa solo puede registrarse desde prueba del operador competente. |
| Licencia y rol | No se atribuye licencia del operador ni del backend. | Distribución, mediación y peritaje requieren evaluación jurídica por territorio. |
| Adaptadores | Declara candidatos y licencias pendientes. | openIMIS AGPL y de financiación sanitaria, OasisLMF de catástrofes y CDM financiero no son un core multirramo. |
| Operación | Outbox, reconciliación, restore y feature flags. | Nada ejecutado: sin medición de coste, latencia, recuperación ni SLA. |

## 2. Alcance, fuentes y grado de certeza

Se examinó el árbol recursivo remoto, completo y no truncado, en el SHA indicado, junto con [producto](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/01-producto.md), [referentes y brechas](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/03-referentes-y-brechas.md), [adaptadores y licencias](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/04-adaptadores.md), [seguridad y privacidad](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/05-seguridad-privacidad.md), [evaluación](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/09-evaluacion.md), índice de campañas, [handoff](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/release/HANDOFF.md) y la ficha completa de [comparación explicable C18](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/campaigns/18-comparacion-explicable.md).

**Las otras 41 fichas y el [manifest](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/37ee1a94751ea35ebeb539a475316f1ccbe23b36/docs/campaigns/campaign.json) no se han leído íntegramente.** Las fichas de §7 derivan del índice, de los nombres de fase, de los contratos y escenarios citados en el handoff y en evaluación, y de la estructura observada en C18; antes de implementar cada fase hay que leer su documento y sus entradas del manifest, que pueden añadir tareas, dependencias y aceptaciones no recogidas aquí.

El handoff declara como padre observado `54b8d5407a8576459448c4d059a877297d18ca7a`; es una referencia del propio repositorio, no una auditoría nueva del padre. Tampoco se han verificado las licencias reales de los cuatro candidatos, la normativa de distribución vigente por territorio, ni cifras de mercado, primas o siniestralidad. Cualquier afirmación regulatoria o actuarial necesita revisión competente con jurisdicción y fecha explícitas.

No se ha instalado software, clonado backends, usado datos reales ni de demo ajenos, ejecutado pruebas de producto, contratado, gastado o desplegado. No se ha modificado `agente` ni el repositorio remoto de seguros. Este informe vive en el espacio de trabajo de la conversación.

## 3. Hallazgos prioritarios

### P0.1 — Cobertura aparente: proyectar no es confirmar

Un `PolicyProjection` resume qué parece cubierto según documentos y fechas. No es cobertura confirmada, ni opinión de la aseguradora, ni garantía de indemnización. Debe incluir para cada conclusión: cláusula y documento de origen, versión y fecha del documento, condición (particular, general, endoso), vigencia aplicable, hecho supuesto, estado (`supported`, `unknown`, `contradicted`, `stale`) y revisor. La proyección debe declarar explícitamente lo no cubierto por falta de documento.

Riesgo concreto: un endoso posterior puede reducir un límite o introducir una exclusión, y una proyección construida sobre la póliza base seguiría mostrando cobertura. Todo endoso con fecha posterior al documento base obliga a reconstruir la proyección, versionarla y no reutilizar aprobaciones ni cifras. Lo mismo con renovaciones: la póliza nueva no hereda límites, franquicias ni exclusiones de la anterior salvo que el documento lo diga. El estado anterior se conserva como histórico, no se sobrescribe.

La proyección no se puede exportar ni enviar con lenguaje de confirmación mientras no exista revisión competente. Si falta una condición particular, la conclusión es `blocked`, no una inferencia por similitud con otra póliza del mismo ramo.

### P0.2 — Reglas: precedencia y composición versionadas

`RuleEvaluation` debe guardar reglas atómicas identificables, su fuente y su composición versionada. Está prohibido inferir exclusiones, franquicias, sublímites o precedencias que el documento no establezca. Cuando dos cláusulas se contradicen — condición general frente a particular, póliza frente a endoso, suplemento frente a anexo — el resultado es conflicto para revisión, no la elección silenciosa de la más favorable ni de la más restrictiva.

Cada evaluación registra entradas exactas, versión de regla, versión de documento, resultado intermedio y explicación reproducible en pasos. Una variante factual debe cambiar reglas y módulos de forma coherente; si cambia solo el texto explicativo, la lógica no está realmente gobernando el resultado. No se permite `eval`, SQL, shell ni HTTP genérico para expresar reglas: DSL o funciones en allowlist, en sandbox sin secretos.

Un acierto local no prueba decisión final. Un test que valide la explicación sin validar el estado protegido no sirve.

### P0.3 — Estimaciones, franquicias y reservas no son cifras firmes

`Estimate` y `ReserveEstimate` usan `Decimal`, divisa y exponente explícitos, con parámetros revisados; se marcan como ilustrativas y conservan sus supuestos. Si falta el límite, el sublímite, la franquicia, el copago, la base de cálculo, la moneda o la fecha de valoración, la cifra no se emite: queda `blocked` con el dato faltante identificado. Nunca se rellena con un valor medio del ramo, con el límite máximo ni con la estimación de otro expediente.

Separar importe reclamado, importe estimado, franquicia aplicada, límite disponible y cantidad potencialmente indemnizable. Cada uno tiene fuente distinta y no se derivan unos de otros sin regla documentada. Un daño declarado no es daño peritado; una reserva contable no es obligación de pago; una estimación favorable no anticipa la decisión de la aseguradora. Cifras agregadas de cartera no se presentan como ratios de indemnización ni como predicción de riesgo sin fuente y validación.

Tampoco se infiere dato de salud, discapacidad, profesión de riesgo o vulnerabilidad para decidir o priorizar. Si el ramo lo requiere, el tratamiento debe ser explícito, autorizado y revisado; el modelo no lo deduce de texto libre.

### P0.4 — Comparación de ofertas: precio no decide adecuación

`CoverageComparison` debe comparar por criterios declarados y versionados: garantías incluidas, exclusiones, límites y sublímites, franquicias, carencias, obligaciones del asegurado, territorialidad, vigencia y supuestos. Los productos no equivalentes muestran diferencias y huecos visibles; no se ordenan por precio como si fueran comparables. Un `coverageGap` debe referenciar la necesidad que queda descubierta y el documento que lo evidencia.

Una `QuoteSnapshot` conserva emisor, versión, fecha de emisión, caducidad y condiciones. Una oferta caducada no puede seleccionarse como vigente; si la fecha es dudosa, queda `unknown`. La importación de ofertas conserva campos pendientes y procedencia, y la aceptación local no fabrica aceptación de la aseguradora, consentimiento ni emisión de póliza.

Riesgo de dominio crítico: comunicar el análisis como cobertura o indemnización garantizada, o usar un dato sensible no autorizado para decidir. Cualquiera de los dos detiene el gate.

### P0.5 — Rol profesional, representación y distribución

`ServiceRoleAssessment` evalúa qué puede hacer el servicio en un territorio y ramo: informar, asistir en la preparación, intermediar o distribuir son actividades distintas con requisitos distintos. El middleware no hereda la licencia del operador ni del backend, y una instalación de openIMIS no convierte el servicio en correduría multirramo. `CustomerAuthority` registra quién representa al tomador o asegurado, con qué alcance y hasta cuándo.

Autenticación no prueba representación. Un nombre de avatar, un sí hablado o un campo `approved=true` no crean competencia profesional. `ProfessionalDecision` y cualquier decisión adversa se registran solo con prueba del operador competente: identidad, función, referencia del acto y documento emitido por quien decide. Una mayoría de modelos no sustituye esa prueba.

Un solicitante sin representación no ve documentos privados, ni siquiera parciales, agregados o resultados inferibles por búsqueda. La persona titular autoriza la compartición por finalidad concreta; cambiar la finalidad exige nueva autorización.

### P0.6 — Siniestros: evidencia, plazos y decisión externa

`ClaimNotice` conserva hecho declarado, fecha declarada, incertidumbre sobre esa fecha, póliza y endosos aplicables, y evidencias con anclaje y versiones. Una fecha dudosa no activa un plazo confirmado: los plazos son propuestas con evento probado, regla versionada, territorio y calendario, y su cambio fuerza nueva revisión.

`ClaimEvidence` se trata como dato no fiable: un documento puede contener instrucciones hostiles, macros o contenido activo. Nunca dicta denegación, exportación ni pago. La cadena decisional debe detectar inconsistencias propagadas: si cambia la póliza, la fecha o la evidencia, las conclusiones dependientes quedan obsoletas y se marcan.

`BrokerHandoff` exige ACK para contar como recibido; sin ACK queda pendiente y no se duplica el notice. La decisión de la aseguradora se referencia con su origen y prueba; sin ellas se guarda `not_verified`, no como autoridad local. Las reclamaciones y recursos escalan el riesgo jurídico y conservan evidencia; el servicio no redacta una posición vinculante ni presenta por el cliente.

### P0.7 — Autorización, aislamiento y datos sectoriales

JWT de Supabase con firma, issuer, audience y tiempos; membership resuelta en servidor; ACL por tenant, póliza, siniestro, documento y campo. Deny-by-default, sin fallback a owner ni a un ámbito por defecto cuando falla una dependencia. Mandato que separa tenant de origen del operador y tenant objetivo, con recursos, capacidad, finalidad, vigencia y revocación. Probar la misma regla en API, jobs, RLS, Storage y URL firmadas, Realtime, búsqueda/vector, caché, informes, dashboards y exports. `service_role` o una credencial global no sustituyen política.

Datos de seguros incluyen categorías sensibles: salud, siniestros, situación patrimonial, bisagras familiares y datos de terceros. Minimizar por finalidad, separar payload personal de referencias auditables con retención propia, y elegir modelo, región, retención y subencargados por política, no por precio. El contexto del modelo se limita al encargo y el retrieval se autoriza antes y después de la búsqueda. Los backups se cifran con control separado y su restore reaplica restricciones sin resucitar accesos ni reenviar historia.

### P1 — Adaptadores, coste y operación

- **openIMIS** declara AGPLv3 en su LICENSE, con módulos y dependencias a revisar; su ámbito es financiación sanitaria, no multirramo español. Servir AGPL en red tiene obligaciones que hay que evaluar antes de integrar, no después.
- **OasisLMF** es BSD-3-Clause para el código, pero el modelado de catástrofes depende de exposure y modelos con licencia propia. Sin exposición apta o licencia de modelo, el job se bloquea; no se sustituye por una estimación genérica.
- **FINOS CDM** tiene licencia Community Specification y ámbito financiero: sirve como referencia de contratos, no como motor de seguros.
- Los SHAs del repositorio son de ramas observadas, no digests ni releases aprobados. La licencia del código no cubre pesos, plantillas, corpus, datos actuariales ni plugins.
- Las bolsas 30/70/300 € son hipótesis de presupuesto interno, no precios verificados ni autorización de gasto. Medir modelos, infraestructura, almacenamiento y revisión humana con carga real antes de ofertar.
- Un timeout tras posible aceptación remota es `outcome_unknown`: reconciliar por referencia fiable o bloquear y escalar. No existe exactly-once HTTP; desactivar una feature no revierte un efecto remoto ni borra evidencia.

## 4. Modelo de dominio: qué conserva cada objeto

| Objeto | Conserva | No acredita por sí solo |
|---|---|---|
| `RiskDeclaration` | hechos declarados por el tomador, fuente, fecha e incertidumbre. | veracidad ni ausencia de omisión relevante. |
| `PolicyVersion` / `Endorsement` | documento original, versión, vigencia y custodio. | cobertura vigente sin aplicar endosos posteriores. |
| `PolicyProjection` | conclusión sobre cobertura con cláusula, documento y estado. | confirmación de la aseguradora. |
| `RuleEvaluation` | reglas atómicas, composición, versión y entradas. | corrección jurídica de la precedencia. |
| `CoverageNeed` / `CoverageComparison` | necesidad, criterios, huecos, exclusiones y supuestos. | adecuación del producto ni recomendación permitida. |
| `QuoteSnapshot` | emisor, versión, emisión, caducidad y condiciones. | oferta vigente si caducó. |
| `Estimate` / `ReserveEstimate` | importes decimales, parámetros y marca ilustrativa. | indemnización, deuda u obligación de pago. |
| `ClaimNotice` / `ClaimEvidence` | hecho, fecha declarada, evidencias y versiones. | derecho a indemnización ni plazo confirmado. |
| `BrokerHandoff` | destinatario, contenido, referencia y ACK. | recepción sin ACK ni decisión del operador. |
| `ProfessionalDecision` | revisor, competencia, referencia y acto. | efecto externo distinto del documentado. |

**Ejemplo sintético:** póliza con límite de 60.000 EUR, franquicia de 500 EUR y un endoso que excluye daños por filtraciones a partir del 1 de septiembre. Llega un siniestro con fecha declarada imprecisa entre agosto y septiembre. El sistema no elige una fecha ni calcula una indemnización: muestra la proyección con y sin endoso, marca la fecha como incierta, identifica el dato faltante y deja la cifra bloqueada. La comparación con una oferta rival indica que el precio menor excluye esa garantía; no la ordena como mejor. No se envía nada a la aseguradora. Es un ejemplo conceptual, no un cálculo del producto.

## 5. Arquitectura y boilerplate previstos

El repositorio propone TypeScript/Hono/pnpm, Postgres/Supabase, workers/outbox y adaptadores. En el SHA revisado no existe aplicación ni lockfile. Los siguientes paths son **propuestas de esta auditoría**, no archivos existentes; las fichas del repo proponen además `docs/implementation/cNN/{README,EVIDENCE,TESTS,RISKS}.md` por fase.

```text
apps/api/src/                    # rutas nominadas, principal, policy y ACL
apps/worker/src/                 # jobs con mandato, revalidación y reconciliación
apps/portal/                     # cartera, siniestro, comparación y revisión
packages/contracts/src/          # DTOs, Money, errores y validación runtime
packages/auth/src/               # JWT, membership, ACL y mandatos
packages/policies/src/           # pólizas, endosos y proyección versionada
packages/rules/src/              # reglas atómicas, composición y DSL seguro
packages/quotes/src/             # solicitud, snapshot, comparación y huecos
packages/claims/src/             # notice, evidencias y cadena decisional
packages/estimates/src/          # estimaciones y reservas ilustrativas
packages/renewals/src/           # renovación, cambios y reclamaciones
packages/handoff/src/            # broker handoff, ACK y decisión externa
packages/adapters/src/           # conectores con capability report
packages/events/src/             # inbox/outbox, receipts y bridge
migrations/                      # RLS, FK compuestas y pruebas de roles
```

**Límites de confianza:** portal y bridge envían solicitudes tipadas; el servidor verifica principal, ACL, representación y mandato. Core determinista conserva estado y calcula proyecciones; un gateway de modelos recibe solo contexto autorizado y minimizado. El worker revalida acceso y versión antes de actuar. Almacenamiento, búsqueda, informes y dashboards respetan el mismo ámbito. El backend externo es frontera separada con capacidad, edición, rol y coste documentados. `agente` conserva la identidad canónica; el twin no crea un registro soberano alternativo ni copia memorias de clientes. Conservar `tenantId`, `runtimeId`, `roleId`, `personaId?`, `kernelTurnId?`, provenance y delegante/ejecutor según contratos reales del padre.

**Estados propuestos:** `intake → authorization_pending → collecting_facts → incomplete → prepared → professional_review → submitted_by_authorized_operator → acknowledged → decision_pending → externally_decided → closed`, más `disputed` y `blocked`. `incomplete` y `blocked` son estados de primera clase, no fallos a disimular. `submitted_by_authorized_operator` exige prueba del operador; `externally_decided` exige referencia y prueba de la decisión, no una inferencia.

**Persistencia:** tablas por tenant y recurso para pólizas y versiones, endosos, proyecciones, evaluaciones de reglas, ofertas y snapshots, siniestros y evidencias, estimaciones, handoffs, decisiones, aprobaciones, conexiones, intents/attempts, jobs, inbox/outbox y audit. FK compuestas impiden referencias cruzadas. Las pruebas de RLS usan roles reales, incluidos workers y rutas de exportación, sin asumir que `service_role` protege por sí mismo.

## 6. Agentes autónomos y gates

Los agentes preparan propuestas, código y evidencia dentro del encargo autorizado; ninguna autoridad nace de su autodescripción ni de su nombre. Reparto sugerido: (1) coordinación congela SHAs, fuentes y dependencias; (2) seguridad valida principal, política y aislamiento; (3) dominio implementa proyección, reglas y estimaciones; (4) integración verifica versión, edición y ACL reales sin escalar permisos; (5) QA adversarial construye fixtures sintéticos y casos de precedencia; (6) un profesional competente revisa adecuación, cobertura y decisiones. El agente puede proponer una revisión; no puede certificar su propia salida ni sustituir al revisor.

Cada fase futura: leer la ficha y su entrada completa del manifest; congelar SHAs propio, padre y upstreams; concretar tipos, cardinalidad e invariantes; implementar con pruebas proporcionadas al riesgo; recoger evidencia sanitizada; registrar riesgos y decisión `PASS`, `BLOCKED` o `NOT_VERIFIED`; informar y abrir la siguiente solo con dependencias cerradas. `PASS` exige resultados reales en un entorno declarado; un fake prueba el contrato del fake y nada más.

Checkpoints tras C05, C10, C15, C20, C25, C30, C35, C40 y C42: SHA/PR/diff, entorno y versiones, fases `PASS`/`BLOCKED`/`NOT_VERIFIED`, pruebas realmente ejecutadas/pasadas/fallidas/omitidas, fixtures y referencias sanitizadas, coste, riesgos y siguiente dependencia. Sin plazo ficticio de siete días. STOP ante fuga, bypass de autorización o revisión, secreto expuesto, doble efecto o pérdida de audit.

## 7. Plan secuencial de las 42 campañas

Estas fichas son **recomendaciones de esta auditoría** derivadas del índice y de las fuentes de §2; no transcriben las tareas del manifest ni acreditan ejecución. Todas están `NOT_STARTED` con gates `NOT_EXECUTED`. Cada una depende al menos del cierre de la anterior y de los controles comunes de autorización, evidencia y revisión; consultar el manifest para dependencias adicionales.

### SEG-C01 — Baseline, fuentes y alcance
**Objetivo:** fijar repo, padre, políticas, ramo y vertical sintética. **Trabajo:** registrar árbol, versiones, fuentes, licencias y evidencia de baseline; separar observado de hipotético. **Gate futuro:** entorno reproducible, alcance aprobado y capacidades no probadas deshabilitadas; una ausencia se registra, no se inventa.

### SEG-C02 — Autoridad por dominio y contrato SaaS
**Objetivo:** repartir responsabilidad entre servicio, aseguradora, operador autorizado y padre. **Trabajo:** `ServiceAgreement`, `WorkOrder`, AuthorityMap, un ejecutor por efecto y regla de qué documento gobierna qué campo. **Gate:** conflicto de autoridad bloquea sincronización o efecto; sin default implícito ni doble dueño de la cobertura.

### SEG-C03 — Supabase JWT y principal
**Objetivo:** identidad verificable en todos los modos. **Trabajo:** validar firma, issuer, audience y tiempos; cargar membership y scope desde servidor; negar por defecto. **Gate:** token inválido, caducado, de otro tenant o con membership revocada no lee ni opera; sin fallback owner ni confianza en `user_metadata`.

### SEG-C04 — Twins y nomenclatura canónica
**Objetivo:** integrar identidad canónica sin duplicar el agente del padre. **Trabajo:** mapear actor, runtime/role/persona/kernelTurn reales, vínculos y delegación; separar tenant origen y objetivo. **Gate:** no copiar memorias de clientes ni aceptar `tenantId` del modelo como autorización; compatibilidad cotejada contra el SHA real del padre.

### SEG-C05 — DTOs, esquemas y errores
**Objetivo:** frontera tipada y validada. **Trabajo:** contratos estrictos, IDs opacos, fechas con zona, `Money` decimal, versiones y errores sanitizados; distinguir desconocido, no soportado y prohibido. **Gate:** input extra o inválido rechazado, sin filtrar datos privados, round-trip y versionado probados; informe de checkpoint.

### SEG-C06 — Persistencia, RLS y migraciones
**Objetivo:** aislamiento durable. **Trabajo:** modelar pólizas, siniestros y referencias con FK compuestas, RLS, ACL y migraciones reversibles; separar audit de payload personal. **Gate:** con roles reales, A no accede a B ni a un recurso restringido de su propio tenant; jobs y backups no eluden política.

### SEG-C07 — Mandatos, finalidad y aprobaciones
**Objetivo:** delegación y autorización verificables. **Trabajo:** actor origen, target, finalidad, capacidad, plazo, revocación y presupuesto; aprobación ligada a hash, versión, destinatario y caducidad. **Gate:** revocación, cambio material o expiración detiene el trabajo; aprobar una propuesta no habilita contratar, pagar ni decidir.

### SEG-C08 — Secretos, discovery y aislamiento remoto
**Objetivo:** credenciales y conectividad acotadas. **Trabajo:** referencias de secreto solo servidor, conexión por ámbito, límites de egress/DNS/redirección y `CapabilityReport` por versión y rol. **Gate:** capacidad desconocida deshabilitada, permisos mínimos y cero URL o método libres del modelo; un mock no acredita conexión real.

### SEG-C09 — Evaluación del rol y actividad
**Objetivo:** determinar qué actividades puede realizar el servicio en un ámbito. **Trabajo:** `ServiceRoleAssessment` con territorio, ramo, actividad (informar, preparar, intermediar, distribuir), base y revisor; documentar límites y exclusiones. **Gate:** sin operador o alcance competente el expediente queda `authorization_pending`; el servicio no se atribuye licencia ajena.

### SEG-C10 — Representación y destinatarios
**Objetivo:** verificar quién actúa por el tomador o asegurado. **Trabajo:** `CustomerAuthority` con alcance, finalidad, vigencia, prueba y destinatarios permitidos; separar titular, representante y colaborador. **Gate:** solicitante sin representación no ve documentos ni agregados inferibles; compartir con un destinatario nuevo exige autorización. Checkpoint.

### SEG-C11 — Declaración de riesgos
**Objetivo:** capturar lo declarado sin convertirlo en verificado. **Trabajo:** `RiskDeclaration` con fuente, fecha, autor, incertidumbre, omisiones conocidas y campos pendientes; distinguir declaración, inferencia y dato comprobado. **Gate:** un dato desconocido queda pendiente y no se sustituye por una respuesta favorable; sin dato sensible inferido ni perfilado no autorizado.

### SEG-C12 — Custodia póliza y endosos
**Objetivo:** conservar original y versiones con trazabilidad. **Trabajo:** `PolicyVersion`, `Endorsement`, hash, custodio, procedencia y vigencias; cuarentena y control de contenido activo. **Gate:** endoso posterior crea versión y puede invalidar la proyección; el hash detecta cambio pero no acredita autenticidad ni cobertura.

### SEG-C13 — Extracción y cláusulas
**Objetivo:** extraer texto y cláusulas revisables sin perder incertidumbre. **Trabajo:** páginas, coordenadas, versión de extractor, confianza y errores; anclaje de cláusula a documento y versión. **Gate:** franquicia o límite leído con baja confianza exige revisión antes de estimar; la corrección humana no altera el original.

### SEG-C14 — Necesidades y demandas
**Objetivo:** expresar necesidades del cliente sin convertirlas en recomendación de venta. **Trabajo:** `CoverageNeed` con hecho, exposición, prioridad declarada, fuente y contradicciones; separar necesidad de producto. **Gate:** necesidad contradictoria produce revisión, no un ranking comercial; el precio no ordena adecuación.

### SEG-C15 — Inventario de coberturas
**Objetivo:** inventariar garantías, límites y exclusiones por póliza vigente. **Trabajo:** inventario con condición, sublímite, franquicia, carencia, territorialidad y documento de origen. **Gate:** falta de condición particular bloquea conclusión firme; nada se completa por similitud con otra póliza. Checkpoint.

### SEG-C16 — Solicitud de oferta
**Objetivo:** preparar una solicitud con los datos necesarios y no más. **Trabajo:** `QuoteRequest` con datos mínimos por finalidad, versiones de declaración y autorización de compartición. **Gate:** no se comparten datos de terceros innecesarios ni se envía sin representación y destinatario verificados.

### SEG-C17 — Importación de ofertas
**Objetivo:** incorporar ofertas conservando procedencia y estado. **Trabajo:** `QuoteSnapshot` con emisor, versión, emisión, caducidad, condiciones y campos pendientes; repetición idéntica no duplica. **Gate:** oferta caducada o de fecha dudosa no se selecciona como vigente; la aceptación local no fabrica emisión de póliza.

### SEG-C18 — Comparación explicable
**Objetivo:** comparar por criterios declarados, no por precio. **Trabajo:** criterios versionados, `coverageGaps`, exclusiones y supuestos visibles; productos no equivalentes muestran diferencias. **Gate:** el análisis no se comunica como cobertura o indemnización garantizada ni se apoya en dato sensible no autorizado; cambio de criterios invalida la aprobación.

### SEG-C19 — Motor de reglas ilustrativo
**Objetivo:** evaluar reglas atómicas con composición versionada. **Trabajo:** DSL o funciones en allowlist, sandbox sin secretos, entradas y versión registradas y explicación por pasos. **Gate:** una variante factual cambia reglas y módulos coherentemente; contradicción entre cláusulas es conflicto, no precedencia inventada.

### SEG-C20 — Estimaciones y franquicias
**Objetivo:** producir cifras ilustrativas reproducibles. **Trabajo:** `Estimate` con `Decimal`, divisa, límite, sublímite, franquicia y supuestos revisados; estados `blocked` por dato faltante. **Gate:** sin límite o franquicia no hay cifra firme; estimación, reserva e indemnización no se confunden. Checkpoint.

### SEG-C21 — Adaptador openIMIS
**Objetivo:** evaluar un candidato sin asumir capacidades ni licencia. **Trabajo:** binding por ámbito, roles, operaciones permitidas, versión y revisión de AGPLv3 y dependencias; solo entorno autorizado y datos sintéticos. **Gate:** módulo no soportado devuelve `unsupported`; instalación real probada o `NOT_VERIFIED`; nunca simulación presentada como conector.

### SEG-C22 — Oasis y riesgo agregado
**Objetivo:** explorar modelado de catástrofes como análisis, no como tarificación. **Trabajo:** exposición, licencia de modelo, versión y límites del job; resultados marcados como modelados con supuestos. **Gate:** falta de licencia o exposición apta bloquea el job; no se extrapola a prima, solvencia ni decisión.

### SEG-C23 — Intake de siniestro
**Objetivo:** registrar el aviso con lo declarado y sus incertidumbres. **Trabajo:** `ClaimNotice` con hecho, fecha declarada, póliza y endosos candidatos, evidencias y campos pendientes. **Gate:** fecha dudosa no activa plazo confirmado; el aviso local no equivale a notificación recibida por la aseguradora.

### SEG-C24 — Evidencias de siniestro
**Objetivo:** custodiar y anclar pruebas sin otorgarles autoridad. **Trabajo:** `ClaimEvidence` con hash, procedencia, tipo, anclaje y versiones; cuarentena, antivirus y tratamiento de contenido hostil. **Gate:** documento adversarial no dicta denegación, export ni pago; ausencia de análisis de seguridad bloquea la ingesta sensible.

### SEG-C25 — Cadena decisional revisable
**Objetivo:** reconstruir cómo se llegó a una conclusión propuesta. **Trabajo:** pasos con regla, documento, versión, evidencia y revisor; invalidación en cascada al cambiar cualquier entrada. **Gate:** un caso variante detecta inconsistencia propagada; ninguna decisión adversa se registra sin origen y prueba del operador competente. Checkpoint.

### SEG-C26 — Handoff a operador
**Objetivo:** transferir el expediente al operador autorizado. **Trabajo:** `BrokerHandoff` con alcance, contenido mínimo, referencia, destinatario verificado e idempotencia. **Gate:** sin ACK queda pendiente y no se duplica el notice; un evento enviado no cuenta como recibido.

### SEG-C27 — Decisión externa y explicación
**Objetivo:** referenciar la decisión de la aseguradora sin generarla. **Trabajo:** registrar origen, fecha, referencia, documento y explicación recibida; marcar `not_verified` si falta prueba. **Gate:** decisión sin origen o prueba no se eleva a autoridad local; la explicación del servicio no se presenta como motivación oficial.

### SEG-C28 — Seguimiento y plazos
**Objetivo:** proponer plazos auditables. **Trabajo:** evento probado, regla y calendario versionados, territorio, zona y cómputo; historial de revisiones. **Gate:** cambio de fecha inicial fuerza nueva revisión; sin evento o calendario no hay plazo confirmado, y no existe presentación automática.

### SEG-C29 — Renovación y cambios
**Objetivo:** preparar renovaciones y modificaciones sin efecto contractual. **Trabajo:** `RenewalProposal` con póliza base, cambios, condiciones nuevas, caducidad y aprobación; separar propuesta de emisión. **Gate:** una petición verbal o por chat queda como propuesta sin efecto vinculante; la póliza nueva no hereda coberturas por defecto.

### SEG-C30 — Reclamación y recurso
**Objetivo:** preparar una reclamación con evidencia y escalado. **Trabajo:** antecedentes, decisión referenciada, motivos, documentación y responsable; escalar riesgo jurídico y conservar todo. **Gate:** el servicio no presenta ni negocia vinculantemente; una reclamación no suspende por sí sola plazos ni reabre cobertura. Checkpoint.

### SEG-C31 — Riesgo de agentes IA
**Objetivo:** tratar la exposición propia del servicio ante fallos de IA. **Trabajo:** inventario de riesgos (error de regla, cobertura aparente, dato sensible, decisión opaca), controles, límites de uso y revisión proporcionada por criticidad. **Gate:** un evento ciber o una exclusión genérica no prueban cobertura ni ausencia de responsabilidad sin póliza y análisis competente.

### SEG-C32 — Privacidad y conservación sectorial
**Objetivo:** gobernar datos sensibles y retención del sector. **Trabajo:** finalidad, base, minimización, plazos de conservación, export y supresión con revisión, y propagación a índices, caché y backups. **Gate:** restore y export no reexponen datos de otro asegurado ni resucitan accesos revocados; la supresión no se ejecuta por chat.

### SEG-C33 — Reportes, dashboard e infografías
**Objetivo:** exponer estado y límites sin filtrar ni exagerar. **Trabajo:** snapshots con cobertura, frescura, pendientes y referencias mínimas; agregados con umbral y ACL. **Gate:** un agregado pequeño no revela datos de otro asegurado; ninguna métrica se presenta como ratio de indemnización, solvencia o predicción validada.

### SEG-C34 — Portal responsive, chat y Anam
**Objetivo:** mostrar cartera, siniestro y revisión con advertencias claras. **Trabajo:** estados, procedencia, pendientes, accesibilidad y avisos de límite; chat y presencia bajo el mismo enforcement. **Gate:** el avatar no se presenta como corredor, perito o aseguradora ni aprueba; cambiar de usuario o tenant cierra contexto y revalida acceso.

### SEG-C35 — SDK TypeScript, Hono y tools
**Objetivo:** integrar capacidades nominadas sin acceso genérico. **Trabajo:** SDK de servidor, proxy con allowlist estricta, DTOs y tool set limitado; errores sin secretos. **Gate:** ningún método libre de HTTP/SQL/shell ni aprobación, pago o decisión expuesto al modelo; compatibilidad verificada antes de publicar. Checkpoint.

### SEG-C36 — Bridge de agente y eventos
**Objetivo:** conectar especialista y padre sin modificar el repositorio padre. **Trabajo:** mapeo explícito de eventos, provenance, actor y referencias mínimas; inbox/outbox y ACK tras commit. **Gate:** entrega duplicada no duplica trabajo; no inventar enum host ni afirmar recepción sin ACK; el wiring requiere otro encargo.

### SEG-C37 — Cooperación y handoff empresarial
**Objetivo:** coordinar servicios de la familia con datos mínimos. **Trabajo:** `WorkOrder`, AuthorityMap, mandato, alcance, receipt y responsable único por efecto. **Gate:** un hermano sin permiso no ve material ni inventa revisión, saldo o dictamen; cambiar alcance exige autorización nueva.

### SEG-C38 — Modelos, coste y observabilidad
**Objetivo:** limitar uso y medir coste real. **Trabajo:** modelo permitido por tarea, región y retención; presupuesto reservado, métricas agregadas y logs sanitizados sin PII. **Gate:** proveedor no aprobado, coste desconocido o fuga detiene la operación; sin medición no se prometen precios, latencias ni precisión.

### SEG-C39 — Privacidad y pruebas adversariales
**Objetivo:** probar los límites frente a actores y entradas hostiles. **Trabajo:** BOLA entre y dentro de tenants, prompt injection en documentos, SSRF, archivos maliciosos, secretos centinela, export y revocación. **Gate:** cualquier fuga o bypass crítico implica STOP; solo datos sintéticos y ninguna prueba planificada cuenta como ejecutada.

### SEG-C40 — Vertical E2E y fallos distribuidos
**Objetivo:** recorrer el flujo completo con datos sintéticos. **Trabajo:** A/B/P, extracción, comparación, siniestro, revisión y handoff; falta de ACK, crash antes y después del commit y aceptación remota incierta donde esté autorizado. **Gate:** cero fuga, cero duplicado, cero efecto prohibido y `outcome_unknown` reconciliado o bloqueado; evidencia real. Checkpoint.

### SEG-C41 — Operaciones, CI, backup y release
**Objetivo:** hacer operable y recuperable el alcance autorizado. **Trabajo:** CI reproducible, alertas sin PII, versionado, runbook de incidentes, copia cifrada y prueba de restore con restricciones reimpuestas. **Gate:** sin restore probado ni dependencias verificadas no se declara readiness; desactivar una feature no revierte efectos remotos.

### SEG-C42 — Aceptación, evidencia y handoff final
**Objetivo:** entregar límites y decisiones reales al owner. **Trabajo:** inventariar SHA, gates, fixtures, resultados, proveedores, licencias, costes, riesgos y responsables; separar sintético de real. **Gate:** aceptación explícita solo del alcance probado; pendientes `BLOCKED`/`NOT_VERIFIED` visibles. Checkpoint final, sin convertir diseño en producto acreditado.

## 8. Plan de pruebas futuras por riesgo

Ninguna prueba de producto de esta sección se ejecutó durante la auditoría.

| Riesgo | Casos previstos | Criterio |
|---|---|---|
| Cobertura aparente | Endoso posterior, cláusula contradictoria, condición particular ausente, póliza renovada. | Proyección versionada y `blocked`/conflicto visibles; nunca cobertura confirmada. |
| Reglas | Precedencia invertida, sublímite omitido, variante factual, regla compuesta circular. | Cambio coherente de reglas y módulos; conflicto no resuelto por el sistema. |
| Estimaciones | Franquicia ausente, límite agotado, divisa distinta, fecha de valoración dudosa. | Cifra bloqueada con dato faltante; estimación ≠ reserva ≠ indemnización. |
| Comparación | Oferta caducada, productos no equivalentes, hueco de garantía, dato sensible. | Diferencias y pendientes visibles; el precio no ordena adecuación. |
| Representación | Solicitante sin poder, representación revocada, destinatario nuevo, cambio de finalidad. | Denegar antes de leer o compartir; sin agregados inferibles. |
| Siniestros | Fecha dudosa, evidencia adversarial, inconsistencia propagada, handoff sin ACK. | Sin plazo confirmado ni duplicado; decisión externa solo con prueba. |
| Licencia y rol | Actividad de distribución sin habilitación, backend AGPL en red, modelo sin licencia. | Bloquear o marcar `NOT_VERIFIED`; no atribuirse licencia. |
| Distribuidos | Replay, timeout tras aceptación, worker duplicado, restore con datos retirados. | Deduplicación local, reconciliación de incertidumbre y restricciones restauradas. |
| Modelo | Contexto de otro asegurado, retrieval sin filtro, logs y canarios. | Sin fuga a modelo, índices, métricas, informes ni destinatarios. |

Usar unitarias de cálculo y reglas, pruebas de contrato, integración con versión/edición/rol reales y E2E sintético; guardar versión, entorno y evidencia. Falta de Docker, red, licencia, modelo o cuenta implica `NOT_VERIFIED` o `BLOCKED`, no PASS. Una prueba local no valida la API real ni una decisión de la aseguradora.

## 9. Decisiones pendientes antes de implementar

1. **Ámbito y rol:** definir ramos, territorios y actividades permitidas; obtener evaluación jurídica sobre distribución, mediación y peritaje antes de cualquier dato real.
2. **Datos sensibles:** documentar finalidad, base, minimización, retención, subencargados y respuesta a incidentes; decidir si el piloto admite datos de salud y con qué salvaguardas.
3. **Fuentes y documentos:** fijar qué documentos gobiernan cobertura, cómo se versionan los endosos y qué se hace cuando falta la condición particular.
4. **Backend:** elegir un único camino de piloto y verificar licencia, edición, ACL y límites reales. No instalar openIMIS, Oasis y CDM para aparentar cobertura.
5. **Operador y revisión:** identificar quién revisa y quién decide, con competencia y prueba documentadas; definir el handoff y el ACK esperado.
6. **Coste y riesgo:** presupuestar implementación, revisión y operación con mediciones, y registrar riesgos residuales con responsable, sin autorizar gasto ni comprometer plazos.

## 10. Resultado de esta auditoría

La entrega es únicamente este informe. Cubre el árbol y el índice de 42 campañas, las fuentes selectivas indicadas y una ficha completa; no una lectura exhaustiva de todas las tareas ni del manifest. Propone decisiones y gates; no certifica seguridad, cumplimiento, licencias, capacidad profesional ni cobertura de ningún producto. No se ejecutaron pruebas de producto, campañas ni acciones externas, y no se modificó el repositorio remoto de seguros.
