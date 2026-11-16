# C03 — plan constructivo
## Valor y problema
Construir Market Reality Graph, fuentes, ICP, competidores, oportunidades y radar. El Concept Master es autoridad de producto; no confundir diseño con código ejecutado. Se debe conservar el runtime determinista, tenants, aprobaciones y derechos de audiencia.
## Baseline y lecturas obligatorias
- Ruta verificada en main o documento de referencia: `docs/concept-master/CONCEPT-MASTER.md`
- Ruta verificada en main o documento de referencia: `docs/campaigns/17-investigacion-brief-y-estrategia.md`
Código a reutilizar si ya existe: `apps/api/src/app.ts`, `apps/worker/src/worker.ts`, `db/migrations/0001_schema.sql`; comprobar el árbol antes de cambiarlo. Nuevos paths son PROPUESTOS, no existentes.
## Arquitectura
Input autenticado → PEP y AuthorityMap → Zod schema → dominio puro → repositorio tenant-scoped → outbox → worker idempotente → adaptador allowlisted → receipt → auditoría/evento → UI o consumidor agente. En operaciones solo lectura, omitir outbox pero conservar authz y evidencia.
## Contratos
Request versionado con tenant derivado del token, actor verificado, resource, purpose, capability, correlationId, idempotencyKey, deadline y approvalRef si hay efectos. Result discriminado success/denied/failed/unknown con evidenceRef. No enviar secretos ni PII al bus. Invalidación de aprobación si cambia hash de payload, audiencia, gasto o canal.
## Datos y migraciones
Definir tablas tenant-scoped con primary key, version, created_at, updated_at, source_refs, status, índices tenant+status y unicidad tenant+idempotency_key; migración reversible, RLS FORCED cuando proceda y test con roles de app. No ejecutar DDL fuera de entorno efímero autorizado.
## Entorno y proveedores
No agregar secretos sin necesidad. Nombres candidatos según dominio: DATABASE_URL, SUPABASE_JWKS_URL, SUPABASE_ISSUER, SUPABASE_AUDIENCE, MARKETING_PROVIDER_MODE, MARKETING_SANDBOX_ALLOWLIST, MARKETING_EFFECTS_ENABLED. Confirmar nombres reales antes de introducirlos; nunca volcar valores. Seleccionar dependencias por licencia, versión fijada, seguridad, soporte y coste; preferir TS/Zod ya presentes.
## Waves
W01 evidencia, schemas y fixtures; W02 dominio y persistencia; W03 API, workers y adaptadores; W04 tests, observabilidad y rollback. Cada wave tiene patchsets PS-C03-Wyy-Pzz en [PATCHSETS](PATCHSETS.md).
## Gates
Entrada: SHA congelado, ownership de archivos y contratos identificados. Salida: provenance, freshness, uncertainty y ranking; typecheck, tests negativos, replay y documentación actualizada. Bloqueado si requiere credenciales o autorización humana. Rollback: feature flag off, detener worker, revert commit y reconciliar efectos desconocidos; jamás reenviar a ciegas.
## Riesgos y handoff
Riesgos: fuga entre tenants, duplicación de efectos, claims no probados, PII, coste y dependencia de contratos V2 aún no aprobados. Próximo paquete según grafo. Reportar PASS/FAIL/BLOCKED con evidencia, no suponer certificación.
