# MKT-C35 — SDK Hono, tools y bridge del padre

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/35-sdk-hono-tools-y-bridge-del-padre.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Preparar interoperabilidad tipada sin editar agente.

Dependencias: MKT-C34.

Invariante: MCP/Anam/SDK pasan por mismo PEP; no proxy genérico ni wiring automático al padre.

## Artefactos previstos (no creados)
- `packages/sdk/`
- `packages/host-bridge/`
- `docs/host-patch-proposal.md`

## Tareas por descomponer
- **MKT-C35-T01** Crear cliente servidor con DTOs/error/timeouts y config privada. — **aceptación:** No token proveedor en browser ni unknown sin validación.
- **MKT-C35-T02** Crear allowlist exacta método/ruta/tamaño en Hono. — **aceptación:** Nuevo endpoint sensible no queda expuesto por prefijo.
- **MKT-C35-T03** Definir tools de lectura/propuesta con input mínimo. — **aceptación:** Actor/tenant/capabilities fuera del control del modelo.
- **MKT-C35-T04** Mapear SystemEvent nativo1.0/owner/emittedAt/source permitido. — **aceptación:** Marketing events nuevos no se insertan como enum inventado.
- **MKT-C35-T05** Implementar inbox/outbox/receipt/ACK y enlaces de tarea/evidencia. — **aceptación:** Replay no crea doble tarea/envío.
- **MKT-C35-T06** Documentar patch de instalación/wiring sin aplicarlo. — **aceptación:** Cero cambios a claims/rutas/config del padre.
- **MKT-C35-T07** Probar contratos API↔SDK↔host fake y build. — **aceptación:** Fake no se anuncia integración instalada, real queda gate pendiente.

## Gates por ejecutar
- MKT-C35-G01: Modelo intenta /provider/method o SQL libre: rechazo antes de ejecutar.
- MKT-C35-G02: Host approval adapter ausente no permite fabricar una aprobación local equivalente.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
