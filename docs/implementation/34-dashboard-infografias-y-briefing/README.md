# MKT-C34 — Dashboard, infografías y briefing

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/34-dashboard-infografias-y-briefing.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Mostrar trabajo y resultados reproducibles sin rellenar huecos.

Dependencias: MKT-C33.

Invariante: La visualización no convierte estimación o dato ausente en hecho.

## Artefactos previstos (no creados)
- `packages/reporting/`
- `apps/portal/reports/`
- `docs/metrics-catalog.md`

## Tareas por descomponer
- **MKT-C34-T01** Definir catálogo de KPI con definición/denominador/exclusiones. — **aceptación:** CTR/CVR/ROAS no se suman o promedian sin regla.
- **MKT-C34-T02** Crear snapshots con datasets/filtros/versions/hash y ACL. — **aceptación:** Mismo snapshot reproduce cifras aunque fuente cambie.
- **MKT-C34-T03** Construir gráficos/tablas con coverage/freshness/uncertainty. — **aceptación:** Descriptivo/atribuido/causal visibles en cada claim.
- **MKT-C34-T04** Agregar timeline de entregables, approvals, efectos y bloqueos. — **aceptación:** Laia/supervisor solo reporta trabajo con receipt/evidencia.
- **MKT-C34-T05** Generar narrativa con fuentes y afirmaciones verificables. — **aceptación:** Modelo no rellena ingresos/métricas que faltan.
- **MKT-C34-T06** Exportar PDF/SVG/HTML u otros formatos tras revisión de datos. — **aceptación:** Sin PII/secretos/CSV injection o enlaces de otros tenants.
- **MKT-C34-T07** Probar cifras tardías, cero, null y reporte multilingüe. — **aceptación:** Nueva revisión no altera silenciosamente un informe aceptado.

## Gates por ejecutar
- MKT-C34-G01: Sin conversiones observadas no se afirma ROI ni fracaso sin cobertura.
- MKT-C34-G02: InformeA no muestra lista, modelo, links o agregados identificables deB.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
