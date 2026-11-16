# Patchsets de C01
Todos los archivos de salida indicados como NUEVO son propuestas sujetas a comprobación de conflictos. Base main 1a848a4. Cada PS exige revisión de diff y commit propio.

## PS-C01-W01-P01 — Contrato y fixtures
Precondición: wave anterior aprobado o fixture aislado; lectura de baseline y ownership obligatoria. Leer apps/api/src/auth.ts, apps/api/src/app.ts, db/migrations/0002_rls.sql, docs/contracts/01-contratos.md. CREAR `packages/contracts/src/autoridad-contratos.schema.ts` si no existe equivalente; schemas Zod request/result/error, versionado y validación strict. MODIFICAR manifiesto package.json/exports únicamente tras localizar entrypoint existente. Pruebas: valid, missing tenant, unknown schema, malformed input. Gate: schema importable, no dependencias circulares.
Rollback: revertir patchset/flag; preservar receipts y auditoría. Reporte: SHA, archivos, comando, exit code, evidencia, bloqueos, siguiente PS.


## PS-C01-W01-P02 — Threat model y ownership
Precondición: wave anterior aprobado o fixture aislado; lectura de baseline y ownership obligatoria. Leer `apps/api/src/auth.ts`, `docs/05-seguridad-privacidad.md`. CREAR `docs/decisions/C01-authority.md`; identificar quién firma cada efecto y qué datos nunca llegan al LLM. No alterar permisos del padre. Gate: deny-by-default probado mediante fixtures.
Rollback: revertir patchset/flag; preservar receipts y auditoría. Reporte: SHA, archivos, comando, exit code, evidencia, bloqueos, siguiente PS.


## PS-C01-W02-P01 — Dominio y repositorio
Precondición: wave anterior aprobado o fixture aislado; lectura de baseline y ownership obligatoria. CREAR `packages/core/src/autoridad-contratos.ts` y `packages/core/src/autoridad-contratos.repository.ts` solo tras buscar equivalentes. Funciones puras de validación, transición de estado, versionado y provenance. Extender migraciones con archivo nuevo secuencial verificado, índices tenant y tests rollback. Gate: dos tenants aislados, transición inválida rechazada.
Rollback: revertir patchset/flag; preservar receipts y auditoría. Reporte: SHA, archivos, comando, exit code, evidencia, bloqueos, siguiente PS.


## PS-C01-W02-P02 — Transacciones y recuperación
Precondición: wave anterior aprobado o fixture aislado; lectura de baseline y ownership obligatoria. Integrar transacción de negocio + outbox para efectos; claves de idempotencia, fencing de worker y estados pending/accepted/unknown/reconciled. No reintentar unknown hasta consultar receipt. Gate: duplicado y crash sin doble efecto.
Rollback: revertir patchset/flag; preservar receipts y auditoría. Reporte: SHA, archivos, comando, exit code, evidencia, bloqueos, siguiente PS.


## PS-C01-W03-P01 — API y wiring
Precondición: wave anterior aprobado o fixture aislado; lectura de baseline y ownership obligatoria. MODIFICAR `apps/api/src/app.ts` tras inspeccionar router real; registrar capability y policy, DI del servicio y repositorio, error mapping, correlationId, rate limit y health. Si no existe registry central, crearlo como propuesta versionada. Gate: E2E request→authz→domain→store→result.
Rollback: revertir patchset/flag; preservar receipts y auditoría. Reporte: SHA, archivos, comando, exit code, evidencia, bloqueos, siguiente PS.


## PS-C01-W03-P02 — Worker y adaptadores
Precondición: wave anterior aprobado o fixture aislado; lectura de baseline y ownership obligatoria. MODIFICAR `apps/worker/src/worker.ts` solo si el dominio tiene efectos. Adaptador de proveedor sandbox con allowlist, timeout, retries bounded, circuit breaker, receipt y DLQ; feature flag apagado por defecto. Gate: proveedor caído produce estado observable sin false success.
Rollback: revertir patchset/flag; preservar receipts y auditoría. Reporte: SHA, archivos, comando, exit code, evidencia, bloqueos, siguiente PS.


## PS-C01-W04-P01 — Certificación y telemetría
Precondición: wave anterior aprobado o fixture aislado; lectura de baseline y ownership obligatoria. CREAR `tests/autoridad-contratos.test.ts` y fixtures; pruebas unitarias, integración con DB efímera, contrato, E2E, cross-tenant, approval absent, cancellation, replay, timeout, proveedor fallido, métricas p95/coste. MODIFICAR CI solo tras leer `.github/workflows/ci.yml`. Gate: npm run typecheck y npm test ejecutados y registrados.
Rollback: revertir patchset/flag; preservar receipts y auditoría. Reporte: SHA, archivos, comando, exit code, evidencia, bloqueos, siguiente PS.


## PS-C01-W04-P02 — Reporte, rollback y handoff
Precondición: wave anterior aprobado o fixture aislado; lectura de baseline y ownership obligatoria. Registrar commit SHAs, comandos, resultados, diffs, nuevas dependencias, licencia, coste, riesgos, migración y rollback. Actualizar matriz M64,M65, estado de gates y handoff de campaña siguiente. Gate: evidencia enlazada y sin secretos.
Rollback: revertir patchset/flag; preservar receipts y auditoría. Reporte: SHA, archivos, comando, exit code, evidencia, bloqueos, siguiente PS.
