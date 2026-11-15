# MKT-C16 — Marca, assets y evidencia de claims

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/16-marca-assets-y-evidencia-de-claims.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C15**; posterior: **C17**. Leer su documentación y estado antes de iniciar.

## Objetivo
Producir materiales con derechos y fuentes revisables.

## Dependencias
MKT-C15; gate anterior obligatorio cuando exista dependencia.

## Invariante
Un modelo no inventa testimonios, licencias o soporte de afirmaciones.

## Artefactos planeados (NO creados todavía)
- `packages/brand-policy/`
- `packages/assets/`
- `packages/claims/`

## Tareas originales a descomponer en patchsets
1. **MKT-C16-T01** — Importar BrandPolicySnapshot de branding o módulo local autorizado.
   - Aceptación: Versión/custodio/derechos, no solo prompt de tono.
2. **MKT-C16-T02** — Crear ledger de assets/licencias/releases de personas.
   - Aceptación: Ausencia de derechos bloquea publicación aunque asset se vea en internet.
3. **MKT-C16-T03** — Definir ClaimEvidence con soporte/contradicción/vigencia.
   - Aceptación: Número o cita fabricados quedan unverified.
4. **MKT-C16-T04** — Generar variantes ES/EN/FR con fuentes y locale.
   - Aceptación: Traducción preserva importes, límites y disclaimers revisados.
5. **MKT-C16-T05** — Crear QA de formato/legibilidad/destino y contenido regulado.
   - Aceptación: Visión/LLM detectan posibles problemas pero no otorgan permiso.
6. **MKT-C16-T06** — Vincular revisiones de creativo/rights al approval hash.
   - Aceptación: Cambio de imagen/texto/claim invalida aprobación material.
7. **MKT-C16-T07** — Probar archivo adversarial, fuente caducada y derechos revocados.
   - Aceptación: Se bloquea nuevo efecto y conserva versión histórica.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C16-G01** IA inventa caso de éxito o beneficio médico: no habilita CreativeRevision publicable.
- **MKT-C16-G02** Revocar licencia entre preview y dispatch impide uso nuevo del asset.

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
