# MKT-C33 — Escenarios de mix y presupuesto

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/33-escenarios-de-mix-y-presupuesto.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Proponer decisiones revisables bajo restricciones e incertidumbre.

Dependencias: MKT-C32.

Invariante: Recomendación de inversión no ejecuta reasignación ni compromete caja.

## Artefactos previstos (no creados)
- `packages/planning/`
- `docs/budget-scenarios.md`
- `tests/planning.test.ts`

## Tareas por descomponer
- **MKT-C33-T01** Definir restricciones comerciales por canal/periodo/moneda. — **aceptación:** Separar coste de servicio de gasto publicitario.
- **MKT-C33-T02** Consumir MeasurementClaims/ModelRuns con validez y coverage. — **aceptación:** Datos stale/no aptos no se transforman en óptimo.
- **MKT-C33-T03** Generar escenarios base/alternativos con intervalos/supuestos. — **aceptación:** No punto óptimo único sin sensibilidad.
- **MKT-C33-T04** Agregar riesgos de extrapolación, saturación y coste de cambio. — **aceptación:** No extender curvas fuera de rango observado sin advertencia.
- **MKT-C33-T05** Proponer experimento adicional cuando identificación es débil. — **aceptación:** Se incluye coste/permiso pendiente, sin lanzarlo.
- **MKT-C33-T06** Crear propuesta a finanzas/owner con diff y evidencia. — **aceptación:** Aceptar informe no es autorización de compra.
- **MKT-C33-T07** Probar moneda, límites, datos contradictorios y plan imposible. — **aceptación:** Infeasible explicado en vez de inventar saldo o ROI.

## Gates por ejecutar
- MKT-C33-G01: El optimizador pide duplicar budget y tool no tiene capability de mutate.
- MKT-C33-G02: Scenario usa ingreso atribuido como causal: revisión bloquea afirmación.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
