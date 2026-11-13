# Contratos de diseño v1

No son APIs implementadas. DTOs TypeScript y validación runtime, campos desconocidos rechazados, IDs opacos, límites de texto/filas/archivos y tipos discriminados. Dinero decimal string+currency validada; fechas ISO con offset y zona IANA separada. No imponer UUID del servicio a tenantId nativo. schemaVersion del middleware no sustituye la literal string1.0 del SystemEvent padre.

## Principal y envelope

Actor se deriva del servidor: JWT Supabase verificado, usuario/membresía y permisos. Campo tenantId del envelope representa ámbito de datos; Actor.tenantId de origen se conserva en delegación. DelegationMandate nuevo referencia originatingActor/tenant, targetTenant, TwinBinding, WorkOrder, capacidades, recursos/campos, purpose, budget, vigencia, revocación y proofRef. No crea membership implícita ni permite redelegación ampliada.

```json
{"schemaVersion":1,"operationId":"opaque","tenantId":"server-resolved","actorId":"server-verified","capability":"marketing.campaign.preview","requestId":"host-if-present","correlationId":"trace","causationId":null,"idempotencyKey":"domain-key","expectedVersion":3,"approvalRef":null,"dryRun":true,"payload":{"campaignId":"opaque","revision":3}}
```

Identidad/capacidad nunca se toman como prueba desde JSON del modelo. Resultado: status, operationId, localRefs, remoteRefs mínimos, evidenceRefs, payloadHash, policyVersion, warnings, retryable, reconciliationRequired y actualScope. dryRun no muta remoto; una lectura pagada necesita autorización de presupuesto separada. Error seguro code/message/correlationId/retryable/reconciliationRequired sin tokens, PII, DSN o traceback remoto.

## DTOs propuestos del servicio

| DTO | Campos e invariantes |
|---|---|
| ServiceAgreement/WorkOrder | operator/tenant, alcance/entitlements, responsable del efecto, SLA/human coverage, presupuesto, datos/retención y aceptación |
| BrandPolicySnapshot | tenant/project, versión, identidad/tone, prohibiciones/claims, derechos y sourceRefs; no prompt mutable como autoridad |
| ContactProjection | tenantId, localId, sourceLinks[], verifiedChannelIdentityRefs, purposes/preferences y fields ACL; email no es clave global |
| EligibilityDecision | subjectRef, purpose/channel, processingBasisRef, suppressionVersion, ruleVersion, evaluatedAt, state eligible/blocked/unknown, reasonCodes/evidence |
| AudienceRule | DSL tipada, campos allowlist, finalidad/locale, versiones de fuente/regla; sin SQL o extracción de atributos sensibles |
| AudienceSnapshot | id/tenant/campaignRevision, refs/hash del máximo aprobado, eligible/excluded counts, sourceWatermark, createdAt/expiresAt y policyVersion |
| CampaignBrief | objetivo, audiencia declarada, hipótesis, oferta/claims, restricciones, canales, ventana, definición de éxito, budget/owner y fuentes |
| StrategyProposal | briefRef, escenarios/priorización, costes/supuestos, risk/blockers, modelConfigRef y evidenceRefs; no instrucción de compra |
| CreativeRevision | texto/assets/locales, destinatario tipo, derechos, ClaimRefs, disclosure, links/UTM y revisión; no envío |
| ClaimEvidence | afirmación, sujeto/alcance, fuente/licencia/fecha, support/contradicted/unverified, reviewer y vigencia |
| JourneySpec/Run | grafo/version, steps/guards, enrollment policy, schedule timezone, caps, reentry y run scope; paso no es tool libre |
| ApprovalBinding | tenant/actor humano/proofRef, revisionHash, audienceMaxHash, asset/claim/policy hashes, purpose/channel/targeting, costCeiling, expiry/revocation |
| OutboundIntent | tenant, operationKey, campaignRevision/step/subject/channel, payloadHash, approval/eligibility/budget refs, state, leaseFence, remoteRefs y reconciliationRef |
| ProviderConnection | endpointRef/secretRef backend, remote account/site/project binding, capabilityReport/version, state/revision; secreto no serializado |
| ExternalLink | tenant/connection/provider/model/externalId/localKind/localId, remoteVersion/hash/mapperVersion, lastSeenAt y syncStatus |
| Observation | sourceId, metricDefinition/version, aggregation/unit/window, occurred/observedAt, value/null, coverage, consent/config snapshot y sourceHash |
| ConversionFact | sourceObjectId, business event type, amount/currency, status/refund/cancel, dedup basis, eventTime y evidence; atribución separada |
| MeasurementClaim | descriptive/attributed/experimental/quasi_experimental/model_estimate, estimand, assumptionRefs, datasetVersion, uncertainty, limits y review |
| ExperimentSpec | unidad/asignación, hipótesis, población autorizada, métrica/guardrails, MDE/power assumptions, horizonte, análisis plan, preregisteredVersion |
| ModelRun | datasetRef/hash, método/version, parámetros/priors/seeds, diagnostics/sensitivity, compute budget, status sufficient/blocked y reviewer |
| BudgetScenario | restricciones, supuestos, spendProposal, expectedOutcomeEstimate/range, model/experiment refs; no mutation |
| ReportSnapshot | tenant/ACL, definiciones/filtros/dataset refs, métricas/claims, cobertura/freshness, artefactos/hash y generatedAt |
| AdvisorSession | Supabase principal, tenant/project/campaign scope, canónico/twin refs, capabilities, duration/budget/recording policy y expiry |

Índices únicos: (tenantId,capability,idempotencyKey), (tenantId,connectionId,model,externalId,localKind), (tenantId,connectionId,externalEventId), y (tenantId,runId,stepId,subjectRef,logicalIteration). FK compuestas impiden referencias cruzadas. audienceMaxHash liga miembros reales y reglas; un hash del SQL sin miembros no congela población. No almacenar JWT o API keys como provenance.

## API nominada futura

Todas las rutas abreviadas usan `/v1/marketing`.

| Método/ruta | Capacidad |
|---|---|
| GET /me y /integrations/{id}/capabilities | Contexto mínimo y health semántico |
| POST /briefs y /strategy-proposals | Preparación, no efecto externo |
| POST /audiences/previews y /audience-snapshots | Elegibilidad/freeze autorizados; sin export libre |
| POST /creatives y /creatives/{id}/revisions | Producción con fuentes y derechos |
| POST /campaign-previews y /campaign-intents | Preview puro; commit exige versión/key/approval |
| GET /campaign-intents/{id} y POST /{id}/pause/reconcile | Estado, pausa con semántica remota y recuperación |
| POST /journey-previews y /journey-enrollments | Simulación y enroll controlado |
| POST /landing-previews y /landing-change-proposals | Diff revisable; publicación tiene otra capacidad |
| GET /observations y /search-performance | Lecturas por fuente/campos allowlist |
| POST /experiment-proposals y /experiment-previews | Diseño/validación; asignación/activación aparte |
| POST /measurement-runs y /budget-scenarios | Jobs científicos acotados, no cambios de gasto |
| POST /ads/proposals y /ads/test-validations | Test accounts/capacidad confirmada; no lanzamiento producción |
| POST /reports y GET /reports/{id} | Snapshot tenant-scoped async |
| POST /advisor-sessions y /advisor-sessions/{id}/close | Sesión Anam desde principal/mandato |
| GET /jobs/{id}, /conflicts y /events | Estado y refs mínimas scoped |
| POST /privacy-requests | Petición verificada, no borrado inmediato por voz |

401 auth;403 capacidad;404 recurso ajeno/inexistente;409 versión/idempotencia/conflicto;422 negocio;424 dependencia/capacidad ausente si se adopta;429 límites;502 remoto inválido;503 indisponible;504 timeout.202+jobId para trabajo largo. POST /ads/proposals no acepta una URL/método ORM arbitrario ni invoice/billing endpoints. Hono y SDK allowlist exacta de métodos/rutas; no passthrough por prefijo.

## Tools y eventos

Tools iniciales: marketing_brief_read, marketing_campaign_status, marketing_audience_preview, marketing_creative_propose, marketing_metrics_read, marketing_measurement_explain, marketing_report_read, marketing_integration_health. Tenant/actor/scopes fuera del input del modelo. Send/approve/export_all/change_budget/upload_audience/admin no se exponen inicialmente; interfaces MCP/Anam usan el mismo PEP.

Eventos nuevos: marketing.brief.accepted, marketing.campaign.review_required, marketing.campaign.state_changed, marketing.effect.confirmed, marketing.effect.outcome_unknown, marketing.suppression.changed, marketing.measurement.ready, marketing.review.required. Envelope propio v1: id/tenant/actorRef/occurredAt/correlation/causation/type/payloadRefs, sin personas de listas/PII/tokens. Host bridge mapea solo a tipos nativos existentes, schemaVersion1.0, owner, emittedAt y source permitido. At-least-once con inbox/outbox/receipt, ACK posterior al commit receptor.
