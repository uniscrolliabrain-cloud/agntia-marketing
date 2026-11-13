# Handoff para otra IA

Entrega 3/9,12-11-2026. Repositorio objetivo: `uniscrolliabrain-cloud/agntia-marketing`. El encargo actual entrega exclusivamente investigación, diseño, contratos y42 campañas. No se ha implementado aplicación, instalado proveedores o ejecutado tests de producto. La ruta local documental es `/workspace/agntia-marketing`; en otra máquina se obtiene checkout de GitHub. **Prohibido modificar `/agente` en este encargo.**

## Intención y arquitectura aceptadas

El propietario construye un OS empresarial con empleados IA generalistas y empresas SaaS especialistas. Pueden duplicar servicios. Cada especialista vive canónicamente en agente y tiene un twin vinculado en su servicio; no duplicar soberanía/identidad ni crear una organización empresarial paralela. El cliente externo usa portal propio con Anam sin tener que entrar en UI AgntiaPro. Todos los modos multitenant con JWT de Supabase y aislamiento end-to-end. Nomenclatura/linaje del padre se respetan leyendo código, no inventando contratos existentes.

Marketing presta estrategia/brief, investigación, audiencias autorizadas, creatividades/claims, email/journeys/landings, SEO/AEO, propuestas ads, experimentos/medición/escenarios y reportes. No toda campaña debe usar MMM ni todos los backends; una pyme con pocos datos merece resultados descriptivos honestos. No garantizar ingresos/rankings o cumplimiento universal.

## Antes de implementar bajo nueva autorización

Leer README, arquitectura, contracts, privacy, medición, fuentes y cada campaña. Congelar SHA propio/padre/upstreams y revisar instrucciones locales. Main padre observado54b8d5407a8576459448c4d059a877297d18ca7a; lectura selectiva, no auditoría completa o suite ejecutada. Mapa incluye investigación heredada y nuevas lecturas de leads/analytics/persona marketing. Resolver discrepancia índice12/catálogo16 antes del binding, sin dar de alta agentes aquí.

Mantener Actor/runtimeId/roleId/personaId/kernelTurnId según tipo, provenance y assignedBy/To. SystemEvent host usa schemaVersion string1.0/emittedAt/owner/source permitido. Un evento marketing nuevo no se agrega al enum padre. JWT claims nativos preservados; no copiar legacy user_metadata/default como permiso. Workers con mandato/target explícito, no JWT humanos falsificados. Si el bridge no está, marcarlo y proponer patch documental en este repo; no aplicarlo al padre.

## Implementación ordenada

[Campaña](../campaigns/README.md) y [manifest](../campaigns/campaign.json):42 fases,294 tareas con aceptación,84 escenarios previstos. Todos NOT_STARTED/NOT_EXECUTED. C01–C10 fundaciones; C11–C20 backends/producción de propuestas/audiencias/journeys/aprobación; C21–C30 caps/recovery/medición/SEO/experimentos/ads test; C31–C40 causalidad/MMM/escenarios/reportes/interfaces/portal/cooperación/coste/privacidad/E2E; C41–C42 operación/aceptación.

Preferir core local y sink para primera vertical. Elegir Mautic o listmonk tras licencia/discovery/aislamiento; uno o pocos backends de medición. Varias ramas observadas son development; fijar release/digest reales. Mautic docs versión inconsistente, Plausible Cloud/CE y GrowthBook/PostHog Enterprise requieren verificación. Meta Insights429 es pendiente. GoogleAds test accounts tienen límites y validate_only no cubre todo; no usar producción para completarlos sin otro permiso.

## Reglas que no se pueden diluir

Preview local sin side effects; un endpoint email test envía. Approval liga payload final, variantes/assets/rights/claims/policy, máximo real de audiencia, propósito/canal/cuenta, coste/ventana y revisión. Bajas reducen, nuevas incorporaciones no se añaden por listas dinámicas. Cada paso revalida supresión/frecuencia/mandato/budget. Si un backend no puede cumplir el control de población/permiso al enviar, bloquear esa ruta, no declararla segura por sincronizar de vez en cuando.

Ledger local no garantiza exactly-once remoto. Tras timeout consultar estado; no cambiar key/proveedor. Pausa/cancel no recall de mensajes ni garantía de gasto final. Por defecto piloto sin listas reales, ad spend, audience uploads, billing o conversion uploads; producción queda fuera. No listas compradas, targeting sensible, atributos biométricos o testimonios/citas falsas.

Conversión observada, atribuida y causal son tipos distintos. Dedupe ventas por evento de negocio, ajustes de cancel/refund, source definitions y cobertura. No sumar plataformas para inflar ingreso. MMM exige datos aptos, supuestos/calibración/sensibilidad y revisión; buen fit no prueba iROAS. GEO histórico no garantiza visibilidad actual; API de modelo no representa todos los usuarios de un buscador.

## Evidencia y checkpoints

Reportar5/10/15/20/25/30/35/40/42: fases PASS/BLOCKED/NOT_VERIFIED, SHAs/diff/PR, versiones/entorno, tests reales ejecutados/pasados/fallidos/skipped, fixtures inicial/final, receipts/correlación sanitizados, capacidades/ediciones, coste, riesgos y siguiente gate. Sin Docker/red/cuenta/licencia, mock prueba lógica pero gate real sigue pendiente. El check documental actual no pasa ninguna fase de código.

## Piloto y entrega final

Demo sintética con dos tenants/operador/twins, Supabase/ACL, brief→audiencia→creativo→approval→sink→receipt→reporte, y fallos de baja/concurrencia/timeout/crash. E2E A–I y gates críticos. Restore preserva supresión e historia sin reenvío. Dashboard/UXresponsive/Anam acotado o disabled con texto útil. Informe de capacidades reales y fuentes/costes/limitaciones. Ningún cambio a agente o despliegue producción por acabar campañas. El owner decide una expansión concreta y revisable después.
