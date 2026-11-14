# MKT-C02 — Dominio, autoridad y modelo SaaS

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/02-dominio-autoridad-y-modelo-saas.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C01**; posterior: **C03**. Leer su documentación y estado antes de iniciar.

## Objetivo
Separar operador, tenants, marcas, personas y responsables del efecto.

## Dependencias
MKT-C01; gate anterior obligatorio cuando exista dependencia.

## Invariante
Servicio solapado no implica dos ejecutores para el mismo efecto.

## Artefactos planeados (NO creados todavía)
- `docs/domain-model.md`
- `docs/authority-map.md`
- `docs/adr/002-boundaries.md`

## Tareas originales a descomponer en patchsets
1. **MKT-C02-T01** — Modelar operadorP, tenantsA/B y proyectos/marcas por tenant.
   - Aceptación: Misma marca o dominio no fusiona seguridad.
2. **MKT-C02-T02** — Distinguir persona de audiencia, Contact, usuario Supabase y membership.
   - Aceptación: Importar una lista no crea usuarios autorizados.
3. **MKT-C02-T03** — Definir AuthorityMap por campo, workflow y canal.
   - Aceptación: CRM/marketing/redes tienen decisiones y conflictos explícitos.
4. **MKT-C02-T04** — Definir ServiceAgreement/WorkOrder y aceptación de entregables.
   - Aceptación: Contratar servicio no autoriza gasto/envío/grabación automáticamente.
5. **MKT-C02-T05** — Documentar portal externo con equipo canónico vinculado al padre.
   - Aceptación: Cliente no necesita UI AgntiaPro ni existe registro agéntico soberano.
6. **MKT-C02-T06** — Acotar piloto email-sink/lecturas/ads test sin dinero real.
   - Aceptación: Mutaciones futuras de producción requieren autorización posterior.
7. **MKT-C02-T07** — Crear fixtures de delegación, proyecto compartido y competencia de emisores.
   - Aceptación: Toda acción tiene un responsable y prueba de alcance.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C02-G01** Padre y Mautic intentan emitir mismo mensaje: un intent o conflicto, no duplicado.
- **MKT-C02-G02** Colaborador de marcaX intenta abrir proyectoY sin permiso.

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
