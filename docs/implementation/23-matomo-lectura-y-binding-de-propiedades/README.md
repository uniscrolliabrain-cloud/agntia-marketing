# MKT-C23 — Matomo lectura y binding de propiedades

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/23-matomo-lectura-y-binding-de-propiedades.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Importar métricas con definiciones y configuración de medición.

Dependencias: MKT-C22.

Invariante: Un siteId remoto no es tenantId y una métrica no prueba cumplimiento.

## Artefactos previstos (no creados)
- `packages/adapters/matomo/`
- `docs/adapters/matomo.md`
- `tests/integration/matomo.test.ts`

## Tareas por descomponer
- **MKT-C23-T01** Fijar versión/plugins/licencia y roles de laboratorio. — **aceptación:** Función premium no se declara Community por estar en docs.
- **MKT-C23-T02** Validar tenant/proyecto→site y scopes de lectura. — **aceptación:** No token admin global para filtrar después.
- **MKT-C23-T03** Descubrir módulos/métricas/dimensiones permitidos. — **aceptación:** Método Reporting API cerrado, sin module/action arbitrario.
- **MKT-C23-T04** Leer reportes paginados con ventana/timezone/segment aprobado. — **aceptación:** Totales y cobertura preservados, sin SQL libre.
- **MKT-C23-T05** Mapear unidades, unique/visits/events y config privacidad. — **aceptación:** No sumar métricas incompatibles entre backends.
- **MKT-C23-T06** Persistir Observation/snapshot y actualizar con versiones tardías. — **aceptación:** Reporte aprobado no se recalcula silenciosamente.
- **MKT-C23-T07** Probar site ajeno, plugin ausente, vacío y credencial revocada. — **aceptación:** Unsupported/forbidden honesto sin fixtures presentados reales.

## Gates por ejecutar
- MKT-C23-G01: SiteB pedido desdeA se bloquea antes del Reporting API.
- MKT-C23-G02: Sin datos no se reporta0 ventas o ROI positivo.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
