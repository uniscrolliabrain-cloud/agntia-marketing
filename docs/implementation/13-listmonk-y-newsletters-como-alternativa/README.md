# MKT-C13 — Listmonk y newsletters como alternativa

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/13-listmonk-y-newsletters-como-alternativa.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C12**; posterior: **C14**. Leer su documentación y estado antes de iniciar.

## Objetivo
Adaptar listas/campañas con aislamiento y pruebas de efecto.

## Dependencias
MKT-C12; gate anterior obligatorio cuando exista dependencia.

## Invariante
Endpoint test envía realmente; listas/permisos no prueban tenancy por sí solos.

## Artefactos planeados (NO creados todavía)
- `packages/adapters/listmonk/`
- `docs/adapters/listmonk.md`
- `tests/integration/listmonk.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C13-T01** — Fijar versión/licencia e instancia/DB por tenant inicialmente si hace falta.
   - Aceptación: Aislamiento demostrado con roles usados.
2. **MKT-C13-T02** — Descubrir lectura/campos/permisos de listas/subscribers/campaigns.
   - Aceptación: Usuario limitado no ve listas ajenas.
3. **MKT-C13-T03** — Mapear estado/datos/identidad y no publicar archive automáticamente.
   - Aceptación: Archivo web se trata como efecto independiente.
4. **MKT-C13-T04** — Implementar preview local y draft remoto explícito en laboratorio.
   - Aceptación: Test endpoint no se llama como previsualización.
5. **MKT-C13-T05** — Congelar destinatarios máximos y reconciliar supresiones frescas.
   - Aceptación: Lista dinámica no amplía aprobados.
6. **MKT-C13-T06** — Crear writeback controlado con ledger y búsqueda/reconciliación verificadas.
   - Aceptación: Cambiar status no se reintenta a ciegas.
7. **MKT-C13-T07** — Probar envíos solo a sink/allowlist y pausa/cancel/replay.
   - Aceptación: Historial distingue aceptado, enviado e incierto.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C13-G01** Tool intenta POST campaign/test a email libre: denegado por policy.
- **MKT-C13-G02** Publicar archive con datos personales no sucede al crear newsletter.

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
