# MKT-C07 — Bases de tratamiento, supresión y preferencias

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/07-bases-de-tratamiento-supresion-y-preferencias.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C06**; posterior: **C08**. Leer su documentación y estado antes de iniciar.

## Objetivo
Modelar elegibilidad de contacto y tracking sin ampliar permisos.

## Dependencias
MKT-C06; gate anterior obligatorio cuando exista dependencia.

## Invariante
Contactar, rastrear, grabar y entrenar son finalidades separadas.

## Artefactos planeados (NO creados todavía)
- `packages/privacy/`
- `packages/eligibility/`
- `tests/consent.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C07-T01** — Definir propósitos y bases con revisión humana/contextual.
   - Aceptación: No usar consent=true universal para todos los flujos.
2. **MKT-C07-T02** — Crear ledger grant/withdraw/restriction con prueba/versiones.
   - Aceptación: Estado actual se reconstruye sin borrar historia.
3. **MKT-C07-T03** — Definir preferencias por sujeto/canal/marca/purpose según contrato.
   - Aceptación: Buzón compartido no traslada permiso entre personas.
4. **MKT-C07-T04** — Integrar supresión/oposiciones del padre o custodio mediante contrato.
   - Aceptación: Lead aceptado no implica permission marketing.
5. **MKT-C07-T05** — Configurar política de tags/cookies y señales técnicas separadas.
   - Aceptación: Consent Mode/cookie-free no habilitan tracking sin decisión aplicable.
6. **MKT-C07-T06** — Revalidar elegibilidad justo antes del efecto con política de frescura.
   - Aceptación: Dato stale/unknown bloquea, no supone autorización.
7. **MKT-C07-T07** — Probar retirada en cola, cambio de finalidad y sincronización tardía.
   - Aceptación: No se añaden miembros ni se ignoran bajas por caché.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C07-G01** Persona retira permiso entre approval y dispatch: bloqueada para efectos nuevos.
- **MKT-C07-G02** Consentimiento AV intenta habilitar audience upload o newsletter: denegado.

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
