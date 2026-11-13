# MKT-C26 — SEO técnico y cambios web propuestos

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/26-seo-tecnico-y-cambios-web-propuestos.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Auditar sitios autorizados y preparar mejoras sin publicación automática.

Dependencias: MKT-C25.

Invariante: Crawl autorizado no concede permiso para editar o copiar cualquier sitio.

## Artefactos previstos (no creados)
- `packages/seo/`
- `packages/site-audits/`
- `tests/seo-audit.test.ts`

## Tareas por descomponer
- **MKT-C26-T01** Verificar propiedad/alcance de dominios y rate/robots/condiciones. — **aceptación:** No crawl arbitrario desde texto del agente.
- **MKT-C26-T02** Analizar status/canonical/indexability/metadatos/enlaces con límites. — **aceptación:** SSRF/redirect/private paths quedan fuera.
- **MKT-C26-T03** Vincular hallazgos a URL/fecha/evidencia y severidad explicada. — **aceptación:** No penalización de ranking inventada.
- **MKT-C26-T04** Proponer contenido útil y correcciones con diff/custodio. — **aceptación:** No keyword stuffing, páginas en masa o citas fabricadas.
- **MKT-C26-T05** Validar structured data contra hechos visibles y derechos. — **aceptación:** Schema mágico no promete inclusión en IA.
- **MKT-C26-T06** Definir change proposal CMS/repo sin tocar agente o producción. — **aceptación:** Apply requiere autorización/capacidad aparte.
- **MKT-C26-T07** Probar site fixture, contenido adversarial y datos desactualizados. — **aceptación:** Recomendación stale no se aplica ciegamente.

## Gates por ejecutar
- MKT-C26-G01: Página incluye instrucción de tool/admin o URL metadata: se trata como dato hostil.
- MKT-C26-G02: Hallazgo SEO no dispara deploy de página ni sitemap de producción.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
