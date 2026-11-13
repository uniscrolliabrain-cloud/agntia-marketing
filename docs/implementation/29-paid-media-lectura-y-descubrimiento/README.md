# MKT-C29 — Paid media lectura y descubrimiento

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/29-paid-media-lectura-y-descubrimiento.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Preparar informes/propuestas de ads sin habilitar compras.

Dependencias: MKT-C28.

Invariante: Acceso a cuenta/reportes no autoriza mutación, customer-match o billing.

## Artefactos previstos (no creados)
- `packages/adapters/google-ads/read.ts`
- `packages/adapters/meta-ads/read.ts`
- `docs/ads-capabilities.md`

## Tareas por descomponer
- **MKT-C29-T01** Verificar documentación/scopes/versión y credenciales aprobadas. — **aceptación:** Meta429 mantiene actual verificación pendiente, no ejemplo heredado.
- **MKT-C29-T02** Validar tenant→ad account/manager/currency/timezone. — **aceptación:** Cuenta hija de otro cliente no se descubre como fallback.
- **MKT-C29-T03** Implementar consultas nominadas de rendimiento con fields cerrados. — **aceptación:** No GAQL/query arbitraria del modelo.
- **MKT-C29-T04** Preservar definiciones de conversión/atribución/ventana y data lag. — **aceptación:** No sumar ventas atribuidas entre plataformas.
- **MKT-C29-T05** Descubrir límites de test accounts/reporting y capacidades. — **aceptación:** Fake performance no se presenta como dataset de campaña real.
- **MKT-C29-T06** Crear propuestas de creativo/targeting/presupuesto en DTO local. — **aceptación:** Sin mutation/upload audiencia/offline conversions por leer.
- **MKT-C29-T07** Probar revocación, rate-limit, cuentaB y payload grande. — **aceptación:** Lectura falla segura y no activa anuncios.

## Gates por ejecutar
- MKT-C29-G01: Tool ads_read solicita billing/mutate: capability denegada antes de HTTP.
- MKT-C29-G02: Datos atribuidos duplicados de Meta/Google no se convierten en ingreso único sumado.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
