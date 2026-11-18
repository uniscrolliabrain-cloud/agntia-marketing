# Informe al founder · `agntia-marketing`

## 1. Estado inicial y SHA

- Repositorio asignado: `uniscrolliabrain-cloud/agntia-marketing` (identificado por la conversación y el remoto).
- Base documental: `9285dc2`. `origin/main` avanzó a `f02f01a` durante el trabajo; se hizo merge limpio en la rama de trabajo.
- Implementación: `eeacf9d`; merge de `main`: `f26c7f5`; hardening posterior sin commit al cerrar este informe.
- Padre `agente` en `54b8d5407a8576459448c4d059a877297d18ca7a`: leído, no modificado.
- Sandbox restaurado sin `node_modules`: se reinstalaron dependencias antes del baseline.

## 2. Campañas realizadas

42 de 42 con código, pruebas y reporte de fase propio. Estado honesto:
23 DONE, 15 PARTIAL, 4 BLOCKED. Los `PARTIAL` dependen de
Postgres o de un proveedor real; los `BLOCKED` no tienen cuenta ni licencia.

## 3. Código reutilizado y código nuevo

- **Reutilizado:** contratos, arquitectura, campañas, guardrails y handoff ya presentes en el repo y en `origin/main`.
- **Nuevo:** monorepo npm workspaces con `contracts`, `core`, `adapters`, `sdk`, `apps/api`, `apps/worker`, `apps/portal`, migraciones SQL, tests y documentación de evidencia.
- **No se reescribió** ningún módulo existente ni se creó un proyecto paralelo.

## 4. Archivos y módulos finales

- `packages/contracts`: esquemas Zod, envelope, errores, capacidades.
- `packages/core`: autoridad, consentimiento, campañas, journeys, entrega/outbox, medición, presupuesto, privacidad, servicio.
- `packages/adapters`: stubs `disabled` + `SandboxEmailAdapter`.
- `packages/sdk`: 8 tools allowlist.
- `apps/api`: Hono, JWT, rate limit, rutas y portal.
- `apps/worker`: bucle de entrega sandbox.
- `db/migrations`: esquema con RLS forzada, hardening y flujo administrativo auditado (`0001`–`0006`), **ejecutados y verificados** en Postgres 16.15.
- `tests/`: 125 pruebas en 8 archivos (incluye integración contra Postgres real).
- `docs/`: baseline, diff con el padre, anexo de 42 fases y evidencia final.

## 5. Tests y resultados verificables

```
npx tsc -p tsconfig.json --noEmit   # exit 0
npx vitest run                      # 107 passed, 18 skipped (sin DB)
DATABASE_URL=… npx vitest run       # 125 passed (125), Postgres 16.15 real
tests/postgres/native_postgres.py   # 39/39 PASS, clúster nuevo (ver docs/evidence/admin-flows-20261118)
```

Smoke manual: `/healthz` 200 JSON, `/portal/` 200 HTML, `/v1/marketing/me` sin
token 401 `AUTH_REQUIRED`.

## 6. Gates superados y pendientes

84 gates del programa: 48 PASS, 36 NOT_VERIFIED. Los pendientes se
concentran en Postgres/RLS, proveedores reales, facturación y despliegue, y están
enumerados uno a uno en `docs/execution-evidence/FINAL-FREEBUFF-REPORT.md`.

## 7. Integraciones reales y simuladas

- **Real y verificado:** verificación JWT (HS256 de test) y entrega de email al sandbox local.
- **Simulado:** Mautic, Listmonk, Matomo, Plausible, PostHog, GA4, GSC, GrowthBook, Ads, Anam.
- **Ejecutado y verificado:** Postgres 16.15 real (migraciones, RLS, FK, `SKIP LOCKED`, rate limit compartido); el API aún no lo consume.

## 8. Riesgos y deuda técnica

1. Persistencia en memoria: el SQL ya está verificado, pero el API sigue en memoria y reiniciar pierde intents y auditoría. Es la campaña asignada a otro agente.
2. El aislamiento RLS está probado en SQL; falta probarlo a través del API de datos.
   **Actualización 2026-11-18:** el endpoint administrativo ya ejercita RLS a
   través del API (`tests/db/admin-api.test.ts`); el camino de datos sigue en
   memoria.
3. Rate limit: el contador compartido existe y está probado; falta despliegue multi-instancia.
4. Aprobación de journey por revisión completa, no por paso.
5. Sin firma en los ACK de handoff entre servicios.
6. CI **ejecutado** en GitHub Actions sobre `9cf035b`: `verify` y `database` en
   success, este último con `postgres:16` como servicio. Ver
   `docs/evidence/merge-20261118/`.

## 9. Preparación para Doppler

`FreeBuff/DOPPLER-READY.md`: seis variables actuales, mapa de las futuras,
rotación, permisos, arranque con `doppler run` y respuesta a incidente. Sin
valores y sin crear el proyecto: eso requiere tu autorización.

## 10. Propuesta de integración con el padre

`FreeBuff/INTEGRATION-AGENTE-PROPOSAL.md`: superficie HTTP, 31 capacidades,
twins, eventos, mandatos, dependencias, pruebas conjuntas, rollback y seis
cambios propuestos en `agente`. Ninguno aplicado.

## 11. Estado de CI y PR

- Workflow `.github/workflows/ci.yml` con install, typecheck, test y un job
  `database` con `postgres:16` como servicio.
- **Mergeado en `main`**: `9cf035b` (fast-forward desde `feat/marketing-42-campaigns`),
  con `verify` y `database` en success sobre ese SHA
  (`docs/evidence/merge-20261118/`).
- El merge lo autorizaste en el chat; no hay despliegue ni publicación.

## 12. Recomendación de siguiente paso

1. Revisar la matriz y los 84 gates; decidir qué `PARTIAL` aceptas como deuda.
2. ~~Autorizar push y PR para que la CI corra en GitHub.~~ Hecho: `9cf035b` está en
   `main` y CI pasó en GitHub.
3. Completar la persistencia del API/worker sobre el Postgres ya verificado (handoff en `FreeBuff/HANDOFF-PERSISTENCIA-Y-SCHEDULER.md`).
4. Elegir un proveedor de email real y sustituir el sandbox en staging.
5. Sólo después, valorar despliegue y conexión con `agente`.
