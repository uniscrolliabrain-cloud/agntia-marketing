# MKT-C04 — Twins y nomenclatura de procedencia

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/04-twins-y-nomenclatura-de-procedencia.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C03**; posterior: **C05**. Leer su documentación y estado antes de iniciar.

## Objetivo
Vincular ejecución local al agente canónico y preservar delegación/linaje.

## Dependencias
MKT-C03; gate anterior obligatorio cuando exista dependencia.

## Invariante
Persona, rol, runtime y mandato no son identidades intercambiables.

## Artefactos planeados (NO creados todavía)
- `packages/domain/twin-binding.ts`
- `docs/native-lineage-map.md`
- `tests/twins.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C04-T01** — Mapear Actor.kind/id/tenantId y roleId/runtimeId/personaId/kernelTurnId según tipo.
   - Aceptación: AgentActor.id conserva runtimeId sin nuevo canonicalAgentId supuesto.
2. **MKT-C04-T02** — Definir TwinBinding como DTO nuevo versionado del servicio.
   - Aceptación: Referencias canónicas, instancia local y configuración recuperables.
3. **MKT-C04-T03** — Definir mandato entre tenant de origen y targetTenantId.
   - Aceptación: No reescribir Actor.tenantId para simular membresía del cliente.
4. **MKT-C04-T04** — Aplicar capability/resource/purpose/budget/expiry/revocación al twin.
   - Aceptación: Caducar mandato bloquea efectos y conserva historial.
5. **MKT-C04-T05** — Preservar provenance.source/actor/updatedAt/confidence y extensiones explícitas.
   - Aceptación: Modelo no fabrica evidencia ni atribuye su texto al humano.
6. **MKT-C04-T06** — Vincular assignedBy/assignedTo, requestId, tareas, artefactos y causalidad.
   - Aceptación: Delegante/ejecutor y fuente original reconstruibles.
7. **MKT-C04-T07** — Probar revisión canónica obsoleta y separación de memorias por cliente.
   - Aceptación: Misma persona no comparte contexto privado entre tenants.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C04-G01** Twin con nombre marketing pero sin capability no prepara envío autorizado.
- **MKT-C04-G02** Sesión AV mantiene mandato vencido: PEP bloquea efectos nuevos.

## Tres handoffs
- [Freebuff — implementación](HANDOFF-FREEBUFF.md)
- [Codex — revisión independiente](HANDOFF-CODEX.md)
- [Senior architect + founder](HANDOFF-ARCHITECT-FOUNDER.md)

## Obligatorio antes de READY
- [ ] Inventario de rutas exactas EXISTENTES verificado al SHA y rutas NUEVAS explícitas.
- [ ] Interfaces, schemas, funciones y semántica del padre verificados.
- [ ] Patchsets numerados con archivos, imports/exports, wiring, tests y rollback.
- [ ] Dependencias y superficies de escritura sin conflicto.
- [ ] Pruebas positivas/negativas y comandos concretos, sin falsos PASS.
- [ ] Handoffs individualizados, sin decisiones arquitectónicas pendientes.
- [ ] Revisión y aprobación humana del alcance.

## Evidencia y rollback
- SHA/diff y entorno/versiones/licencias
- Tests reales con passed/failed/skipped y motivo
- Fixture inicial/final y protected state
- Receipts/refs/correlación sanitizados sin PII/secrets
- Riesgos/coste y siguiente gate

Rollback previsto por manifiesto: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
