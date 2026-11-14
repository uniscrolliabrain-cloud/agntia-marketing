# MKT-C22 — Outbox, jobs y reconciliación

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/22-outbox-jobs-y-reconciliacion.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Hacer recuperable la ejecución sin retry ciego tras incertidumbre.

Dependencias: MKT-C21.

Invariante: Lease/fencing local no demuestra exactamente-una-vez remoto.

## Artefactos previstos (no creados)
- `packages/jobs/`
- `packages/outbox/`
- `packages/reconcile/`

## Tareas por descomponer
- **MKT-C22-T01** Persistir intent/key/hash/audit/outbox en una transacción. — **aceptación:** Caída precommit no deja efecto huérfano o watermark avanzado.
- **MKT-C22-T02** Implementar leases/fences y límites de attempts/DLQ. — **aceptación:** Worker viejo no confirma estado después de perder lease.
- **MKT-C22-T03** Revalidar principal delegado/approval/audiencia/purpose/budget al ejecutar. — **aceptación:** Job no conserva poderes revocados.
- **MKT-C22-T04** Clasificar pre-dispatch/rejected/accepted/outcome_unknown por evidencia. — **aceptación:** Timeout no se etiqueta automáticamente failed seguro.
- **MKT-C22-T05** Implementar lookup remoto por refs verificables y política por proveedor. — **aceptación:** Sin reconciliación fiable se bloquea y escala.
- **MKT-C22-T06** Definir cancel/pause con ACK y efectos en vuelo. — **aceptación:** No borrar historial remoto para simular rollback.
- **MKT-C22-T07** Inyectar crash antes/después de HTTP/ACK y repetición de lote. — **aceptación:** Un efecto o uncertainty visible sin duplicación.

## Gates por ejecutar
- MKT-C22-G01: Backend aceptó envío, worker cae antes ACK: no nuevo envío desde backend alterno.
- MKT-C22-G02: Tenant suspendido durante takeover impide HTTP aunque lease esté libre.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
