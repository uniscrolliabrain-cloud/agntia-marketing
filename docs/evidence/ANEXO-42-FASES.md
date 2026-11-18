> **REVISIÓN DE AUDITORÍA · 2026-11-18**  
> Los estados y las 101 pruebas aquí enumerados son **declaraciones de ejecución previas**; en esta revisión se han inspeccionado archivos de código y pruebas, pero no se ha corrido la suite ni un entorno real de Postgres/proveedores. Las 42 campañas no equivalen a 42 capacidades operativas en producción. Pendientes prioritarios: RLS real con dos tenants, JWT staging, outbox persistente, APIs externas y contrato padre. Cualquier roadmap que diga NOT_STARTED/DOCUMENTATION_ONLY está obsoleto respecto a `main`.  

# Anexo · ejecución de las 42 fases

**Fecha:** 2026-11-14 · **Rama:** `feat/marketing-42-campaigns`
**Base documental:** `9285dc2` · **Padre consultado:** `54b8d5407a8576459448c4d059a877297d18ca7a` (sin modificar)

## Resultado

| Métrica | Valor |
|---|---|
| Fases ejecutadas | 42 de 42 |
| DONE | 23 |
| PARTIAL | 15 |
| BLOCKED | 4 |
| Pruebas automatizadas | 120 (8 archivos, 13 contra Postgres real) |
| Typecheck | limpio (`tsc --noEmit`) |

`PARTIAL` no es un fallo: el código y sus pruebas existen, pero la parte que
depende de un proveedor externo, de Postgres o de un despliegue real no se ha
podido verificar en esta máquina. Se declara en vez de simularse.

## Fase por fase

| Fase | Trabajo | Estado | Tests | Archivo de prueba |
|---|---|---|---|---|
| MKT-C01 | Baseline y perímetro autorizado | DONE | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C02 | Dominio, autoridad y modelo SaaS | DONE | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C03 | Supabase JWT y principal verificado | DONE | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C04 | Twins y nomenclatura de procedencia | DONE | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C05 | Contratos tipados y validación de frontera | DONE | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C06 | Postgres, RLS y persistencia transaccional | PARTIAL | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C07 | Bases de tratamiento, supresión y preferencias | DONE | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C08 | Registro, OAuth, secretos y discovery | PARTIAL | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C09 | Datos propios y puente de relación | DONE | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C10 | Taxonomía y contrato de medición de eventos | DONE | 26 | `tests/campaigns/c01-c10.test.ts` |
| MKT-C11 | Mautic lectura y mapeo | BLOCKED | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C12 | Mautic borradores y autoridad de ejecución | PARTIAL | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C13 | Listmonk y newsletters como alternativa | PARTIAL | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C14 | Entrega email de sandbox y reputación | DONE | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C15 | Formularios y landings controladas | PARTIAL | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C16 | Marca, assets y evidencia de claims | DONE | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C17 | Investigación, brief y estrategia | DONE | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C18 | Segmentación y audiencia máxima | DONE | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C19 | Journeys y motor de campañas | PARTIAL | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C20 | Preview y aprobación vinculada | DONE | 20 | `tests/campaigns/c11-c20.test.ts` |
| MKT-C21 | Frecuencia, presupuestos y límites de contacto | DONE | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C22 | Outbox, jobs y reconciliación | DONE | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C23 | Matomo lectura y binding de propiedades | BLOCKED | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C24 | Plausible y PostHog como alternativas | BLOCKED | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C25 | GA4 y Search Console | BLOCKED | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C26 | SEO técnico y cambios web propuestos | DONE | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C27 | AEO y GEO observacional | PARTIAL | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C28 | Experimentación con GrowthBook | DONE | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C29 | Paid media lectura y descubrimiento | PARTIAL | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C30 | Ads en test accounts y borradores controlados | PARTIAL | 17 | `tests/campaigns/c21-c30.test.ts` |
| MKT-C31 | Atribución e incrementalidad admisible | DONE | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C32 | MMM Meridian y Robyn optativos | PARTIAL | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C33 | Escenarios de mix y presupuesto | DONE | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C34 | Dashboard, infografías y briefing | PARTIAL | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C35 | SDK Hono, tools y bridge del padre | DONE | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C36 | Portal responsive y sesiones Anam | PARTIAL | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C37 | Cooperación SaaS, handoffs y rotas | DONE | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C38 | Coste de servicio y observabilidad operacional | PARTIAL | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C39 | Privacidad, derechos y pruebas adversariales | DONE | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C40 | Evaluación de agentes y vertical E2E | DONE | 17 | `tests/campaigns/c31-c40.test.ts` |
| MKT-C41 | Operaciones, CI y release reversible | PARTIAL | 11 | `tests/campaigns/c41-c42.test.ts` |
| MKT-C42 | Aceptación, informe y entrega | PARTIAL | 11 | `tests/campaigns/c41-c42.test.ts` |

## Qué está implementado de verdad

- Contratos Zod estrictos, envelope v1 y errores seguros sin trazas internas.
- Principal desde JWT verificado + membership de servidor; sin fallback a owner/default.
- Capacidades nominadas con clase de efecto; ningún efecto sin aprobador humano.
- Aprobación vinculada a revisión, audiencia congelada por miembros, finalidad, canal, coste y caducidad.
- Supresión, elegibilidad fail-closed, límites de frecuencia y horas de silencio.
- FSM de campaña, outbox con fence, receipts y reconciliación sin reenvío ciego.
- Claims con evidencia, creatividades con derechos, landings con diff y publicación aprobada.
- Observaciones con missing/zero/stale, dedup de conversiones, tipos de claim separados.
- Potencia estadística, puerta de suficiencia MMM, escenarios de presupuesto sin mutar gasto.
- Auditoría SEO sobre hechos aportados, observación AEO/GEO sin promesas.
- Portal responsive mínimo, SDK con 8 tools allowlist y bridge de eventos al padre.
- Esquema Postgres con claves compuestas y RLS forzada (SQL escrito, no ejecutado).
- CI con instalación, typecheck y tests.

## Qué NO está implementado o verificado

- **Postgres real:** sin daemon Docker ni servidor; migraciones no ejecutadas. `NOT_VERIFIED`.
- **Proveedores reales:** Mautic, Listmonk, Matomo, Plausible, PostHog, GA4, Search Console, GrowthBook, Ads y Anam están deshabilitados. Un stub no verifica la API.
- **Envío de correo real:** sólo sandbox local con destinatarios `sandbox_*`.
- **Publicación de landings y anuncios:** no hay despliegue ni gasto; el techo de pruebas es 50 EUR/día y nunca se envía.
- **Journeys:** inscripción y programación por paso implementadas y probadas en memoria; falta el planificador persistente sobre Postgres. La aprobación es por revisión de journey, no por paso individual.
- **MMM:** reparto descriptivo del gasto, sin Meridian/Robyn ni ROI causal.
- **Anam:** sesión simulada; no hay video ni token real.

## Incidencias y deuda priorizada

1. Conectar el API y el worker al Postgres ya verificado (C22; asignado a otra campaña).
2. Verificar JWT RS256 contra un proyecto Supabase de staging (C03).
3. Elegir un proveedor de email real y verificar edición/licencia (C11–C14).
4. Persistir el outbox de journeys y el scheduler en Postgres, con approval por paso (C19/C22).
5. Sustituir el reparto descriptivo por un MMM validado cuando haya 52+ semanas (C32).

## Hardening 2026-11-15

Segunda pasada sobre el código ya entregado, sin rehacer campañas:

- Journeys: aprobación que congela revisión y audiencia, inscripción, intents programados y `reentry`.
- Revalidación en el instante del efecto: aprobación vigente, supresión y frecuencia.
- Horas de silencio por zona IANA en lugar de UTC.
- FSM de handoff con aceptación, rechazo y caducidad sin ACK; endpoint de conflictos.
- Rate limit por tenant y minuto; endpoints `GET /events` y `GET /conflicts`.
- 13 pruebas nuevas en `tests/campaigns/hardening.test.ts` (101 en total). `npx tsc --noEmit` limpio.

## Hardening 2026-11-18 (Postgres real y seguridad de borde)

- Postgres 16.15 real sin Docker: cuatro migraciones aplicadas y 13 pruebas de
  integración (RLS fail-closed, aislamiento, FK cross-tenant, dedupe, `SKIP LOCKED`,
  rollback, contador compartido).
- Corrección de `0002_rls.sql`: creaba policies pero fallaba por roles inexistentes.
- `0003`: scheduling de intents por paso de journey, con índice de vencimientos.
- `0004`: contador de rate limit compartido, con RLS y comprobación de tenant.
- `RateLimiter` enchufable; con `DATABASE_URL` el límite se comparte y si el backend
  falla se deniega.
- ACK de handoff firmado con HMAC (`HANDOFF_ACK_SECRET`); sin secreto no se verifica
  nada (`503 ack_signing_unconfigured`).
- Total: 120 pruebas, `tsc --noEmit` limpio.

## Revisión pendiente

Esta es la entrega para revisión. No se ha publicado nada, no se ha gastado
dinero, no se ha enviado ningún mensaje y no se ha tocado el repositorio
`agente`.
