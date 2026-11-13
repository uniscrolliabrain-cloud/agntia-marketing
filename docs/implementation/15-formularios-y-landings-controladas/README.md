# MKT-C15 — Formularios y landings controladas

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/15-formularios-y-landings-controladas.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C14**; posterior: **C16**. Leer su documentación y estado antes de iniciar.

## Objetivo
Recoger datos mínimos y proponer cambios web revisables.

## Dependencias
MKT-C14; gate anterior obligatorio cuando exista dependencia.

## Invariante
Publicar página y activar tracking son efectos distintos de guardar un borrador.

## Artefactos planeados (NO creados todavía)
- `packages/landings/`
- `packages/forms/`
- `tests/landing-intake.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C15-T01** — Definir plantilla/HTML permitido y derechos de assets.
   - Aceptación: Scripts/iframes/URLs arbitrarios no pasan por contenido LLM.
2. **MKT-C15-T02** — Definir formulario mínimo con notice/purpose/version y consentimiento separado.
   - Aceptación: Casillas no preaceptan promoción por enviar consulta.
3. **MKT-C15-T03** — Provisionar binding dominio/proyecto/tenant por servidor.
   - Aceptación: Visitante no dirige datos a otro tenant desde hidden field.
4. **MKT-C15-T04** — Aplicar Supabase/capacidad de intake limitada y antiabuso.
   - Aceptación: Registro no crea membership ni acceso interior.
5. **MKT-C15-T05** — Crear preview/diff con audiencia/copy/links/UTM y política tags.
   - Aceptación: Sin deploy o pixels al previsualizar.
6. **MKT-C15-T06** — Definir adaptador CMS opcional nominativo con aprobación de cambio.
   - Aceptación: No tocar repo agente ni deploy producción desde este plan.
7. **MKT-C15-T07** — Probar móvil/accesibilidad, CSV/HTML injection y doble submit.
   - Aceptación: Un intake deduplicado y aviso/versión recuperables.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C15-G01** Formulario recopila email para recurso y no inscribe automáticamente a newsletter.
- **MKT-C15-G02** Landing incluye tag remoto no aprobado: publicación bloqueada.

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
