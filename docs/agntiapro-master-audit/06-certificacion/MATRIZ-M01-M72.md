# Matriz de trazabilidad M01–M72

Fecha 2026-11-16. Baseline observado: `main` `1a848a49775407997a9550fbe58d27bcde222208`.
Rama de ejecución: `impl/c00-c03-market-authority-20261116`.
Fuente de producto: [CONCEPT-MASTER](../concept-master/CONCEPT-MASTER.md) §3.

Estados posibles y qué significan exactamente:

| Estado | Significado |
|---|---|
| IMPLEMENTED | Existe código de dominio y al menos un test que lo ejerce por el API o por la fachada. |
| PARTIAL | Existe una parte real y probada, pero falta una capacidad declarada del Mxx. |
| PENDING | No existe implementación. Hay campaña asignada. |
| BLOCKED | Depende de credenciales, autorización o base jurídica externa. |

Un `SIN-TEST` cuenta como PARTIAL: código sin prueba no se declara implementado.

## A · Inteligencia de mercado (C03)

| Mxx | Capacidad | Estado | Evidencia | Campaña |
|---|---|---|---|---|
| M01 | Inteligencia de empresa (producto, margen, restricciones) | PENDING | No hay perfil de empresa; el brief acepta objetivos libres | C03/C07 |
| M02 | Investigación con fuentes y calidad de evidencia | IMPLEMENTED | `packages/core/src/market.ts#registerMarketSource`, `assessEvidence`; tests `tests/market/market-intelligence.test.ts` | C03 |
| M03 | Market Reality Graph | PARTIAL | Fuentes, observaciones, competidores e ICP se persisten; no hay recorrido de grafo | C03 |
| M04 | Segmentación ICP/personas auditable | IMPLEMENTED | `IcpHypothesisSchema` + `registerIcp` con `evidenceRefs` obligatorios | C03 |
| M05 | Análisis de competidores | IMPLEMENTED | `registerCompetitor` + unicidad por dominio + aislamiento por tenant | C03 |
| M06 | Opportunity Discovery con priorización | IMPLEMENTED | `proposeOpportunity` + `rankOpportunities` (score determinista, `inputHash`) | C03 |
| M07 | Investigación de cliente (entrevistas, reviews, soporte) | PARTIAL | Sólo `audience_insight` como observación; no hay ingesta de entrevistas/reviews | C03 |
| M08 | Early signals con control de falsos positivos | PARTIAL | `marketRadar` con `staleShare`; no hay modelo de falsos positivos | C03 |
| M09 | Laboratorio de posicionamiento | PENDING | — | C04 |
| M10 | Simulación de evolución competitiva (hipotética) | PENDING | — | C07 |

## B · Marca, creatividad y contenidos (C04)

| Mxx | Capacidad | Estado | Evidencia | Campaña |
|---|---|---|---|---|
| M11 | Briefs estructurados | IMPLEMENTED | `BriefSchema` + `createBrief`/`acceptBrief` | C04 |
| M12 | Copys, landings, emails ES/EN/FR | IMPLEMENTED | `createCreative`, `proposeLanding`; locale `es/en/fr` | C04 |
| M13 | Claim Provenance Graph con caducidad | PARTIAL | `addClaim`, `checkClaims`; `validUntil` no bloquea la reutilización | C04 |
| M14 | Biblioteca de activos y derechos | PARTIAL | `assets[].rights/licenceRef` en el contrato; sin verificación de vencimiento | C04 |
| M15 | Producción multimodal | PENDING | — | C04 |
| M16 | Creative Evolution Laboratory | PENDING | — | C04 |
| M17 | Localización, accesibilidad, lectura fácil | PARTIAL | `locale` y `disclosure`; sin criterios de accesibilidad | C04 |
| M18 | Narrativas gobernadas por BrandPolicy | PENDING | No existe `BrandPolicySnapshot` | C04 |
| M19 | Optimización de contenido por calidad y derechos | PENDING | — | C04 |
| M20 | Campañas narrativas interactivas | PENDING | — | C08 |

## C · Distribución, campañas y journeys (C05)

| Mxx | Capacidad | Estado | Evidencia | Campaña |
|---|---|---|---|---|
| M21 | Planificación de campañas | PARTIAL | `createCampaign`/`previewCampaign`/`approveCampaign`; calendario y responsables limitados | C05 |
| M22 | Audiencias autorizadas por finalidad y canal | IMPLEMENTED | `evaluateEligibility`, `freezeAudience`, `assertSnapshotUsable` (caducidad + watermark) | C05 |
| M23 | Email lifecycle y journeys con caps | PARTIAL | `createJourney`/`enrollJourney`; frecuencia compartida entre journeys pendiente | C05 |
| M24 | Landings, formularios y conversiones | PARTIAL | `proposeLanding`/`publishLanding`; sin formularios ni tracking propio | C05 |
| M25 | SEO técnico y Search Console | PARTIAL | `auditSeo` sólo propone cambios; sin conector GSC | C05 |
| M26 | AEO/GEO reproducible | PARTIAL | `recordAeoObservation`; falta protocolo de muestreo versionado | C05 |
| M27 | Paid media | PARTIAL | `proposeAds` en modo `validateOnly`; sin planificación | C05 |
| M28 | Cross-channel con un único ejecutor | PARTIAL | Conflictos de handoff por efecto+recurso; prioridades de contacto pendientes | C05 |
| M29 | SMS, WhatsApp, push, redes | PENDING | Canales en el enum, sin adaptadores | C05 |
| M30 | Frequency & Fatigue Controller | IMPLEMENTED | `checkFrequency`, `setContactPolicy`, quiet hours; tests MKT-C21 | C05 |
| M31 | Budget & Effect Governor (pacing, stop-loss) | PARTIAL | Techo por aprobación (`costCeiling`); sin pacing ni stop-loss | C05 |
| M32 | Orquestación dinámica bajo incertidumbre | PENDING | — | C05 |

## D · Ciencia de medición (C06)

| Mxx | Capacidad | Estado | Evidencia | Campaña |
|---|---|---|---|---|
| M33 | Catálogo de métricas | IMPLEMENTED | `ObservationSchema` (versión, agregación, unidad, cobertura) + `ingestObservation` | C06 |
| M34 | Analítica descriptiva y conciliación | PARTIAL | `summariseObservations`, `ingestConversion` con dedup; sin job de conciliación | C06 |
| M35 | Atribución descriptiva | PARTIAL | `createMeasurementClaim` con `kind: attributed`; sin reglas de atribución | C06 |
| M36 | Experimentos A/B con potencia | PARTIAL | `proposeExperiment`, `sampleSizePerArm`; sin asignación | C06 |
| M37 | Holdouts y experimentos geográficos | PENDING | — | C06 |
| M38 | Incrementalidad y lift | PARTIAL | Contrato de claim experimental; sin estimador | C06 |
| M39 | MMM (Meridian/Robyn/PyMC) | PARTIAL | `runMmm` con guarda de idoneidad; no ejecuta modelos reales | C06 |
| M40 | Measurement Claim Contract | IMPLEMENTED | `createMeasurementClaim` con niveles E0–E5 y límites | C06 |
| M41 | Measurement Suitability Gate | IMPLEMENTED | `runMmm` devuelve `not_identifiable` sin muestra | C06 |
| M42 | Learning Ledger | PENDING | — | C06 |
| M43 | CLV, cohortes y retención | PENDING | — | C06 |
| M44 | Impacto económico unificado con Finanzas | PENDING | — | C07 |

## E · Planificación económica (C07)

| Mxx | Capacidad | Estado | Evidencia | Campaña |
|---|---|---|---|---|
| M45 | Presupuestos y escenarios por canal | IMPLEMENTED | `buildBudgetScenario` con supuestos obligatorios | C07 |
| M46 | Curvas de respuesta y saturación | PENDING | — | C07 |
| M47 | Marketing Digital Twin | PENDING | — | C07 |
| M48 | Optimización con restricciones | PENDING | — | C07 |
| M49 | Frontera de Pareto | PENDING | — | C07 |
| M50 | Escalado, pausa y redistribución | PARTIAL | `pauseCampaign`; redistribución y coste de oportunidad pendientes | C07 |
| M51 | Exploración/explotación contextual | PENDING | — | C07 |
| M52 | Puente con previsión de caja | PENDING | — | C07 |

## F · Experiencia agéntica (C08)

| Mxx | Capacidad | Estado | Evidencia | Campaña |
|---|---|---|---|---|
| M53 | Twin especialista ligado al padre | PARTIAL | `registerTwin`, `TwinBinding` con SHA del padre; sin LAIA | C08 |
| M54 | Chat asesor con briefs y aprobaciones | PARTIAL | `advisor-sessions` con grabación desactivada y humano obligatorio | C08 |
| M55 | Growth Office con roles | PENDING | — | C08 |
| M56 | Briefing periódico | PENDING | — | C08 |
| M57 | Campaign Studio | PARTIAL | `apps/portal/public/index.html` + estados de campaña y diff de landing | C08 |
| M58 | Experiment Lab | PENDING | — | C06/C08 |
| M59 | Market Radar y Observatory | PARTIAL | `GET /v1/marketing/market/radar` con frescura por tema | C03 |
| M60 | Conversación multimodal y Anam | BLOCKED | Proveedor `anam` declarado; requiere credenciales y autorización del fundador | C08 |
| M61 | Report Factory reproducible | PARTIAL | `generateReport` con hash, definiciones y caducidad | C08 |
| M62 | Human-in-the-loop review queue | PARTIAL | Aprobaciones vinculadas por hash; cola única pendiente | C08 |
| M63 | Decision Memory | PENDING | — | C08 |

## G · Plataforma y ecosistema (C01, C02, C09)

| Mxx | Capacidad | Estado | Evidencia | Campaña |
|---|---|---|---|---|
| M64 | Tenant isolation, ACL, consentimiento, auditoría | IMPLEMENTED | Lecturas tenant-scoped, `db/migrations/0002_rls.sql` (RLS forzada), `auditLog`, módulo de privacidad | C01 |
| M65 | AuthorityMap entre dominios | IMPLEMENTED | `packages/contracts/src/authority-map.ts`, `packages/core/src/authority-map.ts`, `GET /v1/marketing/authority`; tests M65 | C01 |
| M66 | Conectores con discovery y sandbox | PARTIAL | `registerConnection` + `integrationCapabilities` + allowlist de sandbox | C09 |
| M67 | Audience Authorization Snapshot | IMPLEMENTED | `freezeAudience` + caducidad + `membersHash` | C01 |
| M68 | Outbox, idempotencia, receipts, unknown | IMPLEMENTED | `delivery.ts` (lease/fence/receipt/reconcile) + idempotencia en `authority.ts` | C02 |
| M69 | Data Provenance & Measurement Graph | PARTIAL | `sourceRefs`, hashes y `inputHash` de ranking; grafo consultable pendiente | C09 |
| M70 | Gobernanza de modelos | PENDING | — | C09 |
| M71 | Librería sectorial | PENDING | — | C08 |
| M72 | Inteligencia de tendencias entre empresas | BLOCKED | Requiere base jurídica y agregación privada verificada | C09 |

## Recuento al cierre de esta ejecución

| Estado | Capacidades |
|---|---|
| IMPLEMENTED | 16 |
| PARTIAL | 28 |
| PENDING | 26 |
| BLOCKED | 2 |
| **Total** | **72** |

Cambios respecto al baseline documental anterior: M02, M04, M05, M06 y M65 pasan de `PENDING` a `IMPLEMENTED`; M59 y M69 pasan de `PENDING` a `PARTIAL`. El resto conserva su estado. El script `scripts/verify-matrix.mjs` comprueba en CI que hay 72 filas, que los estados son válidos y que el recuento coincide.
