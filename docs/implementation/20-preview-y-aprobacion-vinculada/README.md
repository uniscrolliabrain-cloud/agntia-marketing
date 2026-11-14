# MKT-C20 — Preview y aprobación vinculada

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/20-preview-y-aprobacion-vinculada.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Congelar contenido, propósito, audiencia y coste antes del efecto.

Dependencias: MKT-C19.

Invariante: Proponente/twin no puede aprobarse ni ampliar el alcance autorizado.

## Artefactos previstos (no creados)
- `packages/approvals/`
- `packages/campaign-preview/`
- `tests/approval-binding.test.ts`

## Tareas por descomponer
- **MKT-C20-T01** Crear preview puro de payload/render/assets/links/variantes. — **aceptación:** Sin test-send/upload/cron/mutation remota.
- **MKT-C20-T02** Canonicalizar hashes de contenido, audienceMax, rights, claims y policy. — **aceptación:** Cambio material invalida binding aunque campaignId sea igual.
- **MKT-C20-T03** Vincular approval a revisor humano verificado y tenant/proyecto. — **aceptación:** Nombre/voz/JSON approved no prueban autorización.
- **MKT-C20-T04** Agregar expiry, expectedVersion, purpose/channel y costCeiling. — **aceptación:** Approval genérica no autoriza otro canal/cuenta.
- **MKT-C20-T05** Integrar puerto local/host de aprobación con verificación de prueba. — **aceptación:** Si host no existe, no inventar approval ni editar padre.
- **MKT-C20-T06** Implementar commit con key/hash y revalidación de bajas. — **aceptación:** Repetición igual devuelve estado; nuevo payload da409.
- **MKT-C20-T07** Probar doble click, sesión expirada, voz y retirada. — **aceptación:** Aprobación sensible se confirma en UI autenticada del piloto.

## Gates por ejecutar
- MKT-C20-G01: ApprovalA con texto igual intenta usar audienciaB: scope/hash bloquean.
- MKT-C20-G02: Cambiar targeting, precio o creativo tras aprobar exige otra revisión.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
