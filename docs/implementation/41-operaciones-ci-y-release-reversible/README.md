# MKT-C41 — Operaciones, CI y release reversible

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/41-operaciones-ci-y-release-reversible.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Preparar despliegue controlado, restauración y rollback sin producción automática.

Dependencias: MKT-C40.

Invariante: No comprar servicios, tocar padre o desplegar producción por acabar campañas.

## Artefactos previstos (no creados)
- `docs/operations/`
- `.github/workflows/ci.yml`
- `infra/`

## Tareas por descomponer
- **MKT-C41-T01** Definir CI lint/typecheck/unit/contract/security/browser e integración. — **aceptación:** Skips críticos visibles, no verde engañoso.
- **MKT-C41-T02** Fijar releases/digests/lockfiles y secrets por entorno. — **aceptación:** No latest móvil o clave real en ejemplos.
- **MKT-C41-T03** Crear runbooks de outage, credencial, DLQ, unknown y supresión. — **aceptación:** Señal/responsable/acción/verificación, no solo consejos.
- **MKT-C41-T04** Probar backup/restore y rollback de flags/conector/policy. — **aceptación:** Mantener links/audit/receipts y no reactivar campañas históricas.
- **MKT-C41-T05** Definir release candidata de prompt/KB/modelo/journey con eval/revisión. — **aceptación:** Cambio de contenido no salta aprobación de efecto.
- **MKT-C41-T06** Medir carga/alertas/costes en staging sintético. — **aceptación:** SLA y presupuesto publicados solo con hipótesis/resultados claros.
- **MKT-C41-T07** Preparar guía/paquete instalable probado de este repo. — **aceptación:** Wiring del padre queda patch documental para otro encargo.

## Gates por ejecutar
- MKT-C41-G01: Pausa remoto sin ACK sigue estado incierto tras rollback y no se considera deshecha.
- MKT-C41-G02: Restore completo preserva permisos/supresión y no reenvía outbox confirmada.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
