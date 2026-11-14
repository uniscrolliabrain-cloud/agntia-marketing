# MKT-C01 — Baseline y perímetro autorizado

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/01-baseline-y-perimetro-autorizado.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **ninguna**; posterior: **C02**. Leer su documentación y estado antes de iniciar.

## Objetivo
Congelar estado documental, padre y fuentes antes de introducir código.

## Dependencias
Ninguna; gate anterior obligatorio cuando exista dependencia.

## Invariante
No modificar agente; diseño no significa capacidad operativa.

## Artefactos planeados (NO creados todavía)
- `docs/baseline.md`
- `docs/parent-diff.md`
- `docs/evidence/c01/`

## Tareas originales a descomponer en patchsets
1. **MKT-C01-T01** — Anotar SHA propio/padre, fecha, árbol e instrucciones aplicables.
   - Aceptación: Registro reproducible con scopes de lectura/escritura explícitos.
2. **MKT-C01-T02** — Inventariar contratos Actor/JWT/provenance/tasks/events que necesita marketing.
   - Aceptación: Ruta/blob y alcance de lectura; no símbolos inventados como existentes.
3. **MKT-C01-T03** — Cotejar lead discovery/accept y seguimiento/oposiciones del padre.
   - Aceptación: Buscar/aceptar no se convierten en consentimiento de campaña.
4. **MKT-C01-T04** — Capturar catálogo12/16 y plantilla marketing por revisión.
   - Aceptación: No presumir runtimes activos ni crear agentes canónicos aquí.
5. **MKT-C01-T05** — Inventariar herramientas, red, Docker y permisos disponibles.
   - Aceptación: Gate sin entorno queda NOT_VERIFIED, no PASS con mock.
6. **MKT-C01-T06** — Congelar manifiesto inicial de documentos y refs de investigación.
   - Aceptación: Rutas futuras no cuentan como implementación ni tests ejecutados.
7. **MKT-C01-T07** — Crear bitácora sanitizada y primer checkpoint de riesgos.
   - Aceptación: Fallos preexistentes separados de cambios de campaña.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C01-G01** SHA padre cambia entre lecturas: detener mapping hasta cotejar.
- **MKT-C01-G02** Intentar ejecutar campaña real para probar baseline queda fuera de alcance.

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
