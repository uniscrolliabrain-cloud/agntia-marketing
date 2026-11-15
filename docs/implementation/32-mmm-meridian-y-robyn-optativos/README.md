# MKT-C32 — MMM Meridian y Robyn optativos

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/32-mmm-meridian-y-robyn-optativos.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Ejecutar análisis agregado aislado solo si datos/método/recursos son aptos.

Dependencias: MKT-C31.

Invariante: Instalar MMM no crea causalidad ni aptitud para cualquier pyme.

## Artefactos previstos (no creados)
- `packages/model-jobs/`
- `workers/measurement/`
- `tests/mmm-admissibility.test.ts`

## Tareas por descomponer
- **MKT-C32-T01** Fijar versiones/licencias/runtime y elegir motor inicial justificado. — **aceptación:** Referencia rama Robyn no se adopta automáticamente estable.
- **MKT-C32-T02** Definir contrato de dataset agregado y controles/periodos/geo. — **aceptación:** No completar historia real con sintéticos para pasar admisibilidad.
- **MKT-C32-T03** Validar missing, colinealidad, cambios de régimen y calidad. — **aceptación:** Datos insuficientes producen blocked/needs_review.
- **MKT-C32-T04** Fijar priors/transformaciones/seeds y presupuesto de cómputo. — **aceptación:** LLM no ejecuta scripts o librerías arbitrarias.
- **MKT-C32-T05** Ejecutar worker aislado sin secretos de canal y outputs tipados. — **aceptación:** Un model job no puede comprar medios o leer otro tenant.
- **MKT-C32-T06** Evaluar diagnostics, calibración experimental y sensibilidad. — **aceptación:** No seleccionar solo por R², MAPE o gráfica bonita.
- **MKT-C32-T07** Probar datos sintéticos con verdad conocida y restore de artifacts. — **aceptación:** ModelRun reproducible con límites y sin score de autores heredado.

## Gates por ejecutar
- MKT-C32-G01: Serie corta/confundida no genera recomendación firme por necesidad comercial.
- MKT-C32-G02: Modelo pide GPU/coste mayor que reserva: se bloquea sin gasto sorpresa.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
