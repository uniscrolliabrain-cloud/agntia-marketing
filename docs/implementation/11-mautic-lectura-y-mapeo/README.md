# MKT-C11 — Mautic lectura y mapeo

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/11-mautic-lectura-y-mapeo.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C10**; posterior: **C12**. Leer su documentación y estado antes de iniciar.

## Objetivo
Verificar backend de contactos/segmentos por instancia autorizada.

## Dependencias
MKT-C10; gate anterior obligatorio cuando exista dependencia.

## Invariante
API disponible no prueba aislamiento multitenant de la instalación.

## Artefactos planeados (NO creados todavía)
- `packages/adapters/mautic/read.ts`
- `docs/adapters/mautic.md`
- `tests/integration/mautic-read.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C11-T01** — Fijar release/imagen/licencia y resolver inconsistencia de docs.
   - Aceptación: SHA de rama observada no se usa como pin de producción sin validar.
2. **MKT-C11-T02** — Validar binding tenant→instancia/contexto y cuenta bot mínima.
   - Aceptación: Si compartido no es seguro, exigir instancia dedicada.
3. **MKT-C11-T03** — Descubrir API habilitada/campos/permisos/edición reales.
   - Aceptación: No modificar configuración del padre o proveedor producción para pasar gate.
4. **MKT-C11-T04** — Leer contactos/segmentos/preferencias con fields y paginación cerrados.
   - Aceptación: No descargar todo con admin para filtrar después.
5. **MKT-C11-T05** — Mapear do-not-contact, identidades y fechas con provenance.
   - Aceptación: Falta de campo de permiso produce unknown, no eligible.
6. **MKT-C11-T06** — Crear staging/links y conflicto por cambios remotos.
   - Aceptación: Campo revisado no se pisa por último escritor.
7. **MKT-C11-T07** — Probar dos instancias/roles,1000+ registros y ausencia API.
   - Aceptación: Mocks separados de capacidad real, sin activar campaigns.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C11-G01** Token de instanciaB en conexiónA no lista contactos deB.
- **MKT-C11-G02** Mautic API deshabilitada produce unsupported, sin scraping fallback.

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
