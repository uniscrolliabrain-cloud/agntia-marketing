# MKT-C30 — Ads en test accounts y borradores controlados

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/30-ads-en-test-accounts-y-borradores-controlados.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Validar propuestas con proveedores de prueba sin gasto/producción.

Dependencias: MKT-C29.

Invariante: No lanzar campañas, activar billing o gastar medios de clientes en esta campaña.

## Artefactos previstos (no creados)
- `packages/ads-test/`
- `docs/paid-activation-boundary.md`
- `tests/integration/ads-sandbox.test.ts`

## Tareas por descomponer
- **MKT-C30-T01** Definir allowlist de cuentas exclusivamente test y credenciales separadas. — **aceptación:** Cuenta producción se rechaza incluso si token tiene acceso.
- **MKT-C30-T02** Descubrir validate_only por método admitido y semántica de errors. — **aceptación:** No inventar garantía universal de dry-run para cualquier API.
- **MKT-C30-T03** Crear preview con creativo, audience/targeting, moneda, límites y riesgos. — **aceptación:** Una propuesta de budget no es aprobación de compra.
- **MKT-C30-T04** Vincular autorización humana y expectedVersion a validación/write test. — **aceptación:** LLM no puede elevar test a ejecución real.
- **MKT-C30-T05** Crear borrador/paused solo si estado y atomicidad están probados. — **aceptación:** No defaults enabled o activación por otra entidad.
- **MKT-C30-T06** Reconciliar timeout/partial_failure sin borrar o duplicar objetos. — **aceptación:** Error por operación conserva resultado parcial explícito.
- **MKT-C30-T07** Documentar gates de producción pendientes y no probados en test. — **aceptación:** Performance/overdelivery reales requieren otro encargo y entorno autorizado.

## Gates por ejecutar
- MKT-C30-G01: Cambiar testAccountId por cuenta real bloquea antes de mutar.
- MKT-C30-G02: Timeout de creación paused no se reintenta con nueva key creando duplicado.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
