# MKT-C42 — Aceptación, informe y entrega

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/42-aceptacion-informe-y-entrega.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Consolidar evidencia, límites y backlog para decidir piloto real.

Dependencias: MKT-C41.

Invariante: Pendiente o no verificado no se declara terminado, conforme o paridad mundial.

## Artefactos previstos (no creados)
- `docs/release/final-report.md`
- `docs/release/acceptance.md`
- `docs/release/handoff-next.md`

## Tareas por descomponer
- **MKT-C42-T01** Consolidar42 campañas PASS/BLOCKED/NOT_VERIFIED con commits/PRs. — **aceptación:** Cada PASS enlaza resultado real, no documento que planea el test.
- **MKT-C42-T02** Inventariar tests ejecutados/pasados/fallidos/skipped por entorno. — **aceptación:** No sumar84 escenarios planeados como pruebas ejecutadas.
- **MKT-C42-T03** Publicar matriz de funciones/ediciones/roles/canales habilitados. — **aceptación:** Función optativa sin evidencia sigue deshabilitada.
- **MKT-C42-T04** Revisar STOP conditions de seguridad/consentimiento/doble efecto/medición. — **aceptación:** Cualquier crítico falla aceptación hasta resolverse.
- **MKT-C42-T05** Entregar demo sintética y manuales/costes/restore/rollback. — **aceptación:** Owner puede rastrear actor/fuente/approval/receipt y límites.
- **MKT-C42-T06** Documentar producción/presupuesto/contratos y wiring que requieren otro permiso. — **aceptación:** Cero cambios aplicados a agente o gasto real por esta campaña.
- **MKT-C42-T07** Entregar backlog de expansión y handoff a siguiente equipo. — **aceptación:** No promesas de ROI/rankings/cumplimiento universal ni cobertura inventada.

## Gates por ejecutar
- MKT-C42-G01: Se intenta aprobar piloto con conector real crítico no probado: BLOCKED.
- MKT-C42-G02: Owner reproduce un efecto y reporte desde fixture hasta receipt/claim verificable.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
