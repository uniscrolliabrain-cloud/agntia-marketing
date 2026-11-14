# MKT-C03 — Supabase JWT y principal verificado

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/03-supabase-jwt-y-principal-verificado.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C02**; posterior: **C04**. Leer su documentación y estado antes de iniciar.

## Objetivo
Autenticar todos los modos y resolver tenant desde autoridad confiable.

## Dependencias
MKT-C02; gate anterior obligatorio cuando exista dependencia.

## Invariante
Firma válida sin membership/scope no concede acceso empresarial.

## Artefactos planeados (NO creados todavía)
- `packages/auth/`
- `tests/security/jwt.test.ts`
- `docs/auth-contract.md`

## Tareas originales a descomponer en patchsets
1. **MKT-C03-T01** — Fijar issuer/audience/proyecto/JWKS y algoritmos en servidor.
   - Aceptación: Token no elige host de claves ni configuración de confianza.
2. **MKT-C03-T02** — Verificar firma, exp/nbf, tolerancia, rotación y caché acotada.
   - Aceptación: JWKS caído o algoritmo inválido no activa fallback.
3. **MKT-C03-T03** — Resolver sub a usuario activo y tenant a membership provisionada.
   - Aceptación: user_metadata no autoriza ni crea membership implícita.
4. **MKT-C03-T04** — Conservar tenantId opaco y roles/capacidades de servidor.
   - Aceptación: authenticated no equivale a owner ni marketer.
5. **MKT-C03-T05** — Aplicar ACL de proyecto/recurso/campo a principal.
   - Aceptación: Usuario válido no ve listas completas por compartir tenant.
6. **MKT-C03-T06** — Definir credencial privada de worker y mandato originado por principal.
   - Aceptación: No falsificar JWT humano o guardarlo indefinidamente.
7. **MKT-C03-T07** — Probar claims manipulados, suspensión y cambio de tenant.
   - Aceptación: 401/403/404 consistentes, sin metadatos de otros clientes.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C03-G01** JWT de otro proyecto o tenant_idB en sesiónA se rechaza.
- **MKT-C03-G02** Revocar membership con job en cola impide el siguiente efecto.

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
