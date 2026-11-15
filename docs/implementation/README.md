# Implementación secuencial — 42 campañas

**Estado: ESTRUCTURA INICIAL, NO 42 CAMPAÑAS IMPLEMENTATION-READY.** Generado desde `docs/campaigns/campaign.json` conservando los 42 IDs, 294 tareas y 84 gates originales. El propósito es construir especificaciones ultr granulares verificadas con código, no ejecutar los scaffolds como si fueran órdenes completas.

Lectura obligatoria: [protocolo de tres agentes](../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), documentación original en `docs/campaigns/`, anterior/actual/posterior.

| ID | Carpeta | Madurez |
|---|---|---|
| MKT-C01 | [Baseline y perímetro autorizado](01-baseline-y-perimetro-autorizado/README.md) | 3 handoffs C01 escritos; pendientes patchsets definitivos |
| MKT-C02 | [Dominio, autoridad y modelo SaaS](02-dominio-autoridad-y-modelo-saas/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C03 | [Supabase JWT y principal verificado](03-supabase-jwt-y-principal-verificado/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C04 | [Twins y nomenclatura de procedencia](04-twins-y-nomenclatura-de-procedencia/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C05 | [Contratos tipados y validación de frontera](05-contratos-tipados-y-validacion-de-frontera/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C06 | [Postgres, RLS y persistencia transaccional](06-postgres-rls-y-persistencia-transaccional/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C07 | [Bases de tratamiento, supresión y preferencias](07-bases-de-tratamiento-supresion-y-preferencias/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C08 | [Registro, OAuth, secretos y discovery](08-registro-oauth-secretos-y-discovery/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C09 | [Datos propios y puente de relación](09-datos-propios-y-puente-de-relacion/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C10 | [Taxonomía y contrato de medición de eventos](10-taxonomia-y-contrato-de-medicion-de-eventos/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C11 | [Mautic lectura y mapeo](11-mautic-lectura-y-mapeo/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C12 | [Mautic borradores y autoridad de ejecución](12-mautic-borradores-y-autoridad-de-ejecucion/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C13 | [Listmonk y newsletters como alternativa](13-listmonk-y-newsletters-como-alternativa/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C14 | [Entrega email de sandbox y reputación](14-entrega-email-de-sandbox-y-reputacion/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C15 | [Formularios y landings controladas](15-formularios-y-landings-controladas/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C16 | [Marca, assets y evidencia de claims](16-marca-assets-y-evidencia-de-claims/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C17 | [Investigación, brief y estrategia](17-investigacion-brief-y-estrategia/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C18 | [Segmentación y audiencia máxima](18-segmentacion-y-audiencia-maxima/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C19 | [Journeys y motor de campañas](19-journeys-y-motor-de-campanas/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C20 | [Preview y aprobación vinculada](20-preview-y-aprobacion-vinculada/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C21 | [Frecuencia, presupuestos y límites de contacto](21-frecuencia-presupuestos-y-limites-de-contacto/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C22 | [Outbox, jobs y reconciliación](22-outbox-jobs-y-reconciliacion/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C23 | [Matomo lectura y binding de propiedades](23-matomo-lectura-y-binding-de-propiedades/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C24 | [Plausible y PostHog como alternativas](24-plausible-y-posthog-como-alternativas/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C25 | [GA4 y Search Console](25-ga4-y-search-console/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C26 | [SEO técnico y cambios web propuestos](26-seo-tecnico-y-cambios-web-propuestos/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C27 | [AEO y GEO observacional](27-aeo-y-geo-observacional/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C28 | [Experimentación con GrowthBook](28-experimentacion-con-growthbook/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C29 | [Paid media lectura y descubrimiento](29-paid-media-lectura-y-descubrimiento/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C30 | [Ads en test accounts y borradores controlados](30-ads-en-test-accounts-y-borradores-controlados/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C31 | [Atribución e incrementalidad admisible](31-atribucion-e-incrementalidad-admisible/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C32 | [MMM Meridian y Robyn optativos](32-mmm-meridian-y-robyn-optativos/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C33 | [Escenarios de mix y presupuesto](33-escenarios-de-mix-y-presupuesto/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C34 | [Dashboard, infografías y briefing](34-dashboard-infografias-y-briefing/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C35 | [SDK Hono, tools y bridge del padre](35-sdk-hono-tools-y-bridge-del-padre/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C36 | [Portal responsive y sesiones Anam](36-portal-responsive-y-sesiones-anam/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C37 | [Cooperación SaaS, handoffs y rotas](37-cooperacion-saas-handoffs-y-rotas/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C38 | [Coste de servicio y observabilidad operacional](38-coste-de-servicio-y-observabilidad-operacional/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C39 | [Privacidad, derechos y pruebas adversariales](39-privacidad-derechos-y-pruebas-adversariales/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C40 | [Evaluación de agentes y vertical E2E](40-evaluacion-de-agentes-y-vertical-e2e/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C41 | [Operaciones, CI y release reversible](41-operaciones-ci-y-release-reversible/README.md) | scaffold; 3 handoffs pendientes |
| MKT-C42 | [Aceptación, informe y entrega](42-aceptacion-informe-y-entrega/README.md) | scaffold; 3 handoffs pendientes |

## Para convertir cada carpeta en campaña ejecutable
Completar `PATCHSETS.md` con archivo exacto, firma, import/export, wiring, tests, rollback y owner; crear tres handoffs personalizados; verificar contratos y rutas del padre a SHA; congelar dependencias, definir gate y evidencias; revisar y aprobar alcance. No permitir implementación a partir de un scaffold incompleto.

## Migración preparatoria
La documentación anterior no se ha movido físicamente: véase [índice de prep](../prep/README.md). No borrar ni mover hasta actualizar enlaces y manifiesto.
