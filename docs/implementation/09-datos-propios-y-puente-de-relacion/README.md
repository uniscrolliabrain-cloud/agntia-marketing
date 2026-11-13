# MKT-C09 — Datos propios y puente de relación

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/09-datos-propios-y-puente-de-relacion.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C08**; posterior: **C10**. Leer su documentación y estado antes de iniciar.

## Objetivo
Normalizar personas/fuentes sin crear permisos ni leads de forma implícita.

## Dependencias
MKT-C08; gate anterior obligatorio cuando exista dependencia.

## Invariante
Origen público o lead aceptado no demuestra identidad/permiso comercial.

## Artefactos planeados (NO creados todavía)
- `packages/customer-projections/`
- `packages/imports/`
- `tests/contact-sync.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C09-T01** — Definir campos permitidos, custodio y AuthorityMap por entidad.
   - Aceptación: Campo fiscal/sensible innecesario no se importa por comodidad.
2. **MKT-C09-T02** — Crear preview CSV/API con encoding/límites y saneado de fórmulas.
   - Aceptación: Import no ejecuta HTML/SQL ni crea memberships.
3. **MKT-C09-T03** — Mapear Contact/ChannelIdentity y source credit del padre.
   - Aceptación: placeId/ref/source preservados sin sustituir por dominio.
4. **MKT-C09-T04** — Persistir ExternalLink/hash/mapperVersion y staging revisable.
   - Aceptación: Misma carga no duplica; cambios revisados generan conflicto.
5. **MKT-C09-T05** — Definir aliases/duplicados como propuestas humanas.
   - Aceptación: Homónimos/buzones compartidos no se fusionan automáticamente.
6. **MKT-C09-T06** — Implementar cursor estable/overlap y watermark tras commit.
   - Aceptación: Reorder/empate/fallo de lote no pierde objetos ni aparenta éxito completo.
7. **MKT-C09-T07** — Probar1000+ registros sintéticos, bajas y resync.
   - Aceptación: Totales/contenido se reconcilian por fuente, no solo cantidad.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C09-G01** CSV incluye tenant_id/owner y consent=true sin prueba: no concede permisos.
- **MKT-C09-G02** LeadCandidate se importa como público pero no entra a un journey.

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
