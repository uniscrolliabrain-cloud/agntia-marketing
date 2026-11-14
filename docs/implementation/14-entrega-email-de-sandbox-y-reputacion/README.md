# MKT-C14 — Entrega email de sandbox y reputación

**Estado: SCAFFOLD / NOT_IMPLEMENTATION_READY.** Esta carpeta es un punto de partida derivado del manifiesto existente, **no** una campaña ultr granular final. No ejecutar código hasta cerrar inventario de archivos y patchsets específicos.

## Contexto y lectura obligatoria
- [Protocolo global](../../OPERACION-PIPELINE-3-AGENTES.md)
- [Léxico canónico](../../LEXICO-CANONICO-AGENTE-MARKETING.md)
- [Guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md)
- [Campaña original](../../campaigns/14-entrega-email-de-sandbox-y-reputacion.md)
- [Manifiesto](../../campaigns/campaign.json)
- Campaña anterior: **C13**; posterior: **C15**. Leer su documentación y estado antes de iniciar.

## Objetivo
Crear primer camino de efecto verificable y autoridad única.

## Dependencias
MKT-C13; gate anterior obligatorio cuando exista dependencia.

## Invariante
Ningún correo real fuera de destinatarios sandbox se usa para pasar pruebas.

## Artefactos planeados (NO creados todavía)
- `packages/channels/email/`
- `docs/email-sandbox.md`
- `tests/email-delivery.test.ts`

## Tareas originales a descomponer en patchsets
1. **MKT-C14-T01** — Asignar un único emisor entre padre/backend/canal local por intent.
   - Aceptación: Una petición duplicada no invoca dos transportes.
2. **MKT-C14-T02** — Configurar sink local y allowlist de destinos de prueba.
   - Aceptación: Destino no sandbox bloqueado antes de HTTP/SMTP.
3. **MKT-C14-T03** — Definir remitente/headers/links y sanitización HTML/adjuntos.
   - Aceptación: CRLF, scripts y receptor mutable rechazados.
4. **MKT-C14-T04** — Aplicar elegibilidad/supresión/caps justo antes de dispatch.
   - Aceptación: Backend no puede añadir suscriptores fuera del máximo.
5. **MKT-C14-T05** — Normalizar receipt accepted/sent/delivered/bounce/complaint.
   - Aceptación: Open/click no se declara entrega humana o compra.
6. **MKT-C14-T06** — Definir idempotencia y ventanas reales del transporte.
   - Aceptación: Ledger local no promete dedup remoto ilimitado.
7. **MKT-C14-T07** — Probar pérdida ACK, caída worker y fallback prohibido.
   - Aceptación: Un efecto o uncertainty visible, nunca nuevo envío desde otro backend.

## Escenarios de gate originales (NO ejecutados)
- **MKT-C14-G01** Proveedor aceptó pero cliente recibe timeout: no mandar de nuevo por Resend/padre.
- **MKT-C14-G02** Mensaje de prueba a dirección del owner no aprobada como sandbox se rechaza.

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
