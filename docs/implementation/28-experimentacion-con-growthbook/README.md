# MKT-C28 — Experimentación con GrowthBook

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/28-experimentacion-con-growthbook.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Diseñar y ejecutar asignación acotada con análisis predefinido.

Dependencias: MKT-C27.

Invariante: Feature flag no es permiso para exponer población o gastar; p-value no sustituye diseño.

## Artefactos previstos (no creados)
- `packages/experiments/`
- `packages/adapters/growthbook/`
- `tests/experiment-integrity.test.ts`

## Tareas por descomponer
- **MKT-C28-T01** Fijar versión/licencias/funciones y scope proyecto. — **aceptación:** Enterprise no se asume disponible por README.
- **MKT-C28-T02** Definir ExperimentSpec de unidad/población/hipótesis/MDE/guardrails. — **aceptación:** Estimand y análisis plan revisados antes de observar resultado.
- **MKT-C28-T03** Validar elegibilidad/asignación/exposición y persistencia de bucket. — **aceptación:** No reasignación por reintento o cambio de dispositivo sin policy.
- **MKT-C28-T04** Implementar exposición y outcomes con dedup/ventanas. — **aceptación:** No contamination silenciosa entre tratamiento/control.
- **MKT-C28-T05** Comprobar SRM, potencia, comparaciones múltiples y reglas de parada. — **aceptación:** No declarar ganador por mirar repetidamente sin método válido.
- **MKT-C28-T06** Aplicar preview/approval a activar configuración, no flag global libre. — **aceptación:** Solo fixture/sandbox en esta campaña sin usuarios reales.
- **MKT-C28-T07** Probar A/A, efecto sintético conocido, nulo y cambio concurrente. — **aceptación:** Falso positivo, pérdida y exclusiones quedan medidos.

## Gates por ejecutar
- MKT-C28-G01: SRM o contaminación impiden reportar uplift como conclusión firme.
- MKT-C28-G02: LLM intenta activar feature flag de todos los proyectos: denegado.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
