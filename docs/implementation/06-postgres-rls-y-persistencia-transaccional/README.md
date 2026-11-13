# MKT-C06 — Postgres, RLS y persistencia transaccional

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/06-postgres-rls-y-persistencia-transaccional.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C05**; posterior: **C07**. Leer su documentación y estado antes de iniciar.

## Objetivo
Crear almacenamiento scoped con historia, índices y recovery.

## Dependencias
MKT-C05; gate anterior obligatorio cuando exista dependencia.

## Invariante
Relaciones, consultas y jobs conservan tenant; privilegio DB no reemplaza policy.

## Artefactos planeados (NO creados todavía)
- `packages/storage/`
- `migrations/`
- `tests/integration/storage.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C06-T01** — Diseñar tablas/FKs compuestas y ACL de proyectos/objetos.
   - Aceptación: Un intentA no referencia audienceSnapshotB por SQL.
2. **MKT-C06-T02** — Implementar migraciones versionadas con transacción/backup.
   - Aceptación: Fresh/upgrade/fallo parcial mantienen registros y audit.
3. **MKT-C06-T03** — Configurar RLS USING/WITH CHECK y roles API/worker reales.
   - Aceptación: Probar owner/BYPASSRLS/service_role, sin suposiciones.
4. **MKT-C06-T04** — Crear índices de external links, inbox e idempotency por ámbito.
   - Aceptación: Colisión de externalId entre proveedores/tenants no pisa objetos.
5. **MKT-C06-T05** — Persistir audit y payload de retención separada.
   - Aceptación: Correlación de intentos/denegaciones sin PII eterna en ledger.
6. **MKT-C06-T06** — Implementar CAS/versiones, outbox y locks/leases.
   - Aceptación: Commit local de estado/audit/outbox es indivisible.
7. **MKT-C06-T07** — Probar concurrencia, rollback y restore de fixtures.
   - Aceptación: Cursores/receipts no se pierden ni reactivan campañas.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C06-G01** INSERT/UPDATE de FK cross-tenant falla por API y DB con roles usados.
- **MKT-C06-G02** Caída en migración/commit no deja aprobación/intención parcial visible.

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
