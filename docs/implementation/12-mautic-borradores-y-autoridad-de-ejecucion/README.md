# MKT-C12 — Mautic borradores y autoridad de ejecución

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/12-mautic-borradores-y-autoridad-de-ejecucion.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C11**; posterior: **C13**. Leer su documentación y estado antes de iniciar.

## Objetivo
Preparar contactos/campañas sin activar side effects imprevistos.

## Dependencias
MKT-C11; gate anterior obligatorio cuando exista dependencia.

## Invariante
Crear/importar un contacto no debe disparar un workflow no aprobado.

## Artefactos planeados (NO creados todavía)
- `packages/adapters/mautic/write.ts`
- `docs/mautic-execution-boundary.md`
- `tests/mautic-drafts.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C12-T01** — Inventariar eventos/cron/plugins que pueden enviar tras cambios.
   - Aceptación: Test fixture demuestra ausencia de triggers colaterales.
2. **MKT-C12-T02** — Definir create/update allowlist y dry-run local de diff.
   - Aceptación: Sin write remoto en preview.
3. **MKT-C12-T03** — Vincular approval al contenido/audiencia/canal/estado y coste.
   - Aceptación: No autorización general al árbol completo de campaña.
4. **MKT-C12-T04** — Crear draft desactivado en sandbox con idempotency/link.
   - Aceptación: No scheduled/running por valor default o relación al segmento.
5. **MKT-C12-T05** — Verificar estado remoto y escritura incierta por refs fiables.
   - Aceptación: Sin lookup suficiente no hay retry automático.
6. **MKT-C12-T06** — Evaluar si el backend permite supresión y máximo congelado al enviar.
   - Aceptación: Si no, dispatch permanece bloqueado por esa ruta.
7. **MKT-C12-T07** — Probar import/replay, edición concurrente y plugin de prueba adversarial.
   - Aceptación: Ningún correo fuera del sink y audit completo.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C12-G01** Agregar contacto al segmento intentaría enviar por cron: gate bloquea ruta.
- **MKT-C12-G02** Timeout tras draft create no duplica campaña al reintentar.

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
