> **AVISO DE DOCUMENTO HISTÓRICO · 2026-11-18 — NO REPRESENTA EL ESTADO ACTUAL**  
> Este informe describe la entrega documental original y afirma que no existía implementación. Posteriormente `main` incorporó código en API, core, SDK, worker, portal y pruebas. Consultar `docs/evidence/ANEXO-42-FASES.md`: 23 DONE, 15 PARTIAL, 4 BLOCKED, 101 tests declarados. No se han verificado aquí las pruebas, Postgres ni proveedores externos. Conservar el cuerpo como evidencia histórica, no usarlo como baseline actual para Freebuff/Codex.  

# Entrega 3/9 · agntia-marketing

Se entrega un diseño documental de empresa SaaS especialista en marketing y medición, integrable con AgntiaPro y apta como diseño para clientes externos. La aspiración toma referentes líderes, sin afirmar paridad actual o resultados comerciales garantizados.

**42 campañas,294 tareas con aceptación y84 escenarios de gate; todo NOT_STARTED/NOT_EXECUTED.** Solo investigación selectiva y checks documentales. No app, SDK, contenedores, tests de producto, proveedores conectados, anuncios, emails reales, compras o despliegues. [Validación documental](document-validation.json) registra exactamente qué se comprobó.

## Qué podrá construir la IA siguiente

Estrategia/brief con fuentes; ICP/audiencias por reglas autorizadas; supresión/preferencias; contenido ES/EN/FR con derechos/claims; email/journeys/landings; SEO técnico y AEO observacional; lectura/propuestas de ads y test accounts; experimentos/atribución/incrementalidad admisible; MMM/escenarios opcionales; reportes/infografías; portal responsive con chat/Anam; SDK/Hono/tools/contratos de cooperación.

La aprobación liga contenido, propósito/canal/coste y una audiencia máxima congelada. Bajas reducen; miembros nuevos exigen otra aprobación. El modelo no compra medios, se autoaprueba o elige URL/SQL arbitrarios. Reconciliación impide reintento ciego tras aceptación incierta. Un reporte distingue observado, atribuido y estimación causal, conserva cobertura y no infla ventas sumando plataformas.

Supabase JWT y aislamiento end-to-end en todos los modos; agente canónico en padre, twin vinculado aquí. Clientes externos usan portal propio sin necesidad deUI AgntiaPro. Servicios solapados permitidos con responsable único por efecto. No se ha modificado `/agente`, sus claims/enums o configuración; solo se cotejó SHA y se consultaron contratos/código selectivo.

## Investigación

Seis papers: AD-Bench2026, gasto endógeno sintético2026, pseudo-incrementalidad2026, selecciónMMM2026, GEO2024 y AgentDojo2024. Abstracts/HTML selectivos, no benchmarks reproducidos. Fuentes oficiales de HubSpot, Adobe, Salesforce, Klaviyo, Braze y Mailchimp sobre novedades2026. Ocho repos fijados por SHA: Mautic, listmonk, Matomo, Plausible, GrowthBook, Meridian, Robyn y PostHog. Licencias/ediciones diferenciadas; no se ha instalado ninguno.

API Mautic con versión de portada inconsistente, capacidades Cloud/CE/Enterprise y ramas default de desarrollo requieren cotejo real. Meta Insights devolvió429. La guía GoogleAds Testing se consultó sin API call; test accounts/validate_only no acreditan todas funciones. Google Search documenta ausencia de requisitos mágicos SEO especiales para AI features, sin garantizar aparición. GSC/GA4 tienen límites/configuraciones que se preservan en los reportes.

El padre en54b8d5407a8576459448c4d059a877297d18ca7a separa discovery/aceptación de leads, origen y seguimiento/oposiciones; analytics overview no es un motor MMM. Hay plantilla marketing, no prueba de ejecución. Se conserva discrepancia índice12/catálogo16 pendiente de resolver antes de binding.

## Riesgos y siguiente trabajo

Falta toda la implementación, integración real, costes medidos y operación. Modelos causales no aptos para cualquier pyme: el servicio debe bloquear conclusiones y ofrecer descriptivo útil si faltan datos. Consentimiento/tracking/derechos/anuncios necesitan revisión de configuración/finalidad; ningún framework garantiza cumplimiento por instalarse.

Bolsas30/70/300€ son hipótesis internas separadas del gasto de medios del cliente; no contratos o volúmenes garantizados. AV/MMM/extras pueden no caber y deben quedar apagados o requerir nueva propuesta. Sin escrituras reales de ads/campañas, no se demuestra overdelivery o entregabilidad en producción, y no se afirma lo contrario.

[Handoff](HANDOFF.md), [42 campañas](../campaigns/README.md), [contratos](../contracts/01-contratos.md), [aceptación](PILOT-ACCEPTANCE.md) y [runbook](../operations/RUNBOOK.md) guían otra IA cuando se autorice código. El siguiente repo documental, al decir «siguiente», será agntia-ventas. Los seis restantes no se han poblado en este turno.
