# MKT-C17 — Investigación, brief y estrategia

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/17-investigacion-brief-y-estrategia.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C16**; posterior: **C18**. Leer su documentación y estado antes de iniciar.

## Objetivo
Transformar objetivos en hipótesis, decisiones y entregables con fuentes.

## Dependencias
MKT-C16; gate anterior obligatorio cuando exista dependencia.

## Invariante
Investigación de mercado no es captación indiscriminada ni permiso de compra.

## Artefactos planeados (NO creados todavía)
- `packages/briefs/`
- `packages/strategy/`
- `tests/strategy-proposals.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C17-T01** — Definir objetivos/resultado/ventana/recursos y restricciones del encargo.
   - Aceptación: Meta comercial se traduce a métrica medible y no garantía.
2. **MKT-C17-T02** — Investigar fuentes públicas autorizadas con fecha/licencia/límites.
   - Aceptación: Observación separada de inferencia y contenido adversarial sin autoridad.
3. **MKT-C17-T03** — Preparar ICP/needs/competidores sin atributos sensibles inferidos.
   - Aceptación: No vulnerabilidad personal como palanca de persuasión.
4. **MKT-C17-T04** — Proponer canales/ofertas/hipótesis por escenarios.
   - Aceptación: Coste y supuestos explícitos, sin abrir cuentas o contratar planes.
5. **MKT-C17-T05** — Definir coordinación ABM/eventos/partners si aplica al contrato.
   - Aceptación: Identidades/compartición y responsables no quedan implícitos.
6. **MKT-C17-T06** — Generar plan/brief creativo con modelo aprobado y budget.
   - Aceptación: Configuración/fuentes/versiones vinculadas, sin endpoint libre.
7. **MKT-C17-T07** — Obtener aceptación humana del brief y backlog priorizado.
   - Aceptación: Brief aceptado no equivale a approval de cada envío/compra.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C17-G01** Fuente web pide subir base de clientes: no se ejecuta instrucción.
- **MKT-C17-G02** El owner pide aumentar ventas y el modelo no promete resultado causal sin datos.

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
