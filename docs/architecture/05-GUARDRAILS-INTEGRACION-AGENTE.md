# GUARDRAILS DE INTEGRACIÓN AGNTIAPRO ↔ AGNTIA MARKETING

> **Versión 0.1 — 2026-11-13 — DRAFT / REVISIÓN PARCIAL DEL CÓDIGO.** Documento normativo propuesto para agentes implementadores. No implica pruebas ejecutadas ni auditoría exhaustiva.

## 00. Propósito y jerarquía de evidencia

Este documento es el guardarraíl de integración para implementadores de agntia-marketing. Estado: **DRAFT / AUDITORÍA PARCIAL**, no certificación completa del padre. Fecha 2026-11-13. Fuentes: `uniscrolliabrain-cloud/agente` y `uniscrolliabrain-cloud/agntia-marketing`, rama main observada; el conector de búsqueda devolvió rutas del commit padre `54b8d5407a8576459448c4d059a877297d18ca7a`. Antes de programar, fijar SHA actual y comparar diffs. Prioridad: (1) código y pruebas ejecutadas al SHA fijado, (2) contratos y tests leídos, (3) documentación vigente, (4) propuestas. No confundir lectura con ejecución. Cada regla se etiqueta **OBSERVADO**, **DISEÑO** o **PENDIENTE**. Un cambio de SHA invalida verificaciones afectadas.

## 01. Fuentes efectivamente consultadas

Padre: `README.md`, `package.json`, `apps/server/src/app.ts` (lectura parcial), `apps/server/src/engine/tenant.ts` (parcial), `apps/server/src/engine/agents/personas/registry.ts`, `packages/domain/src/actor.ts`, `apps/server/src/engine/assignments/adapters/approval-adapter.ts`, `docs/estado/KNOWN_ISSUES.md`; búsquedas de código sobre tenancy, kernel, SOP, approvals, tests, CI. Marketing: `README.md`, `docs/01-producto-y-limites.md`, `docs/02-investigacion-y-decisiones.md`, `docs/03-referentes-y-brechas.md`, `docs/04-repos-y-adaptadores.md`, `docs/architecture/01-arquitectura.md`, `docs/campaigns/README.md`, `docs/release/INFORME-AL-OWNER.md`, `docs/07-servicio-y-operacion.md`, `docs/08-presupuestos.md`. **No se ha inspeccionado exhaustivamente el monorepo ni ejecutado tests**. El resto de archivos listados más adelante son objetivos de auditoría, no evidencia ya revisada.

## 02. Reglas de repositorio y propiedad

**DISEÑO / MUST**: no modificar `/agente` desde campañas de Marketing. No copiar kernel, scheduler, memoria global, identidad ni políticas del padre. Cualquier cambio imprescindible del padre requiere propuesta de contrato, PR independiente y aprobación humana. No escribir sobre main sin autorización explícita. Una rama por unidad de trabajo, superficies de escritura exclusivas y diffs acotados. No editar lockfiles sin justificación; no regenerar contratos canónicos manualmente. No copiar secretos, .env, datos personales o tokens a documentación, fixtures, logs o commits. Antes de editar: registrar SHA base, owner de ficheros, dependencias, rollback y criterio de aceptación. Después: registrar diff, test y riesgo residual.

## 03. Stack y compatibilidad

**OBSERVADO**: `package.json` padre declara `pnpm@11.19.0`, Node `>=22.6.0`, `hono ^4.11.4`, `zod ^4.1.0`, TypeScript `~5.9.2`; scripts `typecheck`, `test`, `gate`, `verify:slice`, `audit:contracts`, `audit:idempotency`, `audit:tenant-default`, `audit:layers`, `audit:bridges`, `secrets:check`. **DISEÑO**: Marketing fijará sus versiones propias y verificará compatibilidad de DTO en ambas direcciones; no presumir que comparten base de datos ni dependencias instaladas. El bridge será HTTP/eventos/SDK tipado con versión de esquema, no importaciones relativas al código interno del padre en producción.

## 04. Identidad, agentes y twins

**OBSERVADO**: `packages/domain/src/actor.ts` define Actor humano/agente, con `tenantId`; el agente usa `runtimeId` obligatorio, `roleId`, `personaId` opcional, `kernelTurnId` opcional; `agentActor()` usa runtimeId o actorId como fallback. **OBSERVADO**: `PersonaRegistry` indexa por tenant/persona; `canStartWork()` bloquea persona desconocida, deshabilitada, sin humano asignado o sin SOP permitida. **DISEÑO / MUST**: twin = proyección de una identidad canónica con binding versionado, mandato, scopes, TTL y revocación; no nueva persona soberana. Nunca derivar permisos de nombre, prompt, avatar o rol textual. Distinguir actor de origen, tenant del cliente, usuario delegante, runtime y contexto del trabajo. Revalidar permisos en cada efecto. Rechazar bindings huérfanos, expirados o ambiguos.

## 05. Tenancy, membresía y datos

**OBSERVADO**: el padre usa `TenantService`, `TenantScopedStore`, `currentTenantScope` y `runInTenantScope`; el código de tenant diferencia resolución cacheada y `findMembership()` de lectura fresca para permisos, contempla suspensión de tenant y revocación. `app.ts` observado construye Files/Rag/Workspace sobre `tdb`; un documento antiguo de incidencias afirma lo contrario. **DISEÑO / MUST**: resolver siempre identidad y membresía en frontera confiable, nunca desde body/header sin verificación. En Marketing imponer RLS y filtros de tenant en SQL, jobs, búsqueda, archivos, caches, exports, métricas, eventos, webhooks y AV. Cada prueba negativa debe demostrar que tenant A no puede leer, ejecutar, buscar, exportar ni inferir recursos de B. Nunca reutilizar un JWT de operador como acceso irrestricto al cliente. Los contactos importados no son usuarios ni miembros del SaaS.

## 06. Autorización y mandatos entre repos

**DISEÑO / MUST**: contrato de mandato explícito `issuerTenantId`, `subjectActorId`, `targetTenantId`, `resourceScopes`, `allowedCapabilities`, `purpose`, `expiresAt`, `revocationVersion`, `correlationId` y firma/validación servidor-servidor. No aceptar un `tenantId` libre como delegación. PEP del servidor y worker vuelve a evaluar autorización; el LLM solo propone. Deny-by-default ante permisos desconocidos, módulos ausentes, clock skew excesivo, token inválido o cambio de membresía. El portal externo no adquiere permisos del operador por utilizar el mismo servicio. Auditoría de quién pidió, quién autorizó y quién ejecutó.

## 07. Separación de responsabilidades

**DISEÑO / MUST**: padre custodia identidades canónicas, orquestación empresarial, memoria general y rota; Marketing custodia brief, campaña, audiencias autorizadas, propuestas, medición especializada y sus estados técnicos. AuthorityMap/Effect Ownership Map define un único dueño por tipo de efecto y canal. Redes publica si tiene mandato; Marketing no duplica publicación. Ventas acepta oportunidades, no se crean leads aceptados automáticamente a partir de investigación. Branding valida claims/derechos; Finanzas autoriza presupuesto real. Todo handoff lleva offer/ack/correlation/receipt; falta de ACK no equivale a éxito. No disparar dos proveedores para la misma operación tras timeout.

## 08. Contratos API y esquema

**DISEÑO / MUST**: DTO Zod versionados, discriminated unions, validación de entrada y salida, `schemaVersion`, `tenantId`, `actorId`, `workOrderId`, `correlationId`, `causationId`, `idempotencyKey`, `occurredAt`, `provenance`. Versionar breaking changes; compatibilidad N/N-1 probada con fixtures. No aceptar objetos arbitrarios SQL/HTTP/method/tool enviados por el modelo. Publicar OpenAPI o JSON Schema generado, matrices productor-consumidor, fixtures de errores 400/401/403/404/409/422/429/5xx y semántica de reintentos. Firmar webhooks y rechazar replay; rotar claves sin downtime. Los eventos deben ser append-only y no alterar el pasado.

## 09. SOPs, tareas y scheduler

**OBSERVADO POR DOC/CÓDIGO BUSCADO**: el padre dispone de SOPExecutor, tareas durables, leases, CAS, checkpoint, retries y dead-letter; verificar rutas y firmas exactas antes de conectar. **DISEÑO / MUST**: Marketing no crea un segundo scheduler empresarial. Jobs técnicos propios solo manejan campañas, timers, polling y reconciliación. Una WorkOrder se vincula a tarea canónica; cada step tiene estado persistente y versión. Nunca ejecutar una SOP fuera del conjunto autorizado para actor/tenant. En timeout o crash, recuperar desde checkpoint, no repetir efectos a ciegas. Bloquear ciclos, escalada de privilegios y profundidad sin límite. Un timer no equivale a autorización comercial.

## 10. Aprobaciones y efectos

**OBSERVADO**: `approval-adapter.ts` mapea `awaiting_review`, `scheduled`, `executing`, `succeeded`, `failed`, `outcome_unknown`, `denied`, `cancelled`, `expired`. **DISEÑO / MUST**: aprobación humana firma hash del contenido, audiencia máxima, propósito, canal, coste máximo, ventana temporal, marca y versiones. Cambiar cualquiera invalida la aprobación. Revalidar estado antes del envío y en cada step. No autoaprobar por agente, prompt, rol, API key o callback. `outcome_unknown` exige reconciliación, no retry con nueva key. Cancelación corta nuevos efectos; registrar explícitamente si un proveedor ya aceptó el anterior. `approved` no significa `delivered` ni `converted`.

## 11. Audiencias, privacidad y cumplimiento

**DISEÑO / MUST**: registrar fuente, base de tratamiento, finalidad, jurisdicción, fecha, evidencia de preferencia y supresiones por persona/canal. La investigación de una web pública no autoriza marketing directo. Congelar máximo de audiencia aprobado; las bajas posteriores restan, altas nuevas requieren nueva aprobación. Aplicar supresión fresca antes de cada efecto. Minimizar datos en prompts, embeddings, archivos, analítica, logs y herramientas. No entrenar modelos globales con datos de clientes por defecto. Retención, acceso, rectificación, oposición, export y borrado deben tener procedimientos comprobables; revisar RGPD/ePrivacy/LSSI por caso, no prometer cumplimiento automático. Nunca inferir atributos sensibles para segmentación.

## 12. Proveedores y conectores

**DISEÑO / MUST**: puertos nominados por capacidad, versión, entorno, región, scopes, rate limit, costes, circuit breaker y estado `NOT_CONFIGURED/UNVERIFIED/VERIFIED/BLOCKED`. No confundir docs leídas con API probada. Mautic/listmonk: validar destinatarios, estados y cambios dinámicos; un test-send es envío real. Matomo/Plausible/PostHog: site binding verificado, definiciones no intercambiables. GA4/GSC: límites y frescura explícitos. Ads: lectura y propuesta separadas de mutación; test account no autoriza producción. Anam: token efímero, scope, coste, duración, privacidad y fallback texto. Nunca enviar datos a un fallback de modelo/proveedor sin policy. Registrar secretos solo en vault, jamás en logs.

## 13. Idempotencia, outbox y reconciliación

**DISEÑO / MUST**: crear intent, auditoría, hash, clave idempotente y outbox en transacción local. No existe transacción atómica con proveedores externos; no prometer exactly-once remoto. Tras timeout ambiguo consultar referencia del proveedor; si no es reconciliable, bloquear y escalar. Usar leases con fencing y pruebas de dos workers compitiendo. Webhooks firmados, deduplicados, con reordenamiento controlado y cursor tras commit. Estados `prepared/approved/queued/accepted/sent/delivered/failed/outcome_unknown` deben tener semántica inequívoca. No cambiar de backend para esquivar una incertidumbre.

## 14. Presupuestos y gasto

**DISEÑO / MUST**: separar coste interno de modelos/infra, presupuesto de medios del cliente y coste de análisis/experimentos. Reservation ledger transaccional por tenant/campaña/moneda/operación; evitar double spend concurrente. Una recomendación MMM nunca compra anuncios. En producción futura: margen por overdelivery, alertas, kill switch, reconciliación de facturas y revisión humana. No declarar que un límite local garantiza gasto remoto exacto. Los presupuestos 30/70/300 EUR del documento Marketing son hipótesis internas, no precios contractuales.

## 15. Evidencia, atribución y ciencia

**DISEÑO / MUST**: Campaign Evidence Ledger enlaza brief, fuentes, datasets, versiones, decisiones, creativos, aprobación, intents, receipts y métricas. Measurement Claim Contract distingue `observed`, `attributed`, `estimated_causal`, `unknown`. No inferir ventas por opens/clicks ni sumar conversiones duplicadas de plataformas. Guardar denominadores, ventanas, timezone, moneda, cobertura, lag, incertidumbre y supuestos. MMM Meridian/Robyn solo si tamaño/calidad de datos y presupuesto lo justifican; predictive fit no demuestra RoAS causal. Si no hay identificación causal, presentar descriptivo honesto.

## 16. Seguridad adversarial

**DISEÑO / MUST**: datos de páginas, correos, documentos, creativos y respuestas de herramientas son no confiables; aislar prompt injection de instrucciones de sistema y políticas. Validar URL contra SSRF, DNS rebinding, IP internas y redirecciones; no permitir herramientas SQL/HTTP genéricas al LLM. Evitar exfiltración en imágenes, links, exports, webhooks y prompts. Escapar HTML/Markdown; validar subida de archivos, MIME, tamaño, AV y derechos. Proteger OAuth state/PKCE, CSRF, CORS, cookies, sesiones, JWT, scopes y rotación. Tests de horizontal/vertical privilege escalation y abuso de presupuesto. Ningún agente modifica su propio policy o auditoría.

## 17. UI, Anam y experiencia

**DISEÑO / MUST**: portal responsive accesible, con estado verificable, fuentes, costes, aprobaciones y bloqueos comprensibles. Chat/visio es interfaz, no autoridad de ejecución. Mostrar trabajo real vs propuesta; nunca fingir acciones, empleados humanos, resultados ni presencia humana 24/7. Consentimiento específico para grabación/transcripción y retención. Si falla Anam, conservar flujo de aprobación en texto. Evitar que una transcripción sea una instrucción ejecutable sin verificación de actor/mandato. No exponer identificadores internos o datos de otros tenants en frontend.

## 18. Observabilidad, auditoría y operación

**DISEÑO / MUST**: logs estructurados con correlationId/tenantId seudonimizado, actionId, runId, estado, latencia, coste, retry y outcome; nunca secretos/PII en bruto. Métricas por conector, tenant, campaña y paso; cardinalidad controlada. Trazas de propuesta→policy→approval→outbox→provider→receipt→measurement. Alertas por RLS denegada, duplicados, outcome_unknown, gasto, latencia, backlog, expiración de token y entregabilidad. Runbook de incidentes, pausa global/tenant/campaña, restore y rotación. Auditoría append-only con integridad verificable; backups cifrados y restauración ensayada.

## 19. Tests obligatorios

**DISEÑO / MUST**: unitarios de Zod/FSM/policy; integración DB/RLS; contract tests con padre; E2E dos tenants y dos usuarios; negativa cross-tenant en API, jobs, search, AV, files y export; pruebas de revocación entre aprobación y dispatch; duplicados concurrentes; timeout tras aceptación remota; webhooks duplicados/desordenados; rollback de migración; supresiones tardías; coste concurrente; prompt injection; fallo de proveedor; recovery de workers; prueba de claims de medición; no-spend en piloto. Usar fixtures sintéticos identificados; prohibido atribuirles resultados reales. Evidencia por test: comando, SHA, entorno, fecha, salida y exit code. Skipped ≠ passed. No reducir gates para conseguir verde.

## 20. Gates y CI

**OBSERVADO**: scripts del padre incluyen `pnpm typecheck`, `pnpm test`, `pnpm gate`, `pnpm verify:slice`, `pnpm audit:contracts`, `pnpm audit:idempotency`, `pnpm audit:layers`, `pnpm audit:bridges`. **DISEÑO**: implementar equivalentes de Marketing; CI debe bloquear merges ante gates críticos. No afirmar que dichos comandos pasan hoy: no ejecutados en esta auditoría. Antes de PR: clean install, typecheck, lint, tests, build, audit seguridad, scan secrets, contrato padre, migración up/down y E2E mínimo. Reportar baseline preexistente separado de regresiones nuevas con pruebas reproducibles.

## 21. Protocolo de campaña para agentes de código

Cada campaña entrega: objetivo, SHA de ambos repos, rutas exactas de lectura, archivos permitidos, contratos, dependencias, plan, patchsets pequeños, tests positivos/negativos, amenazas, migraciones, rollback, métricas, aceptación y riesgos. Un solo writer por superficie; revisor independiente; no modificar padre por comodidad. Antes de cada patchset comprobar contenido/anchors; tras cada patchset diff + test focalizado. No añadir `any`, casts dobles o `@ts-ignore` para silenciar errores sin justificación y prueba. No ocultar errores con catch vacío. No marcar PASS por documentación. El supervisor entrega informe con commits, pruebas ejecutadas y decisiones pendientes.

## 22. Inconsistencias y bloqueos detectados

**OBSERVADO**: `docs/estado/KNOWN_ISSUES.md` padre relata Files/Rag/Workspace usando `db` sin scope; el `app.ts` consultado los instancia con `tdb`. Resolver con SHA y test, no propagar la incidencia como hecho actual. **OBSERVADO**: README padre describe fases de multitenancy pendientes y ~165 fallos históricos, mientras scripts y código incluyen piezas posteriores; README no es evidencia de estado actual. **OBSERVADO**: Marketing declara 42 campañas/294 tareas/84 escenarios todos sin ejecutar. **PENDIENTE**: comprobar estado real de CI, RLS, auth, eventos, kernel, approvals, worker, memorias, puente, schema del catálogo de agentes, contratos de Google y permisos cross-service. No afirmar que una superficie es segura por leer solo su nombre.

## 23. Matriz de auditoría pendiente del padre

Inspeccionar y citar SHA/líneas: `apps/server/src/tenant-principal.ts`, `tenant-scope.ts`, `db-tenant.ts`, `db-rls.ts`, `auth.ts`, `auth-routes.ts`, `actions.ts`, `engine/authz/pdp.ts`, `engine/policy/engine.ts`, `engine/sop-executor.ts`, `engine/service.ts`, `engine/worker.ts`, `engine/events/index.ts`, `kernel/kernel.ts`, `kernel/personas-bootstrap.ts`, `engine/agents/personas/routes.ts`, `packages/domain/src/agent-persona.ts`, `packages/domain/src/sop.ts`, `packages/domain/src/assignment.ts`, `packages/domain/src/plan.ts`, `packages/domain/src/index.ts`, `packages/integrations/**`, `apps/web/src/**`, `.github/workflows/ci.yml`, tests de tenancy, approvals, idempotencia y E2E. Verificar cada ruta antes de usarla: inventario sujeto a cambios. Construir tabla de compatibilidad de tipos y endpoints, nunca inferirlos por nombre.

## 24. Contratos mínimos propuestos

Definir y validar antes de C03/C04: `TwinBindingV1` (canonicalAgentId, personaId?, runtimeId?, tenantId, mandateId, expiresAt, version); `MarketingWorkOrderV1` (tenant, actor, objetivo, datos permitidos, deliverables, budget, policy); `CampaignBriefV1`; `AudienceAuthorizationSnapshotV1`; `OutboundIntentV1`; `EffectReceiptV1`; `MarketingEventV1`; `MeasurementClaimV1`; `BudgetReservationV1`. Campos y nombres son **propuesta**, no schemas existentes del padre. Diseñar mapeo con types reales tras inspección. Mantener compatibilidad retroactiva y pruebas de roundtrip, nulabilidad, timezones, límites y errores.

## 25. Criterio de aceptación y política de stop

STOP si hay lectura cruzada, actor sin mandato, aprobación mutable, doble envío, outcome incierto reintentado, gasto sin autorización, secreto expuesto, cambios silenciosos de audiencia, pérdida de audit, contrato no verificado o test crítico fallido. STOP si no se puede distinguir test sandbox de producción. Aceptación P0: dos tenants aislados; usuario/twin válidos; brief con evidencia; audiencia/supresión; creativo; preview; aprobación ligada a hash; envío a sink; receipt; dashboard con fuente; replay seguro; revocación efectiva; backup/restore; CI reproducible. Todo lo demás feature-flag OFF hasta validación explícita.

## 26. Procedimiento de actualización

Antes de cada nueva campaña: fijar SHA padre y Marketing, comprobar diffs en rutas relevantes, revisar incidencias resueltas/abiertas, actualizar matriz de contratos y ejecutar tests de compatibilidad. Marcar cada regla `VERIFIED_CODE`, `VERIFIED_TEST`, `DOC_ONLY`, `PROPOSED` o `STALE`. Conservar decisiones en ADRs. Ninguna regla aquí sustituye auditoría continua, pruebas de seguridad ni asesoramiento jurídico. Este documento es versión inicial extensa y requiere una segunda pasada de lectura de código completo antes de presentarse como fuente definitiva.

## Referencias navegables

- [Padre](https://github.com/uniscrolliabrain-cloud/agente)
- [Marketing](https://github.com/uniscrolliabrain-cloud/agntia-marketing)
- [Código padre: actor](https://github.com/uniscrolliabrain-cloud/agente/blob/main/packages/domain/src/actor.ts)
- [Código padre: registro de personas](https://github.com/uniscrolliabrain-cloud/agente/blob/main/apps/server/src/engine/agents/personas/registry.ts)
- [Código padre: app](https://github.com/uniscrolliabrain-cloud/agente/blob/main/apps/server/src/app.ts)
- [Plan Marketing](https://github.com/uniscrolliabrain-cloud/agntia-marketing/blob/main/docs/campaigns/README.md)
