# MKT-C37 — Cooperación SaaS, handoffs y rotas

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/37-cooperacion-saas-handoffs-y-rotas.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Coordinar servicios solapados con contratos mínimos y recibos reales.

Dependencias: MKT-C36.

Invariante: Repos hermanos no reciben datos por defecto ni crean un scheduler empresarial paralelo.

## Artefactos previstos (no creados)
- `packages/service-agreements/`
- `packages/handoffs/`
- `docs/sibling-contracts.md`

## Tareas por descomponer
- **MKT-C37-T01** Definir contratos con redes/clientes/ventas/branding/finanzas/legal. — **aceptación:** Alcance de dato/finalidad y autoridad por efecto explícitos.
- **MKT-C37-T02** Crear WorkOrder y entregable con proponente/revisor/aceptante. — **aceptación:** Aceptación comercial no autoriza cada efecto técnico.
- **MKT-C37-T03** Implementar offered/acknowledged/working/completed/returned para handoff. — **aceptación:** Emitir evento no prueba trabajo recibido.
- **MKT-C37-T04** Coordinar autoridad única de envío/caps/budget entre servicios. — **aceptación:** Conflicto produce bloqueo, no carrera de emisores.
- **MKT-C37-T05** Definir datos/eventos de briefing diario/semanal/mensual. — **aceptación:** Padre gobierna rota; no inventar actividad para llenarla.
- **MKT-C37-T06** Definir operación de cliente externo y portabilidad/salida. — **aceptación:** Sin UI AgntiaPro requerida, mismo twin/identity policy.
- **MKT-C37-T07** Probar hermano ausente, ACK tardío y datos sin permiso. — **aceptación:** Tarea humana/local válida o bloqueo explicado, sin dictamen/saldo inventado.

## Gates por ejecutar
- MKT-C37-G01: Redes y marketing reciben mismo publicable: un EffectOwner controla dispatch.
- MKT-C37-G02: Export de clientes a servicio hermano sin contrato se rechaza aunque sea mismo owner.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
