# Auditoría integral de Agntia Legal y plan de sus 42 campañas

**Repositorio:** [uniscrolliabrain-cloud/agntia-legal](https://github.com/uniscrolliabrain-cloud/agntia-legal/tree/b448d7cc162ebf30d97f76e50d402544357383cd)  
**Referencia:** `b448d7cc162ebf30d97f76e50d402544357383cd` · **Fecha:** 13-11-2026  
**Naturaleza:** auditoría documental y diseño para una futura implementación autorizada. No es dictamen jurídico, certificación de cumplimiento ni aprobación para ejercer una profesión regulada.

## 1. Resumen ejecutivo

Agntia Legal propone un SaaS especializado en operaciones jurídicas, contratos y cumplimiento: intake, control de conflictos, custodia y análisis de documentos, investigación por territorio y fecha, borradores/redlines, obligaciones y revisión humana. El agente canónico reside en `agente`; aquí se plantea un twin acotado y un portal propio para clientes externos.

El árbol y el [README](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/README.md) describen un repositorio **DOCUMENTATION_ONLY**: no hay aplicación, SDK ni proveedores conectados o pruebas de producto acreditadas. El [índice](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/campaigns/README.md) declara 42 campañas `NOT_STARTED`, 294 tareas y 84 escenarios `NOT_EXECUTED`: son trabajo previsto, no evidencias de ejecución. No existe todavía boilerplate ejecutable que evaluar como producto.

**Recomendación P0:** una vertical sintética y sin efectos: encargo → conflictos y alcance → documento preservado → hechos y citas con evidencia → fuente por territorio y fecha → borrador/redline → revisión competente → entrega en sandbox con advertencias. No firmar, presentar escritos, negociar vinculantemente ni representar a nadie. Un aviso en pantalla no basta: bloquear técnicamente esas capacidades. La identidad de un usuario y la apariencia de un avatar tampoco prueban representación, cualificación profesional o secreto profesional.

| Área | Lo positivo del diseño | Brecha a resolver antes del piloto |
|---|---|---|
| Citas | Separa identidad, fragmento, vigencia y pertinencia. | No se ha verificado resolución en fuentes reales ni cobertura, temporalidad o evaluación profesional. |
| Expedientes | Propone `LegalMatter`, alcance, conflictos y ACL. | No hay controles ejecutables que demuestren aislamiento dentro y entre tenants. |
| Custodia | Propone hash, versiones y fuente del original. | Hash no prueba autenticidad, origen lícito, integridad de la cadena de custodia ni admisibilidad. |
| Plazos | Pide regla, evento inicial y calendario. | No hay motor ni calendarios probados; un plazo no puede nacer de una inferencia del chat. |
| Revisión | Diferencia propuesta y revisión competente. | Deben verificarse identidad, competencia, alcance, versión y revocación; el LLM no se autoaprueba. |
| Adaptadores | Declara candidatos y licencias pendientes. | Versiones, derechos sobre datos/modelos, ACL y semántica real no están verificados en runtime. |
| Seguridad | Previstas RLS, mandatos y control end-to-end. | No hay pruebas reales de BOLA, recuperación, índices, exportación o terceros. |
| Operación | Plantea outbox, reconciliación y rollback. | Faltan ejecución, incidentes, mediciones y restore; el rollback no deshace efectos remotos. |

## 2. Alcance, fuentes y grado de certeza

Se examinó el árbol recursivo remoto, no truncado, en el SHA indicado, además del README, [producto](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/01-producto.md), [arquitectura](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/architecture/01-arquitectura.md), [contratos](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/contracts/01-contratos.md), [seguridad](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/05-seguridad-privacidad.md), [adaptadores](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/04-adaptadores.md), índice de campañas y [handoff](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/release/HANDOFF.md). Se consultaron además las fichas completas de [citas C20](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/campaigns/20-resolucion-de-citas.md) y [plazos C28](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/campaigns/28-calendario-de-plazos.md). La recuperación del informe al owner se truncó. **No se han leído íntegramente las otras 40 fichas ni el [manifest](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/b448d7cc162ebf30d97f76e50d402544357383cd/docs/campaigns/campaign.json)**; el desarrollo de fases de esta auditoría se basa en su índice, nombres, contratos y arquitectura y debe contrastarse con cada ficha y tarea antes de implementarla.

El handoff cita el SHA del padre `54b8d5407a8576459448c4d059a877297d18ca7a`; se trata de una referencia declarada por el repo, no de una auditoría nueva del padre. Tampoco se han contrastado las fuentes normativas, licencias, servicios externos o jurisprudencia actuales para una jurisdicción concreta. Las recomendaciones jurídicas operativas requieren revisión cualificada con territorio, fecha y alcance explícitos.

No se ha instalado software, ejecutado una campaña o prueba de producto, usado datos reales, gastado, desplegado ni modificado `agente` o el repositorio remoto de legal. Los archivos y ejemplos de esta auditoría son propuestas, salvo enlaces identificados como fuentes revisadas.

## 3. Hallazgos y mejoras prioritarias

### P0.1 — Cita auténtica no equivale a conclusión correcta

Una resolución o norma puede existir y aun así no ser aplicable al territorio, órgano, hechos o fecha de interés; una versión consolidada puede no coincidir con la vigente para un evento histórico. La salida debe distinguir `identidad_resuelta`, `fragmento_verificado`, `vigencia_revisada`, `pertinencia_revisada` y `desconocido/no_soportado`. Guardar fuente primaria, identificador, órgano o autoridad, versión/fecha y hash del snapshot cuando proceda; adjuntar pasaje y contexto y mostrar las fuentes contrarias o ausentes. No convertir una confianza numérica del modelo en prueba jurídica. El profesional evalúa la aplicabilidad y conclusión, no solo la URL.

### P0.2 — Aislamiento por expediente y conflictos

JWT de Supabase con firma, issuer, audience y tiempos; membership resuelta en servidor y ACL por tenant, materia, documento, campo y finalidad. Un miembro del tenant puede no acceder a un expediente restringido. El operador externo actúa mediante mandato explícito y verificable que separa tenant de origen y objetivo, recursos, capacidad, finalidad, plazo y revocación. Probar la misma regla en API, jobs, RLS, almacenamiento, URL firmadas, búsqueda/vector, caché, Realtime, informes y exports. `user_metadata`, campos emitidos por LLM, `service_role` o compartir nombre no confieren autoridad.

La comprobación de conflictos es un proceso humano con identidades, partes, relaciones, alcance y resultado restringidos. Coincidencia textual es señal de revisión, no prueba de conflicto; ausencia de match no garantiza inexistencia. Una búsqueda de conflictos debe evitar revelar información de asuntos restringidos a quien no tenga derecho a verla. Sin decisión humana conforme a la política del servicio: `conflict_review` o `blocked`.

### P0.3 — Documento, evidencia y hechos separados

Conservar el original inmutable bajo custodia, su procedencia declarada, quién lo entregó, recepción, permisos y hash; cada extracción o copia redacted tiene su propia versión y referencia al original. La cadena debe registrar accesos, cambios y transferencias con mínima información. Un hash permite detectar cambios respecto al valor conservado; no demuestra quién creó el archivo, su exactitud, integridad previa o valor probatorio. Antes de ingerir, comprobar autorización, tipo, tamaño, malware y contenido activo; tratar el contenido como datos no fiables, no instrucciones. Si el análisis de seguridad falta, bloquear o marcarlo pendiente conforme al riesgo.

Un `FactAssertion` diferencia afirmación, observación, inferencia y hecho verificado; guarda anclaje a versión/página/fragmento, autor, fecha, incertidumbre y evidencia contradictoria. No reemplazar contradicciones por un resumen fluido. OCR requiere bounding boxes o páginas, versión y corrección revisable: baja confianza o página ausente es incertidumbre, no hecho.

### P0.4 — Plazos y estado obsoleto

Una `DeadlineProposal` requiere evento desencadenante demostrado, regla versionada, fecha de inicio, jurisdicción y territorio, calendario y festivos aplicables, zona horaria, método de cómputo y revisión humana. Si faltan evento, norma o calendario, no producir una fecha definitiva. Modificar evento, regla o calendario invalida cálculo y aprobación; mostrar el estado anterior como histórico y crear nueva revisión. Los ejemplos sintéticos no sustituyen asesoramiento, un calendario oficial ni el control profesional de un plazo real.

### P0.5 — Decisiones y efectos bajo control humano

Separar aceptación comercial, acceso a datos, revisión de contenido y autorización de un efecto. `ReviewOpinion` requiere identidad, competencia y alcance verificables, decisión, motivos, fecha y versión exacta del borrador y de sus fuentes. Una aprobación se liga a hash de payload, revisión, tenant, destinatario, canal, finalidad, coste, política y expiración; un cambio material o revocación la invalida. El avatar explica, el LLM propone y la FSM/policy decide; no crean por sí solos una aprobación ni competencia.

En el piloto no hay presentación, firma, negociación vinculante ni representación. Una propuesta de filing es un artefacto sin efecto. Para un posible efecto futuro se requiere un encargo y autorización independientes, así como revisión de atribuciones y controles profesionales; nada de esta auditoría habilita dichos actos.

### P0.6 — Riesgo distribuido, privacidad y recuperación

Persistir intent, versión, key de idempotencia, audit y outbox en transacción local; revalidar mandato y aprobación inmediatamente antes del efecto futuro autorizado. HTTP remoto no participa de esa transacción: timeout tras posible aceptación significa `outcome_unknown`, reconciliar con evidencia fiable o bloquear/escalar, nunca reintentar a ciegas ni cambiar proveedor/clave. No prometer exactly-once HTTP. Restaurar backups sin resucitar permisos, supresiones o envíos históricos; conservar restricciones y legal hold aplicable. Las decisiones de conservación, acceso, supresión y excepciones se revisan según rol, contrato y derecho aplicable; no prometer borrado universal inmediato ni secreto profesional por ser SaaS.

### P1 — Redline, fuentes y proveedores

- Preservar original y revisiones; registrar cambios estructurados y diferencias legibles, inclusive tablas, anexos y texto omitido. Un diff no reemplaza revisión jurídica y formatos no soportados deben declararse.
- BOE/EUR-Lex se plantean como fuentes oficiales, pero disponibilidad, versiones históricas, límites, licencias y cobertura deben probarse; una sola fuente no cubre todo el derecho o jurisprudencia.
- OpenContracts y docassemble figuran como candidatos MIT según metadatos del repo; eyecite como BSD-2 y LexNLP como AGPL; Marker distingue licencia del código de pesos/modelos. Son declaraciones del repositorio, no comprobación independiente. Revisar edición, dependencias, datasets, permisos, despliegue y obligaciones antes de elegir un camino. Eyecite no valida universalmente ECLI español.
- Entrada, salida y datos del modelo deben minimizarse por expediente y finalidad; resolver región, retención y subencargados antes de datos reales. No usar secretos, credenciales o memoria cruzada de clientes en prompts o logs.

## 4. Modelo de dominio y trazabilidad

| Objeto propuesto | Conserva | No acredita por sí solo |
|---|---|---|
| `EngagementScope` | cliente, propósito, actos permitidos, territorio, vigencia y responsables. | representación profesional o permiso de todo acto. |
| `ConflictCheck` | partes autorizadas, método, revisión y decisión restringida. | inexistencia universal de conflicto. |
| `DocumentVersion` / `EvidenceRef` | custodio, hash, versión, procedencia y referencia. | autoría, licitud o admisibilidad de evidencia. |
| `FactAssertion` | fuente, estado, contradicciones y revisor. | verdad solo por cita o resumen del LLM. |
| `LawSnapshot` | fuente, versión, territorio y fecha de consulta o vigencia. | aplicabilidad a los hechos. |
| `CitationVerification` | identidad, pasaje, vigencia y pertinencia por separado. | dictamen correcto. |
| `Redline` | base, operaciones, versión y diferencias revisables. | negociación o aceptación vinculante. |
| `DeadlineProposal` | evento, regla, calendario, cómputo y revisión. | fecha procesal definitiva sin revisión competente. |
| `ReviewOpinion` | revisor, competencia, alcance, versión y resolución. | efecto externo o autorización distinta. |
| `RetentionHold` | alcance, fuente de instrucción, responsable y estado. | excepción perpetua o eliminación automática. |

**Ejemplo sintético:** un contrato contiene una fecha de notificación borrosa. El OCR propone una lectura y la marca incierta. Una persona coteja el original, pero si no se acredita el hecho de notificación o falta el calendario correcto, el plazo queda pendiente. Una norma localizada en una fuente oficial se muestra con su versión; la pertinencia y la conclusión requieren revisión. Cambiar el documento, el evento o la fuente vuelve obsoleto el borrador y requiere nueva revisión. No se hace ningún envío externo.

## 5. Arquitectura y boilerplate previstos

El repositorio propone TypeScript/Hono/pnpm, Postgres/Supabase, workers/outbox y adaptadores; no están implementados en el SHA revisado. Los siguientes paths son **propuestas**, no archivos existentes ni compromiso de estructura final:

```text
apps/api/src/                    # API nominada, principal, policy y ACL
apps/worker/src/                 # jobs con mandato, revalidación y reconciliación
apps/portal/                     # expediente, evidencia y revisión humana
packages/contracts/src/          # DTOs versionados, validación y errores
packages/auth/src/               # JWT, membership, ACL y mandatos
packages/matters/src/            # intake, scope, conflictos, FSM
packages/custody/src/            # originales, versiones y evidence refs
packages/extraction/src/         # OCR aislado, anchors y confianza
packages/research/src/           # fuentes, snapshots, verificación de citas
packages/contracts-domain/src/    # playbooks, borradores y redline
packages/deadlines/src/           # reglas y calendarios versionados
packages/review/src/              # cualificación, aprobación y caducidad
packages/adapters/src/            # conectores permitidos por capability
packages/events/src/              # inbox/outbox, receipts y bridge
migrations/                       # RLS/FK compuestas y pruebas de roles
```

**Límites de confianza:** portal y bridge envían solicitudes tipadas a API; el servidor verifica principal, ACL y mandato. Core determinista conserva estado y propone trabajo; un gateway de modelos con política de minimización recibe solo contexto autorizado. El worker vuelve a verificar acceso y versión. Almacenamiento, búsqueda e informes respetan el mismo ámbito. El proveedor remoto es frontera separada con capacidad/edición/rol y coste documentados. `agente` conserva la identidad canónica; no copiar su runtime entero ni crear un registro soberano alternativo. Mantener `tenantId`, `runtimeId`, `roleId`, `personaId?`, `kernelTurnId?`, provenance y asignación de delegante/ejecutor según contratos reales del padre.

**Persistencia:** tablas por tenant/recurso para asuntos, participantes restringidos, versiones y anclas, fuentes, propuestas/revisiones, aprobaciones, retención/holds, conexiones y capability reports, intents/attempts, jobs, inbox/outbox y audit. FK compuestas impiden referencias cruzadas; RLS y policy se prueban con roles reales, incluyendo workers sin asumir que `service_role` protege automáticamente. Datos sensibles separados de referencias de auditoría, con retención y acceso propios. Inmutabilidad de snapshot no impide aplicar restricciones, retención y derechos revisados de manera coherente.

**Flujo de estados propuesto:** `intake → scope_pending → conflict_review → fact_gathering → research → draft → professional_review → approved_draft → delivered`; `blocked` y `stale` son explícitos. Cerrar/reabrir exige reglas y revisión; la aprobación de borrador no significa firma, presentación o representación. Al cambiar fuente, hechos, permisos o alcance se marca stale y no se reutiliza la aprobación.

## 6. Agentes autónomos y gates de ejecución futura

Los agentes solo preparan propuestas, código y evidencias dentro del encargo futuro autorizado; ninguna autoridad procede de su autodescripción. Reparto sugerido: (1) coordinador congela SHAs y dependencias; (2) seguridad valida principal, políticas y aislamiento; (3) dominio implementa evidencias, fuentes y revisiones; (4) integración verifica versiones y capacidades reales sin escalar permisos; (5) QA adversarial prepara fixtures sintéticos; (6) profesional competente examina aplicabilidad, conflictos y resultado. El agente puede proponer una revisión, pero no certificar su propia salida ni sustituir al revisor. Una fase no avanza si su dependencia crítica está bloqueada; se puede documentar trabajo aislado sin declarar PASS al gate real.

Cada fase futura: leer ficha y entrada íntegra del manifest; fijar SHA propio/padre/upstream, derechos y alcance; concretar tipos/invariantes; implementar con pruebas proporcionadas; recoger evidencia sanitizada; registrar riesgos y decisión `PASS`, `BLOCKED` o `NOT_VERIFIED`; informar y abrir la siguiente solo con sus dependencias. `PASS` requiere resultados y versión reales; un fake solo prueba el contrato del fake. Checkpoints tras C05, C10, C15, C20, C25, C30, C35, C40 y C42: SHA/diff, entorno, tests ejecutados/pasados/fallidos/omitidos, fixtures y referencias sanitizadas, coste, bloqueos, riesgo y próxima dependencia. No hay calendario artificial de siete días.

## 7. Plan secuencial de las 42 campañas

Las siguientes fichas son recomendaciones de esta auditoría, basadas en el índice y fuentes descritas en §2; **no son una transcripción de las tareas ni un resultado de ejecución**. Todas siguen `NOT_STARTED` y sus gates de producto `NOT_EXECUTED` según el índice. Cada fase depende como mínimo del cierre de la anterior y de los controles comunes de autorización, evidencia y revisión; consultar el manifest completo para dependencias adicionales.

### LEG-C01 — Baseline, fuentes y alcance
**Objetivo:** fijar referencia del repo, padre, políticas y vertical sintética; identificar autoridad y permisos. **Trabajo:** registrar árbol, versiones, fuentes primarias, licencias y evidencia de baseline, distinguiendo observado de hipotético. **Gate futuro:** entorno reproducible, alcance aprobado y capacidades no probadas deshabilitadas; cualquier ausencia se registra, no se inventa.

### LEG-C02 — Autoridad por dominio y contrato SaaS
**Objetivo:** delimitar responsabilidades por encargo entre cliente, legal, padre y otros servicios. **Trabajo:** `ServiceAgreement`, `WorkOrder`, AuthorityMap, derechos por recurso y ejecutor único por efecto; definir qué conserva el original cada sistema. **Gate:** un conflicto de autoridad bloquea sincronización o efecto, sin duplicidad ni default implícito.

### LEG-C03 — Supabase JWT y principal
**Objetivo:** crear identidad verificable en todos los modos. **Trabajo:** validar firma, issuer, audience y tiempo; cargar membership y scope desde servidor y negar por defecto. **Gate:** tokens inválidos, caducados, tenant incorrecto o membership revocada no leen ni operan; sin fallback owner ni confiar en `user_metadata`.

### LEG-C04 — Twins y nomenclatura canónica
**Objetivo:** integrar identidad y procedencia sin crear otro agente canónico. **Trabajo:** mapear actor y runtime/role/persona/kernelTurn reales, vínculos y delegación; distinguir tenant origen y objetivo. **Gate:** no copiar memorias de clientes ni tratar `tenantId` del modelo como autorización; revisar compatibilidad contra SHA real del padre.

### LEG-C05 — DTOs, esquemas y errores
**Objetivo:** frontera tipada y validada. **Trabajo:** contratos estrictos, IDs opacos, fechas con zona, importes decimales cuando existan, versiones y errores sanitizados; diferenciar desconocido, no soportado y prohibido. **Gate:** inputs extra o inválidos rechazados, datos privados no filtrados, round-trip y versionado probados; informe de checkpoint.

### LEG-C06 — Persistencia, RLS y migraciones
**Objetivo:** aislamiento durable. **Trabajo:** modelar expedientes y referencias con FK compuestas, RLS, ACL y migraciones reversibles; separar audit y payload. **Gate:** con roles reales, A no accede a B ni a asunto restringido del mismo tenant; backups y jobs no eluden política.

### LEG-C07 — Mandatos, finalidad y aprobaciones
**Objetivo:** delegación y autorización verificables. **Trabajo:** fijar actor origen, target, finalidad, capacidades, plazo, revocación y presupuesto; aprobación ligada a contenido/versión/destinatario. **Gate:** revocación, cambio material o expiración detiene trabajo; aceptar borrador no habilita firma o presentación.

### LEG-C08 — Secretos, discovery y aislamiento remoto
**Objetivo:** limitar credenciales e integración. **Trabajo:** referencias de secreto solo servidor, conexión por ámbito, límites de egress/DNS/redirección y capability report por versión/rol. **Gate:** capacidad desconocida deshabilitada, permisos mínimos y cero URL o métodos arbitrarios del modelo; un mock no acredita conexión.

### LEG-C09 — Intake y encargo
**Objetivo:** recibir solicitud sin fabricar competencias o hechos. **Trabajo:** registrar solicitante, finalidad, ámbito, territorio, fechas, documentos y preguntas pendientes. **Gate:** expediente sin alcance o autorización queda pendiente; importar una persona no crea membership.

### LEG-C10 — Conflictos y partes
**Objetivo:** detectar señales de incompatibilidad sin filtrar expedientes. **Trabajo:** relaciones, alias, coincidencias inciertas y revisión restringida; capturar decisión y responsable. **Gate:** coincidencia ambigua no autoriza; ausencia de coincidencia no demuestra ausencia de conflicto. Checkpoint de aislamiento y revisión.

### LEG-C11 — Confidencialidad de materia
**Objetivo:** control fino dentro del tenant. **Trabajo:** ACL por expediente, campos y finalidad, límites de compartición, segregación y evaluaciones de tratamiento. **Gate:** colaborador no autorizado no ve documentos, snippets, recuentos o resultados inferibles mediante búsqueda, portal o job.

### LEG-C12 — Custodia documental
**Objetivo:** conservar original y trazabilidad. **Trabajo:** hash, custodio, recepción, versiones y acceso, cuarentena y registro de procedencia; preservar original. **Gate:** cambio detectable y anclaje reproducible; el hash no se etiqueta como prueba de autoría o admisibilidad.

### LEG-C13 — OCR y extracción
**Objetivo:** transformar documentos en texto revisable sin perder incertidumbre. **Trabajo:** páginas, coordenadas, versión de extractor, confianza y errores; controles contra malware y contenido hostil. **Gate:** imagen ilegible o texto truncado queda pendiente; corrección humana no altera el original.

### LEG-C14 — Adaptador OpenContracts
**Objetivo:** evaluar un candidato sin suponer capacidades. **Trabajo:** binding por tenant/corpus, roles, operaciones permitidas, ACL, licencia y versión; usar solo entorno autorizado y datos sintéticos. **Gate:** prueba real de instalación y aislamiento o `NOT_VERIFIED`; no ampliar permisos ni confundir fake con integración.

### LEG-C15 — Entrevistas docassemble
**Objetivo:** evaluar entrevistas estructuradas para completar datos. **Trabajo:** versionar cuestionario, campos, evidencia de respuestas, permisos y vínculo con expediente; verificar licencia y dependencia. **Gate:** respuestas no prueban hechos ni crean permiso; backend ausente permanece deshabilitado. Checkpoint.

### LEG-C16 — Hechos y alegaciones
**Objetivo:** distinguir dato, alegación, inferencia y hecho revisado. **Trabajo:** `FactAssertion` con fuente, página, autor, fecha y contradicciones; no colapsar desacuerdos. **Gate:** afirmación sin fuente o contradictoria se muestra pendiente y no se presenta como hecho certificado.

### LEG-C17 — Cronología y evidencia
**Objetivo:** construir secuencia auditable. **Trabajo:** hechos con tiempo observado/efectivo, incertidumbre, actor y anclajes; conservar orden alternativo cuando la fecha sea incierta. **Gate:** eventos sin fecha o con secuencia incompatible no se resuelven inventando un orden.

### LEG-C18 — Territorio y derecho aplicable
**Objetivo:** limitar la investigación a ámbito explícito. **Trabajo:** registrar jurisdicción, territorio, fecha relevante, órgano y cuestiones; escalar reglas de conflicto o datos incompletos. **Gate:** ámbito desconocido bloquea conclusión y no se sustituye por una jurisdicción por defecto.

### LEG-C19 — Fuentes BOE y EUR-Lex
**Objetivo:** consultar y versionar fuentes primarias pertinentes. **Trabajo:** identificar documento, versión y fecha, fuente, alcance y disponibilidad; validar derechos y uso del conector. **Gate:** fuente caída, versión histórica ausente o cobertura insuficiente produce `unknown`/`stale`, no norma supuesta.

### LEG-C20 — Resolución de citas
**Objetivo:** resolver identidad y fragmento sin confundirlo con aplicabilidad. **Trabajo:** capturar texto, resolver, autoridad y hash; separar resolución, fragmento, vigencia y pertinencia; no usar eyecite como verificador universal. **Gate:** identificador no soportado devuelve `unsupported`, nunca `valid`; revisión de fuente y jurisdicción. Checkpoint.

### LEG-C21 — Pertinencia y vigencia
**Objetivo:** evaluar la relación de una fuente con hechos y tiempo. **Trabajo:** revisar periodo efectivo, reformas, contexto y cuestión, preservando fuente contraria y límites. **Gate:** la existencia de una cita no implica vigencia o aplicabilidad; sin revisión competente el estado permanece pendiente.

### LEG-C22 — Investigación y memo
**Objetivo:** producir memo trazable con cuestiones y vacíos. **Trabajo:** asociar cada conclusión propuesta a hechos y fuentes, indicar cobertura, contraautoridad y discrepancias. **Gate:** afirmación sin soporte o fuente desactualizada se bloquea o presenta expresamente como pendiente, no como dictamen final.

### LEG-C23 — Playbooks contractuales
**Objetivo:** ordenar opciones de cláusulas por ámbito. **Trabajo:** versiones aprobadas por responsable, territorio, supuestos, riesgos y excepciones. **Gate:** una plantilla no se aplica automáticamente fuera de su ámbito; cambios de versión vuelven obsoletas propuestas afectadas.

### LEG-C24 — Generación de borradores
**Objetivo:** generar propuesta editable y reproducible. **Trabajo:** ligar variables a hechos, fuente, plantilla, versión y lagunas; conservar documentos anteriores. **Gate:** no rellenar datos críticos desconocidos ni presentar el borrador como documento firmado o asesoramiento validado.

### LEG-C25 — Redline y negociación propuesta
**Objetivo:** comparar y explicar cambios sin alterar el original. **Trabajo:** base hash, operaciones, diff estructural/semántico y revisión de anexos o formatos no soportados. **Gate:** cambio oculto, base distinta o edición concurrente bloquea aceptación; negociación vinculante queda fuera del piloto. Checkpoint.

### LEG-C26 — Riesgos y excepciones
**Objetivo:** hacer revisables los riesgos detectados. **Trabajo:** política versionada, evidencia, severidad, propietario y plazo de revisión; conservar excepciones justificadas. **Gate:** score del LLM no reemplaza evaluación; sin evidencia o responsable, riesgo permanece abierto.

### LEG-C27 — Obligaciones y responsables
**Objetivo:** asociar obligaciones propuestas a fuentes concretas. **Trabajo:** registrar cláusula, condición, responsable propuesto, alcance y aceptación humana; separar obligación de recordatorio o efecto. **Gate:** no asignar deber a persona o sistema sin fuente y revisión; los cambios de contrato invalidan vínculos obsoletos.

### LEG-C28 — Calendario de plazos
**Objetivo:** calcular solo propuestas auditables. **Trabajo:** evento probado, regla y calendario versionados, territorio, festivos, zona y paso de cómputo. **Gate:** cambio del inicio exige recálculo/revisión; entrada ausente bloquea fecha; nunca filing automático ni fecha procesal inferida por chat.

### LEG-C29 — Seguimiento normativo
**Objetivo:** señalar posibles cambios de fuentes relevantes. **Trabajo:** snapshots, versión/hash, frescura, materias afectadas y propuesta de impacto con procedencia. **Gate:** feed caído o diferencia incierta no se presenta como cobertura completa; revisión profesional decide impacto.

### LEG-C30 — Revisión competente
**Objetivo:** registrar decisión de una persona autorizada y competente. **Trabajo:** verificar identidad, cualificación pertinente, ámbito, versión, hallazgos y firma o evidencia de decisión según política. **Gate:** revisor no competente, revocado o sobre versión distinta no aprueba; modelo y avatar no sustituyen al humano. Checkpoint.

### LEG-C31 — Firma y presentación propuestas
**Objetivo:** diseñar un artefacto de propuesta sin efectos regulados. **Trabajo:** identificar acto, representación, destinatario, versión y requisitos para un futuro encargo separado. **Gate:** en el piloto no existe ruta habilitada para firmar, presentar ni representar; una aprobación de borrador no habilita efecto.

### LEG-C32 — Retención y legal hold
**Objetivo:** gestionar conservación y restricciones de forma revisable. **Trabajo:** responsable, motivo, alcance, reglas y fecha de revisión; propagar a índices, copias, proveedores y backups. **Gate:** solicitudes de supresión o exportación se evalúan con retención/hold y derechos aplicables; restore no revive acceso revocado.

### LEG-C33 — Reportes, dashboard e infografías
**Objetivo:** exponer estado y límites sin filtrar expediente. **Trabajo:** snapshots con cobertura, frescura, referencias mínimas y ACL; diferenciar pendiente, stale y revisado. **Gate:** agregado de pocos asuntos no revela información restringida; ninguna métrica afirma conformidad jurídica universal.

### LEG-C34 — Portal responsive, chat y Anam
**Objetivo:** presentar trabajo y revisión al cliente autorizado. **Trabajo:** identificar estado, procedencia, advertencias, revisión y accesibilidad; chat y presencia usan el mismo policy enforcement. **Gate:** avatar no se presenta como abogado ni aprueba; cambio de usuario/tenant cierra contexto y revalida acceso.

### LEG-C35 — SDK TypeScript, Hono y tools
**Objetivo:** integrar capacidades nominadas sin acceso genérico. **Trabajo:** SDK servidor, proxy con allowlist estricta, DTOs y tool set limitado a lo autorizado; errores sin secretos. **Gate:** ningún método libre de HTTP/SQL/shell ni aprobación o filing expuesto al modelo; compatibilidad verificada antes de publicar. Checkpoint.

### LEG-C36 — Bridge de agente y eventos
**Objetivo:** vincular especialista y padre sin modificar el repositorio padre. **Trabajo:** mapeo explícito de eventos, provenance, actor y referencias mínimas; inbox/outbox y ACK tras commit. **Gate:** duplicate delivery no duplica trabajo; no inventar enum host ni afirmar recepción sin ACK; instalar wiring requiere otro encargo.

### LEG-C37 — Cooperación y handoff empresarial
**Objetivo:** coordinar otros servicios con datos mínimos. **Trabajo:** WorkOrder, AuthorityMap, mandato, alcance, receipt y responsable único; no asumir acceso por pertenecer a la familia. **Gate:** destinatario sin permiso o hermano ausente no ve material ni inventa revisión; cambio de alcance requiere autorización.

### LEG-C38 — Modelos, coste y observabilidad
**Objetivo:** limitar uso y medir coste y calidad reales. **Trabajo:** modelo permitido por tarea/región/retención, presupuesto reservado, métricas agregadas y logs sanitizados. **Gate:** proveedor no aprobado, coste desconocido o fuga detiene la operación; no prometer precio, latencia o precisión sin medición.

### LEG-C39 — Privacidad y pruebas adversariales
**Objetivo:** comprobar límites frente a entradas y actores hostiles. **Trabajo:** BOLA entre y dentro de tenants; documentos con prompt injection, SSRF, archivos maliciosos, secretos canary, export y revocación. **Gate:** fuga o bypass crítico implica STOP; datos sintéticos únicamente y ninguna prueba planeada cuenta como ejecutada.

### LEG-C40 — Vertical E2E y fallos distribuidos
**Objetivo:** comprobar flujo sintético desde intake hasta entrega revisada. **Trabajo:** dos tenants y operador, citas, fuente obsoleta, revisión y fallo antes/después de commit; simular aceptación remota incierta donde esté autorizado. **Gate:** sin envío prohibido, sin duplicado y con `outcome_unknown` reconciliado o bloqueado; evidencias reales. Checkpoint.

### LEG-C41 — Operaciones, CI, backup y release
**Objetivo:** hacer operable y recuperable el alcance autorizado. **Trabajo:** CI reproducible, alertas sin PII, versionado, gestión de incidentes, copia cifrada y prueba de restore con restricciones reimpuestas. **Gate:** sin restore probado o dependencias críticas verificadas no se declara readiness; desactivar una feature no revierte efectos remotos.

### LEG-C42 — Aceptación, evidencia y handoff final
**Objetivo:** entregar límites y decisiones reales al owner. **Trabajo:** inventariar SHA, gates, fixtures, resultados, proveedores y licencias, costes, riesgos y responsables; separar resultados sintéticos de capacidades reales. **Gate:** aceptación explícita solo para el alcance probado; pendientes `BLOCKED`/`NOT_VERIFIED` permanecen visibles. Checkpoint final, sin convertir diseño en producto acreditado.

## 8. Plan de pruebas futuras por riesgo

Ninguna prueba de producto de esta sección se ejecutó durante la auditoría.

| Riesgo | Casos previstos | Criterio |
|---|---|---|
| Identidad y acceso | JWT inválido/caducado, tenant A/B, asuntos restringidos, mandato revocado, job y export tardíos. | Denegar antes de leer o producir efectos; mismos permisos en cada superficie. |
| Evidencia | Original alterado, OCR ambiguo, páginas omitidas, versiones concurrentes y contradicción. | Detectar cambio, conservar original y hacer visible lo incierto. |
| Citas | Identificador inexistente/no soportado, fragmento distinto, norma derogada o de otro territorio, fuente caída. | Distinguir resolución, fragmento, vigencia y pertinencia; sin conclusión automática. |
| Plazos | Inicio no probado, festivo, zona horaria, calendario obsoleto y cambio de evento. | Sin fecha final cuando falta un dato; cambio provoca recálculo y revisión. |
| Profesional | Persona sin competencia, alcance incorrecto, aprobación anterior o revocada, hash cambiado. | No avanzar a revisado o entregable aprobado. |
| Entradas hostiles | Prompt injection en documento, macro, CSV de fórmula, archivo enorme, SSRF/redirección. | Contenido no adquiere autoridad; cuarentena o rechazo según política. |
| Distribuidos | Replay, timeout tras aceptación hipotética, worker duplicado, restore con hold y revocación. | Deduplicación local, reconciliación de incertidumbre y restricciones restauradas; sin promesa de exactly-once. |
| Aislamiento de modelo | Contexto de otro asunto, búsqueda con filtros incompletos, logs y canarios. | No fuga al modelo, embeddings, métricas, informes ni destinatarios no autorizados. |

Cuando proceda, usar unitarias de cálculo, contratos, integración con versión/edición/rol reales y E2E sintético; guardar versión y evidencia. Un entorno faltante, licencia dudosa, red o cuenta no disponibles implica `NOT_VERIFIED` o `BLOCKED`, no PASS. Una prueba local no valida la API real ni una revisión profesional.

## 9. Decisiones pendientes antes de implementación

1. **Responsable y alcance:** confirmar quién es el responsable de cada tipo de encargo, territorios, materias y actos excluidos; revisar condiciones profesionales aplicables con un experto competente.
2. **Seguridad y datos:** documentar roles, finalidad, base y acceso, retención/hold, tratamiento del modelo, subencargados y respuesta a incidentes antes de usar información real.
3. **Fuentes y cobertura:** seleccionar fuentes primarias y versionado por territorio/fecha; probar disponibilidad histórica y gestionar faltantes sin inferencias.
4. **Piloto y dependencias:** optar por un camino sintético y habilitar adaptadores solo tras comprobar instalación, ACL, licencias de código y materiales asociados. No instalar todos los candidatos para aparentar cobertura.
5. **Recursos y riesgos:** presupuestar implementación, revisión y operación con mediciones, sin autorizar gasto ni fechas ficticias. Mantener un registro con dueño, mitigación, evidencia y riesgo residual.
6. **Handoff y autoridad:** mantener SHA del padre como referencia a cotejar antes de codificar; integrar mediante contratos y mandato sin cambiar `agente` ni los repositorios hermanos bajo este encargo.

## 10. Resultado de esta auditoría

La entrega actual es únicamente este informe. La revisión cubre el árbol e índice de 42 campañas y las fuentes selectivas indicadas; no una lectura exhaustiva de todas las tareas o fichas. El plan propone decisiones y gates, no certifica seguridad, cumplimiento, capacidad profesional, licencias, fuentes o integraciones. No se ejecutaron pruebas de producto, campañas, envíos ni acciones externas, y no se modificó el repositorio remoto de legal.
