# MKT-C10 — Taxonomía y contrato de medición de eventos

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/10-taxonomia-y-contrato-de-medicion-de-eventos.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C09**; posterior: **C11**. Leer su documentación y estado antes de iniciar.

## Objetivo
Capturar hechos con finalidad, dedup y definición estable.

## Dependencias
MKT-C09; gate anterior obligatorio cuando exista dependencia.

## Invariante
Evento observado no es persona única, venta ni causalidad por defecto.

## Artefactos planeados (NO creados todavía)
- `packages/measurement/events/`
- `docs/event-taxonomy.md`
- `tests/event-ingestion.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C10-T01** — Definir eventos/propiedades allowlist, purpose y data classification.
   - Aceptación: No credenciales/email/PII en URLs/UTM o bus.
2. **MKT-C10-T02** — Verificar ingreso/webhook/binding y antiabuso.
   - Aceptación: Evento no autenticado no cambia campaign state o enroll sin regla.
3. **MKT-C10-T03** — Definir occurredAt/receivedAt, timezone y IDs de dedup.
   - Aceptación: Replay/tardío genera proyección correcta y nueva revisión si corresponde.
4. **MKT-C10-T04** — Crear Observation con unidad/agregación/ventana/config fuente.
   - Aceptación: Missing/zero/stale/censored permanecen distintos.
5. **MKT-C10-T05** — Definir ConversionFact con referencia negocio y ajustes.
   - Aceptación: Plataforma atribuida no crea venta financiera duplicada.
6. **MKT-C10-T06** — Configurar tracking/privacy por política sin tags ocultos.
   - Aceptación: Formulario/landing no activa pixels automáticamente.
7. **MKT-C10-T07** — Probar duplicados, bot traffic, clock skew y permisos retirados.
   - Aceptación: No se incrementa un KPI ni identifica persona fuera de alcance.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C10-G01** Dos plataformas atribuyen misma order: ConversionFact no duplica ingreso.
- **MKT-C10-G02** Consentimiento de analítica retirado no se suplanta con captura server-side.

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
