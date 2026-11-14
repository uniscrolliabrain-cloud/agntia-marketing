# MKT-C36 — Portal responsive y sesiones Anam

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/36-portal-responsive-y-sesiones-anam.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Construir experiencia revisable para cliente integrado o externo.

Dependencias: MKT-C35.

Invariante: AV es presencia del twin, no identidad, firma o permiso de compra.

## Artefactos previstos (no creados)
- `apps/portal/`
- `packages/presence/anam/`
- `tests/browser/portal-anam.test.ts`

## Tareas por descomponer
- **MKT-C36-T01** Diseñar vistas owner/marketer/revisor/colaborador con scope visible. — **aceptación:** Listas y datos sensibles no se muestran por defecto.
- **MKT-C36-T02** Construir chat lateral desktop/panel móvil y flujo de edición/revisión. — **aceptación:** Teclado/lectores/táctil permiten contrastar fuentes antes de aprobar.
- **MKT-C36-T03** Integrar Supabase/cambio de tenant con invalidación de caché/Realtime. — **aceptación:** Borrador deA no se manda bajo sesiónB.
- **MKT-C36-T04** Crear token Anam backend efímero ligado a TwinBinding/mandato/campaña. — **aceptación:** API key nunca sale y token AV no sustituye JWT.
- **MKT-C36-T05** Aplicar duración/concurrencia/budget/retención y disclosure/permisos AV. — **aceptación:** Grabación off hasta política aprobada; fallback texto útil.
- **MKT-C36-T06** Enrutar tools/confirmaciones por PEP y UI autenticada. — **aceptación:** Un sí hablado no compra medios o lanza campañas.
- **MKT-C36-T07** Probar móvil ES/EN/FR, red lenta, revocación y reconexión. — **aceptación:** No contexto residual privado ni fake activity.

## Gates por ejecutar
- MKT-C36-G01: Sesión Anam de campañaA intenta leer audienceB: bloqueada.
- MKT-C36-G02: Dos pestañas cambian tenant durante approval: scope/revisión se revalidan.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
