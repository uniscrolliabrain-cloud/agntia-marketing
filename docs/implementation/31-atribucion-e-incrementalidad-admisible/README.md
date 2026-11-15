# MKT-C31 — Atribución e incrementalidad admisible

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/31-atribucion-e-incrementalidad-admisible.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Separar crédito de efecto causal y validar datasets de medición.

Dependencias: MKT-C30.

Invariante: Ajuste, correlación o ventas atribuidas no prueban incremento.

## Artefactos previstos (no creados)
- `packages/measurement/claims/`
- `docs/identification-contract.md`
- `tests/measurement-claims.test.ts`

## Tareas por descomponer
- **MKT-C31-T01** Definir métricas de negocio, ingreso neto/bruto/margen y fuentes. — **aceptación:** Sin coste/margen no mostrar beneficio inventado.
- **MKT-C31-T02** Deduplicar ConversionFacts y aplicar cancelaciones/refunds. — **aceptación:** Una venta atribuida por varios canales cuenta una vez como hecho.
- **MKT-C31-T03** Definir reglas de atribución versionadas y límites de ventana. — **aceptación:** Reporte etiqueta explícitamente plataforma/modelo y cobertura.
- **MKT-C31-T04** Crear contrato causal con estimand/población/tratamiento/controles. — **aceptación:** No denominar causal una regresión sin justificación.
- **MKT-C31-T05** Validar experimentos naturales/cortes con supuestos y alternativas. — **aceptación:** Intervención descubierta no se asume exógena.
- **MKT-C31-T06** Calcular incertidumbre/sensibilidad y estados insufficient/blocked. — **aceptación:** Salida descriptiva sigue útil sin fabricar iROAS.
- **MKT-C31-T07** Probar confusión endógena, placebo y efecto conocido sintético. — **aceptación:** Se mide recuperación/false conclusions, no solo fit.

## Gates por ejecutar
- MKT-C31-G01: Modelo ajusta bien pero atribuye ventas preexistentes: no se certifica causalidad.
- MKT-C31-G02: Plataforma reporta ingresos pero no IDs negocio: cobertura/dedup limitados se explican.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
