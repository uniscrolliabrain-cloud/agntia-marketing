# MKT-C08 — Registro, OAuth, secretos y discovery

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/08-registro-oauth-secretos-y-discovery.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C07**; posterior: **C09**. Leer su documentación y estado antes de iniciar.

## Objetivo
Conectar solo endpoints/admin y capacidades comprobadas por despliegue.

## Dependencias
MKT-C07; gate anterior obligatorio cuando exista dependencia.

## Invariante
El modelo no elige URL, token, cuenta o método remoto.

## Artefactos planeados (NO creados todavía)
- `packages/integrations/registry/`
- `packages/secrets/`
- `tests/discovery-egress.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C08-T01** — Crear conexiones tenant-scoped con endpointRef/secretRef y bindings.
   - Aceptación: No URL libre del owner final o del LLM.
2. **MKT-C08-T02** — Aplicar TLS/host/puerto allowlist, DNS/IP y bloqueo de redirects.
   - Aceptación: Metadata/private no aprobado/credenciales en URL se rechazan.
3. **MKT-C08-T03** — Implementar OAuth state/PKCE y callback ligado a tenant/proyecto.
   - Aceptación: SesiónB no conecta credencial aA.
4. **MKT-C08-T04** — Usar cuenta bot de mínimo privilegio y rotación sin perder links.
   - Aceptación: Permiso faltante no hace fallback admin.
5. **MKT-C08-T05** — Descubrir versión/edición/schema/campos y capacidades por operación.
   - Aceptación: 200 con HTML o schema erróneo no cuenta como healthy.
6. **MKT-C08-T06** — Guardar CapabilityReport con evidencia, expiry y causa sanitizada.
   - Aceptación: Unknown/forbidden/not_configured deshabilitan operación.
7. **MKT-C08-T07** — Probar tamaño/timeout/errores y centinelas secretos.
   - Aceptación: Token/DSN/PII no salen en logs, eventos o frontend.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C08-G01** ConexiónA usa site/accountB válido: binding bloquea antes de leer.
- **MKT-C08-G02** Cambio de edición/rol invalida report de capacidad antes del write.

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
