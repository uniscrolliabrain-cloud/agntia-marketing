# MKT-C18 — Segmentación y audiencia máxima

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/18-segmentacion-y-audiencia-maxima.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C17**; posterior: **C19**. Leer su documentación y estado antes de iniciar.

## Objetivo
Crear reglas cerradas y snapshots de elegibilidad que no se amplíen solos.

## Dependencias
MKT-C17; gate anterior obligatorio cuando exista dependencia.

## Invariante
Regla dinámica no amplía el máximo de personas aprobado.

## Artefactos planeados (NO creados todavía)
- `packages/audiences/`
- `packages/segmentation/`
- `tests/audience-freeze.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C18-T01** — Definir DSL tipada con campos/operadores allowlist y límites.
   - Aceptación: No SQL/query libre del LLM ni joins fuera de scope.
2. **MKT-C18-T02** — Aplicar purpose/base/identidad/supresión antes de segmentar.
   - Aceptación: Dato unknown no se interpreta elegible.
3. **MKT-C18-T03** — Crear preview de counts/exclusiones y prueba mínima de selección.
   - Aceptación: No exportar emails al modelo para explicar un conteo.
4. **MKT-C18-T04** — Congelar miembros reales, watermark, regla y policyVersion.
   - Aceptación: Hash de query solo no basta como snapshot.
5. **MKT-C18-T05** — Definir revalidación que puede reducir pero no ampliar población.
   - Aceptación: Nuevo elegible necesita nueva revisión/approval.
6. **MKT-C18-T06** — Validar cardinalidad cross-project, dedup y fatiga global autorizada.
   - Aceptación: Misma persona no recibe dos mensajes por alias si política lo prohíbe.
7. **MKT-C18-T07** — Probar datos tardíos, retirada y cambio de regla concurrentes.
   - Aceptación: Estado aprobado conserva su máximo y evidencia de exclusiones.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C18-G01** Añadir100 nuevos contactos al segmento remoto tras approval no los incluye.
- **MKT-C18-G02** Cambiar atributo sensible en regla se rechaza antes de consulta.

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
