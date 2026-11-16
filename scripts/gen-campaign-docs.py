#!/usr/bin/env python3
"""Genera los documentos que faltaban en C04–C09 del programa maestro.

No es un generador de plantillas vacías: cada campaña aporta su objetivo,
exclusiones, archivos objetivo reales, rutas de API y criterios de seguridad.

Uso: python3 scripts/gen-campaign-docs.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "docs" / "agntiapro-master-audit" / "05-campanas"

C = {
    "C04-creatividad-y-claims": dict(
        caps="M11–M20",
        title="Claim provenance, asset licensing, multimodal review",
        objective="Cerrar la gobernanza creativa: cada claim con fuente y caducidad, cada activo con derechos verificables y una cola de revisión humana para lo que el sistema no puede decidir solo.",
        existing=[
            "`packages/core/src/campaigns.ts` — `addClaim`, `checkClaims`, `createCreative` (reutilizar).",
            "`packages/contracts/src/domain.ts` — `ClaimEvidenceSchema`, `CreativeRevisionSchema` (extender, no duplicar).",
            "`db/migrations/0001_schema.sql` — tablas `claims`, `creatives`.",
        ],
        gaps=[
            "`CreativeRevisionSchema.assets[].licenceRef` es nullable y nadie comprueba su vigencia al reutilizar el activo.",
            "`ClaimEvidenceSchema.support` no invalidita el creativo cuando el claim caduca o pasa a `contradicted`.",
            "No existe cola de revisión multimodal: imagen/vídeo se tratan como texto.",
        ],
        files_new=[
            "`packages/core/src/creative-governance.ts` — vigencia de derechos, caducidad de claims, cola de revisión.",
            "`packages/contracts/src/creative-governance.schema.ts` — `AssetRightSchema`, `ClaimReviewRequestSchema`.",
            "`db/migrations/0004_creative_governance.sql` — `asset_rights`, `claim_reviews` con RLS forzada.",
            "`tests/creative/creative-governance.test.ts`.",
        ],
        files_mod=[
            "`packages/core/src/campaigns.ts` — `createCreative` llama a la nueva verificación de derechos y claims.",
            "`apps/api/src/app.ts` — rutas `POST /v1/marketing/asset-rights`, `GET /v1/marketing/claim-reviews`.",
            "`packages/core/src/index.ts`, `packages/contracts/src/index.ts`.",
        ],
        api=[
            "`POST /v1/marketing/asset-rights` (capability `marketing.creative.write`).",
            "`GET /v1/marketing/claim-reviews` (`marketing.brief.read`).",
            "`POST /v1/marketing/claim-reviews/:id/decide` (`marketing.creative.write`, humano obligatorio).",
        ],
        exclusions=[
            "No se descargan activos de terceros ni se ejecutan generadores de imagen.",
            "No se publica nada: la campaña sigue terminando en aprobación humana.",
        ],
        security=[
            "Un activo con derechos caducados bloquea el creativo (409), no se degrada el aviso.",
            "El revisor humano se toma del principal verificado; no se acepta `reviewer` del cuerpo.",
        ],
        gate="Un creativo con activo sin derechos o claim contradicho no se puede aprobar; tests negativos en verde.",
        tests=[
            "activo con derechos caducados → 409 `asset_rights_expired`",
            "claim `contradicted` → creativo bloqueado",
            "claim sin fuente → 403 `claim_source_required`",
            "dos tenants no comparten derechos de activo",
            "decisión de revisión duplicada → 409",
        ],
    ),
    "C05-campanas-y-journeys": dict(
        caps="M21–M32",
        title="Audience snapshot, journey FSM, budget, outbox",
        objective="Convertir el outbox actual en un runtime de journeys real: reentrada, presupuesto por campaña, supresión en el instante del despacho y deduplicación entre journeys.",
        existing=[
            "`packages/core/src/delivery.ts` — leasing con fence, `deliverIntent`, `reconcileIntent`.",
            "`packages/core/src/consent.ts` — `freezeAudience`, `checkFrequency`, `evaluateEligibility`.",
            "`packages/core/src/campaigns.ts` — `createJourney`, `enrollJourney`, `previewJourney`.",
            "`apps/worker/src/worker.ts` — worker de outbox.",
        ],
        gaps=[
            "Un contacto enrolado en dos journeys puede recibir dos envíos en la misma ventana.",
            "`JourneyRecord.reentry` existe pero no se evalúa al re-enrolar.",
            "El presupuesto de campaña (`CampaignBudgetRecord`) no se consume al despachar: no hay techo efectivo.",
        ],
        files_new=[
            "`packages/core/src/journey-runtime.ts` — planificador de pasos, reentrada y ventana compartida.",
            "`packages/contracts/src/journey-runtime.schema.ts` — `JourneyEnrollmentRequestSchema`, `BudgetReservationSchema`.",
            "`db/migrations/0005_journey_runtime.sql` — `journey_runs`, `budget_reservations`.",
            "`tests/journey/journey-runtime.test.ts`.",
        ],
        files_mod=[
            "`packages/core/src/delivery.ts` — reserva de presupuesto antes de confirmar intent.",
            "`packages/core/src/campaigns.ts` — `enrollJourney` consulta reentrada y frecuencia global.",
            "`apps/api/src/app.ts` — `POST /v1/marketing/journeys/:id/runs`, `GET /v1/marketing/campaigns/:id/budget`.",
        ],
        api=[
            "`POST /v1/marketing/journeys/:id/runs` (`marketing.journey.enroll`, effect, humano).",
            "`GET /v1/marketing/campaigns/:id/budget` (`marketing.campaign.preview`).",
        ],
        exclusions=[
            "No se añaden canales nuevos ni conectores reales.",
            "No se envía nada fuera del adaptador sandbox existente.",
        ],
        security=[
            "La revocación de consentimiento entre preview y dispatch debe suprimir el intent (ya cubierto en C07; se re-verifica aquí por journey).",
            "El techo de presupuesto se reserva en transacción con el intent: nunca se excede por concurrencia.",
        ],
        gate="Dos journeys no duplican contacto y el presupuesto no se excede con dos workers concurrentes.",
        tests=[
            "doble enrolamiento en ventana → segundo intent suprimido",
            "reentrada `never` → 409",
            "dos workers concurrentes no exceden el techo",
            "contacto suprimido entre preview y run → no se encola",
        ],
    ),
    "C06-medicion-y-experimentos": dict(
        caps="M33–M44",
        title="Metric definitions, attribution, holdouts, suitability gate",
        objective="Pasar de métricas descriptivas a inferencia defendible: asignación persistente, dedup de conversiones, reglas de parada y declaración explícita de no identificabilidad.",
        existing=[
            "`packages/core/src/measurement.ts` — `ingestObservation`, `ingestConversion`, `proposeExperiment`, `sampleSizePerArm`, `runMmm`, `generateReport`.",
            "`packages/contracts/src/domain.ts` — `ObservationSchema`, `ConversionFactSchema`, `ExperimentSpecSchema`.",
        ],
        gaps=[
            "No hay asignación persistente ni holdout: el experimento se propone pero no se ejecuta.",
            "`ingestConversion` deduplica por clave, pero no trata eventos fuera de orden.",
            "No existe evaluación de idoneidad previa al MMM más allá de la guarda actual.",
        ],
        files_new=[
            "`packages/core/src/experiments.ts` — asignación determinista, exposición, análisis con intervalos.",
            "`packages/contracts/src/experiments.schema.ts` — `AssignmentSchema`, `ExperimentResultSchema`, `SuitabilityReportSchema`.",
            "`db/migrations/0006_experiments.sql` — `assignments`, `exposures`, `experiment_results`.",
            "`tests/measurement/experiments.test.ts`.",
        ],
        files_mod=[
            "`packages/core/src/measurement.ts` — `proposeExperiment` persiste y `runMmm` exige `SuitabilityReport`.",
            "`apps/api/src/app.ts` — `POST /v1/marketing/experiments/:id/assign`, `POST /v1/marketing/experiments/:id/analyse`.",
        ],
        api=[
            "`POST /v1/marketing/experiments/:id/assign` (`marketing.measurement.run`).",
            "`POST /v1/marketing/experiments/:id/analyse` (`marketing.measurement.run`).",
            "`GET /v1/marketing/experiments/:id/suitability` (`marketing.observation.read`).",
        ],
        exclusions=[
            "No se implementa CUPED ni tests secuenciales bayesianos en esta campaña: quedan como patchsets posteriores con datos reales.",
            "No se declara significación sin intervalo ni tamaño de muestra alcanzado.",
        ],
        security=[
            "La asignación usa hash del sujeto + semilla del experimento: reproducible y sin estado compartido.",
            "El resultado declara `not_identifiable` en lugar de inventar lift cuando faltan datos.",
        ],
        gate="Asignación estable y reproducible; conversión duplicada no infla el resultado; MMM sin datos devuelve NOT_IDENTIFIABLE.",
        tests=[
            "mismo sujeto → siempre el mismo brazo",
            "conversión repetida → una sola fila contabilizada",
            "evento fuera de orden no reabre un resultado cerrado",
            "sin muestra → `not_identifiable`",
        ],
    ),
    "C07-economia-y-optimizacion": dict(
        caps="M45–M52",
        title="Budget scenarios, Pareto and finance bridge",
        objective="Pasar de un escenario de reparto a decisiones económicas defendibles: restricciones de caja y capacidad, frontera de Pareto y handoff explícito a Finanzas.",
        existing=[
            "`packages/core/src/measurement.ts` — `buildBudgetScenario`, `runMmm`.",
            "`packages/contracts/src/domain.ts` — `BudgetScenarioSchema`.",
            "`packages/core/src/service.ts` — `proposeHandoff` hacia otros dominios.",
        ],
        gaps=[
            "El escenario reparte porcentajes, pero no respeta saturación por canal ni capacidad comercial.",
            "No se distingue ROAS atribuido de iROAS ni margen incremental.",
            "No hay frontera de Pareto: se devuelve una sola propuesta.",
        ],
        files_new=[
            "`packages/core/src/economics.ts` — restricciones, saturación, frontera de Pareto, sensibilidad.",
            "`packages/contracts/src/economics.schema.ts` — `BudgetConstraintSchema`, `ParetoPointSchema`, `FinanceBridgeSchema`.",
            "`db/migrations/0007_economics.sql` — `budget_scenarios`, `decision_cases`.",
            "`tests/economics/economics.test.ts`.",
        ],
        files_mod=[
            "`packages/core/src/measurement.ts` — `buildBudgetScenario` delega en el nuevo módulo.",
            "`apps/api/src/app.ts` — `POST /v1/marketing/budget/pareto`, `POST /v1/marketing/finance-handoffs`.",
        ],
        api=[
            "`POST /v1/marketing/budget/pareto` (`marketing.budget.scenario`).",
            "`POST /v1/marketing/finance-handoffs` (`marketing.campaign.preview`, handoff a `finanzas`).",
        ],
        exclusions=[
            "No se ejecuta gasto real ni se conecta a un motor financiero: la frontera es una propuesta revisable.",
            "No se duplica el motor de Finanzas; se le entrega una propuesta con supuestos.",
        ],
        security=[
            "Un escenario sin supuestos declarados es inválido (422).",
            "El handoff a Finanzas no puede declarar `ownerService: marketing` (AuthorityMap M65).",
        ],
        gate="Toda recomendación muestra supuestos, rango y coste de oportunidad; ninguna supera las restricciones declaradas.",
        tests=[
            "restricción de caja violada → 409",
            "frontera con dos puntos y orden estable",
            "escenario sin supuestos → 422",
            "handoff a finanzas con dueño marketing → 409",
        ],
    ),
    "C08-growth-office": dict(
        caps="M53–M63",
        title="Workspaces, agent tools, LAIA, Anam and reports",
        objective="Dar al owner una capa de decisión: briefing reproducible, cola de revisión humana, memoria de decisiones y tools nominadas para el twin, sin ampliar la autoridad del LLM.",
        existing=[
            "`packages/core/src/service.ts` — salud, coste, handoffs, privacidad.",
            "`apps/api/src/app.ts` — `advisor-sessions`, `reports`, `health`, `jobs`.",
            "`packages/sdk/src/tools.ts` — tools nominadas del bridge.",
            "`apps/portal/public/index.html` — portal estático.",
        ],
        gaps=[
            "No existe briefing periódico con fuentes y caducidad.",
            "No hay cola única de revisión: claims, gastos y envíos viven en sitios distintos.",
            "No hay Decision Memory que registre qué se decidió y qué ocurrió.",
        ],
        files_new=[
            "`packages/core/src/growth-office.ts` — briefing, review queue, decision memory.",
            "`packages/contracts/src/growth-office.schema.ts` — `BriefingSchema`, `ReviewItemSchema`, `DecisionRecordSchema`.",
            "`db/migrations/0008_growth_office.sql` — `briefings`, `review_items`, `decision_records`.",
            "`apps/portal/public/workspaces/` — vistas de Growth Office sobre la API existente.",
            "`tests/growth-office/growth-office.test.ts`.",
        ],
        files_mod=[
            "`apps/api/src/app.ts` — `GET /v1/marketing/briefings/:period`, `GET /v1/marketing/review-queue`, `POST /v1/marketing/decisions`.",
            "`packages/sdk/src/tools.ts` — tools `marketing.report.generate` y `marketing.measurement.explain` sobre las rutas nuevas.",
        ],
        api=[
            "`GET /v1/marketing/briefings/:period` (`marketing.report.read`).",
            "`GET /v1/marketing/review-queue` (`marketing.brief.read`).",
            "`POST /v1/marketing/decisions` (`marketing.strategy.propose`, humano).",
        ],
        exclusions=[
            "Anam/voz no se integra: requiere credenciales y autorización del fundador (BLOCKED).",
            "El twin no recibe tools nuevas con efecto; todas son lectura o preparación.",
        ],
        security=[
            "El briefing nunca incluye identificadores de audiencia ni PII.",
            "La aprobación sigue siendo humana: una decisión registrada no ejecuta efectos.",
        ],
        gate="Briefing reproducible por hash; review queue sin duplicados; ninguna tool nueva con clase `effect`.",
        tests=[
            "briefing con fuentes y sin PII",
            "misma petición → mismo hash",
            "cola de revisión agrupa sin duplicar",
            "tool con efecto propuesta → rechazada en el registro",
        ],
    ),
    "C09-certificacion-e-integracion": dict(
        caps="M66, M69–M72",
        title="Cross-repo contracts, security, operations and certification",
        objective="Certificar lo construido: contratos cruzados con `agente`, linaje de métricas, gobernanza de modelos y operación con gates medibles.",
        existing=[
            "`docs/agntiapro-master-audit/07-handoffs/INTEGRATION-HANDOFF.md`.",
            "`docs/architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md`.",
            "`db/migrations/0002_rls.sql` — RLS forzada.",
            "`packages/contracts/src/events.ts` — `PARENT_EVENT_MAP` (allowlist).",
        ],
        gaps=[
            "No hay tests de contrato ejecutables contra el padre: sólo documentación.",
            "No existe grafo de procedencia métrica→claim→decisión.",
            "La gobernanza de modelos (versión, drift, rollback) no está registrada.",
        ],
        files_new=[
            "`tests/contracts/parent-contract.test.ts` — validación de envelope y eventos contra fixtures versionados.",
            "`packages/core/src/provenance.ts` — grafo de linaje de métricas y claims.",
            "`packages/contracts/src/provenance.schema.ts`.",
            "`db/migrations/0009_provenance.sql`.",
            "`docs/agntiapro-master-audit/06-certificacion/ACCEPTANCE-MATRIX.md`.",
        ],
        files_mod=[
            "`docs/agntiapro-master-audit/06-certificacion/*` — gates con evidencia medida.",
            "`.github/workflows/ci.yml` — typecheck + tests + verificación de matriz.",
        ],
        api=[
            "`GET /v1/marketing/provenance/:metric` (`marketing.observation.read`).",
        ],
        exclusions=[
            "La integración real con `agente` queda BLOCKED hasta que el padre publique contratos y se autorice la prueba cruzada.",
            "M72 (inteligencia de tendencias entre empresas) queda BLOCKED: requiere base jurídica y agregación privada verificada.",
        ],
        security=[
            "Ningún fixture de contrato contiene secretos ni PII.",
            "Los gates distinguen DOCUMENTADO / IMPLEMENTADO / TESTEADO / INTEGRADO / CERTIFICADO.",
        ],
        gate="CI ejecuta typecheck y tests; la matriz de aceptación enlaza evidencia por capacidad.",
        tests=[
            "envelope inválido rechazado por schema",
            "evento no allowlisted no se emite",
            "linaje completo métrica→claim",
            "matriz sin filas vacías",
        ],
    ),
}


def patchsets(name: str, d: dict) -> str:
    cap = d["caps"]
    lines = [
        f"# Patchsets de {name.split('-')[0]}",
        "",
        f"Capacidades del Concept Master: **{cap}**. Estado del paquete: PROPUESTO.",
        "Cada PS es atómico, con su propio commit y su propia evidencia; ninguno declara PASS sin ejecutar.",
        "",
        f"## PS-{name.split('-')[0]}-W01-P01 — Contratos, fixtures y matriz de trazabilidad",
        "",
        f"Objetivo: congelar los contratos de «{d['title']}» antes de escribir dominio.",
        "",
        "Precondiciones: baseline `main` `1a848a4` verificado; `npm ci` ejecutado; typecheck y tests en verde.",
        "",
        "Lecturas obligatorias:",
    ]
    lines += [f"- {x}" for x in d["existing"]]
    lines += [
        "",
        "Archivos a CREAR:",
        f"- {d['files_new'][1]}",
        "",
        "Criterios de aceptación:",
        "- Los schemas son `strict()`, versionados y sin campos de identidad (`tenantId`, `actorId`) aportados por el cliente.",
        "- Cada regla negativa del `TEST-PLAN.md` tiene su schema o su validación prevista.",
        "- No se duplica ningún tipo ya existente en `packages/contracts/src/domain.ts`.",
        "",
        "Gate: los schemas importan sin ciclos y el typecheck pasa.",
        "",
        f"## PS-{name.split('-')[0]}-W02-P01 — Dominio y persistencia",
        "",
        f"Objetivo: implementar el dominio puro de «{d['title']}» y su persistencia tenant-scoped.",
        "",
        "Brechas que resuelve:",
    ]
    lines += [f"- {g}" for g in d["gaps"]]
    lines += [
        "",
        "Archivos a CREAR:",
        f"- {d['files_new'][0]}",
        f"- {d['files_new'][2]}",
        "",
        "Archivos a MODIFICAR:",
    ]
    lines += [f"- {x}" for x in d["files_mod"]]
    lines += [
        "",
        "Reglas de datos: `tenant_id` en toda tabla, clave primaria compuesta, índice `(tenant_id, status)` y unicidad por clave de idempotencia cuando aplique. Migración reversible con `drop table` documentado.",
        "",
        "Gate: dos tenants aislados y una transición inválida rechazada, probado por test.",
        "",
        f"## PS-{name.split('-')[0]}-W03-P01 — API, worker y wiring",
        "",
        "Objetivo: conectar el dominio al servicio real, sin dejar componentes huérfanos.",
        "",
        "Rutas:",
    ]
    lines += [f"- {a}" for a in d["api"]]
    lines += [
        "",
        "Wiring obligatorio: import en `packages/core/src/index.ts`, registro de la capability en `packages/contracts/src/envelope.ts` y en `EFFECT_CLASS` de `packages/core/src/authority.ts`, ruta en `apps/api/src/app.ts` y caso en el SDK si aplica.",
        "",
        "Seguridad: PEP deny-by-default en cada ruta; `mutate` para escrituras (idempotencia obligatoria) y `read` para lecturas; errores mediante `MarketingError` sin filtrar detalles internos.",
        "",
        "Gate: E2E petición→authz→dominio→store→resultado con correlationId.",
        "",
        f"## PS-{name.split('-')[0]}-W04-P01 — Tests, telemetría y gates",
        "",
        "Objetivo: demostrar el comportamiento, incluido lo que debe fallar.",
        "",
        f"Archivo de test: {d['files_new'][3]}",
        "",
        "Casos exigidos:",
    ]
    lines += [f"- {t}" for t in d["tests"]]
    lines += [
        "",
        "Comandos: `npm run typecheck` y `npm test`. Registrar exit code, duración y SHA en el `EXECUTION-REPORT.md`.",
        "",
        "Gate: " + d["gate"],
        "",
        f"## PS-{name.split('-')[0]}-W05-P01 — Reporte, rollback y handoff",
        "",
        "Objetivo: dejar evidencia reproducible y la campaña siguiente desbloqueada.",
        "",
        "Archivos a MODIFICAR:",
        "- `docs/agntiapro-master-audit/05-campanas/" + name + "/EXECUTION-REPORT.md`",
        "- `docs/agntiapro-master-audit/06-certificacion/MATRIZ-M01-M72.md`",
        "",
        "Rollback: apagar la ruta con flag, revertir el commit del PS, conservar receipts y reconciliar cualquier estado `unknown` antes de reintentar.",
        "",
        "Gate: evidencia enlazada, sin secretos y con SHA final.",
        "",
    ]
    return "\n".join(lines)


def test_plan(name: str, d: dict) -> str:
    cap = name.split("-")[0]
    lines = [
        f"# Test plan {cap} — NO EJECUTADO",
        "",
        f"Capacidades: **{d['caps']}**. Requiere fixtures de dos tenants, roles `owner`/`viewer`/bot y proveedor fake. No usa cuentas reales.",
        "",
        "| # | Caso | Resultado esperado |",
        "|---|---|---|",
    ]
    base = [
        ("request válido", "respuesta tipada con `correlationId` y `policyVersion`"),
        ("payload malformado", "422 `INVALID` con detalle de campo"),
        ("sin token", "401 `AUTH_REQUIRED`"),
        ("actor sin membership", "403 `FORBIDDEN`"),
        ("tenant B sobre recurso de A", "no existe: 404 o lista vacía, nunca datos de A"),
        ("`idempotencyKey` repetida con mismo payload", "mismo `operationId`, sin segundo efecto"),
        ("`idempotencyKey` repetida con payload distinto", "409 `CONFLICT`"),
        ("bot en operación de clase `effect`", "403 `effect_requires_human`"),
    ]
    for i, (case, expected) in enumerate(base + [(t, "según contrato del PS") for t in d["tests"]], start=1):
        lines.append(f"| T{i:02d} | {case} | {expected} |")
    lines += [
        "",
        "Comandos declarados en `package.json`: `npm run typecheck`, `npm test`.",
        "",
        "Criterio de salida: " + d["gate"],
        "",
        "Un mock no es integración real: ningún caso de este plan cuenta como certificación frente a proveedores.",
        "",
    ]
    return "\n".join(lines)


def readme(name: str, d: dict) -> str:
    return "\n".join(
        [
            f"# {name}",
            "",
            f"Capacidades Concept Master: **{d['caps']}**.",
            "Estado: PROPUESTO (documentación completa; ejecución pendiente de dependencias).",
            "",
            "| Documento | Contenido |",
            "|---|---|",
            "| [CAMPANA.md](CAMPANA.md) | Objetivo, waves, contratos, gates y rollback |",
            "| [PATCHSETS.md](PATCHSETS.md) | Patchsets atómicos con archivos, wiring y pruebas |",
            "| [TEST-PLAN.md](TEST-PLAN.md) | Matriz de casos y criterio de salida |",
            "| [EXECUTION-REPORT.md](EXECUTION-REPORT.md) | Plantilla de evidencia (no ejecutada) |",
            "",
            "## Dependencias",
            "",
            "Consulta `../../04-roadmap/ROADMAP-MAESTRO.md`. Esta campaña no puede empezar antes de que sus predecesoras estén en verde.",
            "",
            "## Por qué existe",
            "",
            d["objective"],
            "",
            "## Fuera de alcance",
            "",
        ]
        + [f"- {x}" for x in d["exclusions"]]
        + [
            "",
            "## Reglas de seguridad",
            "",
        ]
        + [f"- {x}" for x in d["security"]]
        + [""]
    )


def report(name: str, d: dict) -> str:
    cap = name.split("-")[0]
    return "\n".join(
        [
            f"# {cap} — EXECUTION REPORT",
            "",
            "**ESTADO: NO EJECUTADO.** Plantilla preparada por C00; no contiene resultados inventados.",
            "",
            "Fecha UTC: PENDIENTE. Rama de implementación: PENDIENTE. SHA base: PENDIENTE. SHA final: PENDIENTE.",
            "",
            "| Wave | Patchsets | Estado | Tests / exit code | Evidencia | Incidencias |",
            "|---|---|---|---|---|---|",
            "| W01 | P01 | NOT_STARTED | — | — | — |",
            "| W02 | P01 | NOT_STARTED | — | — | — |",
            "| W03 | P01 | NOT_STARTED | — | — | — |",
            "| W04 | P01 | NOT_STARTED | — | — | — |",
            "| W05 | P01 | NOT_STARTED | — | — | — |",
            "",
            "## Archivos previstos",
            "",
        ]
        + [f"- NUEVO: {x}" for x in d["files_new"]]
        + [f"- MODIFICADO: {x}" for x in d["files_mod"]]
        + [
            "",
            "## Comandos a registrar",
            "",
            "```bash",
            "npm ci",
            "npm run typecheck   # exit code",
            "npm test            # exit code, número de tests",
            "```",
            "",
            "## Bloqueos conocidos",
            "",
        ]
        + [f"- {x}" for x in d["exclusions"]]
        + [
            "",
            "## Gate de salida",
            "",
            d["gate"],
            "",
            "No marcar PASS sin salida real de los comandos y SHA del commit.",
            "",
        ]
    )


for name, data in C.items():
    directory = BASE / name
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "PATCHSETS.md").write_text(patchsets(name, data), encoding="utf-8")
    (directory / "TEST-PLAN.md").write_text(test_plan(name, data), encoding="utf-8")
    (directory / "README.md").write_text(readme(name, data), encoding="utf-8")
    (directory / "EXECUTION-REPORT.md").write_text(report(name, data), encoding="utf-8")
    print("wrote", directory)
