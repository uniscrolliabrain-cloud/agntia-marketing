# MKT-C25 — GA4 y Search Console

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/25-ga4-y-search-console.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Medir fuentes Google con scopes y cobertura documentados.

Dependencias: MKT-C24.

Invariante: Top rows/reporting identity no equivalen a datos completos o personas identificadas.

## Artefactos previstos (no creados)
- `packages/adapters/ga4/`
- `packages/adapters/search-console/`
- `tests/google-measurement.test.ts`

## Tareas por descomponer
- **MKT-C25-T01** Configurar OAuth/scopes read-only y bindings de property/site. — **aceptación:** Credencial no autoriza otras propiedades por existir en cuenta.
- **MKT-C25-T02** Descubrir métricas/dimensiones/versiones y compatibilidad. — **aceptación:** No usar Universal Analytics como si fuera GA4.
- **MKT-C25-T03** Implementar reportes con filtros allowlist/cuotas/timezone. — **aceptación:** Consulta costosa respeta budget y límites.
- **MKT-C25-T04** Persistir identidad/configuración de reporting y ventanas. — **aceptación:** Snapshot indica si cifras dependen de modelo/config fuente.
- **MKT-C25-T05** Importar Search Console sin prometer todas las filas. — **aceptación:** Query ausente no se interpreta cero impresiones automáticamente.
- **MKT-C25-T06** Mapear frescura, late data y métricas agregadas por definición. — **aceptación:** Reprocesado produce versión nueva con evidencia.
- **MKT-C25-T07** Probar propiedadesA/B, datos omitidos y token revocado. — **aceptación:** 403/404 sin fuga ni fallback cuenta administrador.

## Gates por ejecutar
- MKT-C25-G01: GSC devuelve top rows y reporte no las etiqueta como universo completo.
- MKT-C25-G02: GA4 mismo nombre de property pero ID distinto no cambia binding.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
