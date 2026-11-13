# MKT-C05 — Contratos tipados y validación de frontera

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/05-contratos-tipados-y-validacion-de-frontera.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C04**; posterior: **C06**. Leer su documentación y estado antes de iniciar.

## Objetivo
Definir DTOs y errores antes de conectar proveedores.

## Dependencias
MKT-C04; gate anterior obligatorio cuando exista dependencia.

## Invariante
DTO nuevo del servicio y tipo nativo del host se mapean explícitamente.

## Artefactos planeados (NO creados todavía)
- `packages/contracts/`
- `docs/api-design.md`
- `tests/contracts.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C05-T01** — Definir IDs opacos, Money string/currency, fechas y límites.
   - Aceptación: Round-trip rechaza NaN/float ambiguo/fecha inválida/campos extra.
2. **MKT-C05-T02** — Definir Brief, CreativeRevision, ClaimEvidence y BrandPolicy.
   - Aceptación: Objetivo/fuente/rights no quedan solo en prompt libre.
3. **MKT-C05-T03** — Definir AudienceRule/Snapshot y EligibilityDecision.
   - Aceptación: Máximo aprobado liga miembros reales y finalidad, no solo query.
4. **MKT-C05-T04** — Definir ApprovalBinding, Intent, Job, Conflict y ExternalLink.
   - Aceptación: Outcome_unknown no se serializa como éxito o retryable seguro.
5. **MKT-C05-T05** — Definir Observation, ConversionFact, MeasurementClaim y ExperimentSpec.
   - Aceptación: Atribuido/descriptivo/causal son tipos distinguibles.
6. **MKT-C05-T06** — Generar JSON Schema y fixtures públicos sin secretos.
   - Aceptación: SchemaVersion propio no se confunde con SystemEvent string1.0.
7. **MKT-C05-T07** — Probar límites, discriminantes y compatibilidad SDK/backend.
   - Aceptación: Rechazo consistente en todas las interfaces, no solo frontend.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C05-G01** Payload incluye SQL/model/method/baseURL y scope arbitrario: rechazado.
- **MKT-C05-G02** Conversiones atribuidas intentan serializarse como ventas causales: contrato exige tipo/fuente.

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
