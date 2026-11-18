# Propuesta de integración con `agente` · `agntia-marketing`

Documento de propuesta. **No se ha modificado el repositorio padre.** Cualquier
cambio en `agente` (§8) requiere aprobación del founder y del owner del kernel.

## 1. Superficie expuesta

API HTTP (Hono) bajo `/v1/marketing`, envelope v1 con `status`, `operationId`,
`correlationId`, `localRefs`, `remoteRefs`, `evidenceRefs`, `payloadHash`,
`policyVersion`, `warnings`, `retryable`, `reconciliationRequired`,
`actualScope` y `payload`.

| Grupo | Rutas |
|---|---|
| Contexto | `GET /me`, `GET /health` |
| Brief y estrategia | `POST /briefs`, `POST /briefs/:id/accept`, `POST /briefs/:id/strategy-proposals` |
| Audiencia | `POST /audiences/previews`, `POST /audience-snapshots` |
| Creatividades y claims | `POST /creatives`, `POST /claims`, `POST /measurement-claims` |
| Campañas | `POST /campaign-previews`, `POST /campaigns`, `GET /campaigns/:id`, `POST /campaigns/:id/approve`, `POST /campaigns/:id/commit`, `POST /campaigns/:id/pause`, `POST /campaigns/:id/reconcile`, `GET /campaigns/:id/delivery` |
| Journeys | `POST /journeys`, `POST /journeys/:id/preview`, `POST /journeys/:id/approve`, `POST /journeys/:id/enrollments`, `GET /journeys/:id/enrollments` |
| Landings | `POST /landing-previews`, `POST /landing-change-proposals/:id/publish` |
| Medición | `POST /observations`, `POST /conversions`, `POST /reports`, `GET /reports/:id`, `POST /budget-scenarios`, `POST /measurement-runs`, `POST /experiment-proposals`, `POST /seo-audits`, `POST /aeo-observations`, `POST /search-performance` |
| Ads | `POST /ads/proposals` |
| Privacidad y cooperación | `POST /privacy-requests`, `POST /privacy-requests/:id/fulfil`, `POST /handoffs`, `POST /handoffs/:id/respond`, `POST /handoffs/expire`, `GET /conflicts`, `GET /events` |
| Asesor | `POST /advisor-sessions`, `POST /advisor-sessions/:id/close` |
| Integraciones | `POST /integrations`, `GET /integrations`, `GET /integrations/:id/capabilities` |
| Worker interno | `POST /internal/deliver` (sandbox) |
| Portal | `GET /portal/` |

El SDK (`packages/sdk`) expone 8 tools allowlist; ningún tool permite HTTP, SQL
o shell genéricos.

## 2. Capacidades y clases de efecto

30 capacidades nominadas en `EFFECT_CLASS`:

- **read:** `context.read`, `integration.read`, `brief.read`, `audience.preview`,
  `campaign.preview`, `journey.preview`, `landing.preview`, `observation.read`,
  `report.read`, `job.read`.
- **prepare:** `connection.admin`, `brief.write`, `strategy.propose`,
  `audience.snapshot`, `creative.write`, `landing.propose`, `experiment.propose`,
  `measurement.run`, `budget.scenario`, `ads.propose`, `report.write`,
  `advisor.session`.
- **effect:** `campaign.commit`, `campaign.pause`, `campaign.reconcile`,
  `journey.enroll`, `landing.publish`, `ads.validate`, `privacy.request`.

Todo `effect` exige humano con rol owner/operator y aprobación previa vinculada
(`revisionHash`, `audienceMaxHash`, finalidad, canal, techo de coste, caducidad).

## 3. Identidad, tenants y twins

- Principal derivado de JWT verificado (Supabase) + membership de servidor; sin
  fallback a owner por defecto ni al tenant del body.
- El `tenantId` del token manda; un recurso de otro tenant responde `NOT_FOUND`.
- Twin registrado con `canonicalAgentSha` del padre: el nombre "marketing" no
  concede capability; sin registro válido no hay envío autorizado.
- Aislamiento probado con dos tenants y tokens distintos en la suite.

## 4. Eventos y trazabilidad

- `GET /events` devuelve eventos del tenant (máx. 200) con tipo, fecha y
  referencias; sin PII de audiencia.
- Cada mutación genera `operationId` y `correlationId`; el audit registra actor,
  acción y detalle por tenant.
- Handoffs: `proposed → accepted | rejected | conflict`, con caducidad por falta
  de ACK a las 24 h por defecto (`POST /handoffs/expire`).
- Un resultado incierto queda `reconciliationRequired` y exige evidencia; no hay
  reenvío ciego.

## 5. Mandatos y aprobaciones

- Aprobación ligada a revisión, hash de audiencia congelada, finalidad, canal,
  techo de coste y caducidad.
- Revocar o dejar caducar la aprobación cancela los intents pendientes
  (`approval_expired`), cubierto por pruebas.
- Cambiar pasos de un journey o la audiencia exige nueva aprobación.
- El techo de gasto en pruebas es 50 EUR/día y no se muta ninguna plataforma.

## 6. Dependencias de infraestructura

| Dependencia | Estado | Integración propuesta |
|---|---|---|
| JWT Supabase | HS256 verificado; RS256 sin probar | El padre emite/valida el mismo issuer; marketing sólo verifica |
| Postgres + RLS | Ejecutado y verificado en 16.15 (API/worker aún en memoria) | Base por tenant, `tenant_id` en toda tabla, políticas RLS |
| Outbox | En memoria | Tabla `outbound_intents` con `FOR UPDATE SKIP LOCKED` y fence |
| Bus de eventos | Inexistente | Publicar eventos al bus del padre con `correlationId` |
| Anam | Stub | Token de sesión emitido por el padre, no por marketing |

## 7. Pruebas de integración recomendadas al padre

1. Padre → marketing: `POST /campaign-previews` con JWT del tenant; verificar que
   el envelope no incluye listas ni datos de otro tenant.
2. Marketing → padre: handoff `emit_event` aceptado; sin ACK caduca y no se
   contabiliza como éxito.
3. Revocación: retirar membership en el padre con intent en cola; el siguiente
   `lease` no produce efecto.
4. Twins: un twin sin capability declarada no puede preparar envío.
5. Idempotencia: mismo `Idempotency-Key` devuelve el mismo `operationId`.

## 8. Cambios propuestos en el padre (no aplicados)

1. Registrar `marketing` como servicio especialista con sus 30 capacidades y
   clases de efecto en el mapa de autoridad del kernel.
2. Definir el contrato de handoff entrante/saliente con ACK firmado y TTL.
3. Aceptar el hash de audiencia congelada como prueba de no ampliación, o
   exponer un snapshot federado.
4. Añadir al bus el evento `marketing.intent.settled` con `correlationId`.
5. Acordar el `canonicalAgentSha` de marketing en el registro de twins.
6. Definir la propiedad del secreto de proveedor: marketing guarda referencias,
   el gestor del padre guarda valores.

## 9. Rollback

1. Poner la capacidad (o el flag de fase) en `disabled` y detener nuevos efectos;
   no se borran receipts, intents ni audit.
2. Dejar el outbox en pausa: los intents quedan `queued` sin lease.
3. Revertir el merge en el padre sin tocar datos; reaplicar supresiones antes de
   reactivar el worker.
4. Un efecto remoto sin ACK queda incierto: se reconcilia con evidencia, nunca se
   reintenta a ciegas.
