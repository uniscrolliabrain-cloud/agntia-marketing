# MKT-C19 — Journeys y motor de campañas

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/19-journeys-y-motor-de-campanas.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C18**; posterior: **C20**. Leer su documentación y estado antes de iniciar.

## Objetivo
Ejecutar workflows por FSM versionada con límites de reentrada.

## Dependencias
MKT-C18; gate anterior obligatorio cuando exista dependencia.

## Invariante
El LLM propone el grafo, el runtime decide transiciones y efectos.

## Artefactos planeados (NO creados todavía)
- `packages/journeys/`
- `packages/campaign-state/`
- `tests/journey-fsm.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C19-T01** — Definir steps/guards/actions nominadas, versiones y validación DAG/ciclos permitidos.
   - Aceptación: No step HTTP/SQL/shell arbitrario.
2. **MKT-C19-T02** — Definir enrollment, ventanas, timezone y propósito por paso.
   - Aceptación: Evento recibido no concede permiso de contacto.
3. **MKT-C19-T03** — Implementar simulación local sin IO remoto o envío.
   - Aceptación: Preview de journey no activa cron/provider.
4. **MKT-C19-T04** — Persistir run/step/subject/iteration con CAS e idempotencia.
   - Aceptación: Replay/reentrada no duplican paso efectuado.
5. **MKT-C19-T05** — Revalidar mandato, policy, elegibilidad y caps en cada paso.
   - Aceptación: Permiso inicial no vale indefinidamente.
6. **MKT-C19-T06** — Definir pausa/cancel/timeout/handoff y estado de mensajes en vuelo.
   - Aceptación: Pause requested no se anuncia como recall completado.
7. **MKT-C19-T07** — Probar DST, reinicio, cambios de versión y ramas concurrentes.
   - Aceptación: Historia original y nueva revisión se conservan sin efectos extra.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C19-G01** Ciclo de nurture sin máximo de pasos/reentrada se rechaza.
- **MKT-C19-G02** Baja en paso2 cancela siguientes efectos aunque run siga almacenado.

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
