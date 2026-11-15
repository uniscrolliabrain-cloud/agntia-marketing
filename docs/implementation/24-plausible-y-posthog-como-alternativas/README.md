# MKT-C24 — Plausible y PostHog como alternativas

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/24-plausible-y-posthog-como-alternativas.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Añadir analítica opcional sin equiparar Cloud, CE y permisos.

Dependencias: MKT-C23.

Invariante: Privacy-first y licencia base no garantizan todas funciones o configuración segura.

## Artefactos previstos (no creados)
- `packages/adapters/plausible/`
- `packages/adapters/posthog/`
- `tests/analytics-alternatives.test.ts`

## Tareas por descomponer
- **MKT-C24-T01** Revisar edición/versiones/operación y licencias mixtas. — **aceptación:** Stats API o Enterprise se habilitan solo si existen en instalación.
- **MKT-C24-T02** Validar binding tenant→site/project y roles. — **aceptación:** Proyecto con mismo nombre no se selecciona automáticamente.
- **MKT-C24-T03** Descubrir métricas/filtros y lectura nominada permitida. — **aceptación:** No SQL/HogQL libre, exports o admin tools al modelo.
- **MKT-C24-T04** Mapear métricas/eventos y freshness con fuente/versiones. — **aceptación:** Datos modelados/observados se distinguen si aplica.
- **MKT-C24-T05** Configurar replay/PII capture off hasta aprobación específica. — **aceptación:** Instalar adaptador de lectura no activa tracking nuevo.
- **MKT-C24-T06** Crear sync y conflictos de configuración/cobertura. — **aceptación:** Missing/unsupported no se rellena con cero.
- **MKT-C24-T07** Probar2proyectos, revisión de roles y límite de respuesta. — **aceptación:** Un adaptador opcional no probado permanece disabled.

## Gates por ejecutar
- MKT-C24-G01: Plausible CE no expone operación Cloud requerida: unsupported, no scraping.
- MKT-C24-G02: PostHog replay captura PII por default heredado: bloquear hasta configuración revisada.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
