# MKT-C38 — Coste de servicio y observabilidad operacional

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/38-coste-de-servicio-y-observabilidad-operacional.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Medir consumo y fiabilidad antes de prometer planes y escala.

Dependencias: MKT-C37.

Invariante: Bolsas30/70/300 son hipótesis, no tarifa/proveedor contratado ni gasto de medios.

## Artefactos previstos (no creados)
- `packages/observability/`
- `packages/usage/`
- `docs/cost-workloads.md`

## Tareas por descomponer
- **MKT-C38-T01** Verificar tarifas/mínimos/región/retención de proveedores elegidos. — **aceptación:** No precios de memoria ni compra para pasar un gate.
- **MKT-C38-T02** Instrumentar tokens/minutosAV/email/storage/egress/compute por operación. — **aceptación:** Consumo observado ligado a reserva y receipt.
- **MKT-C38-T03** Aplicar routing de modelos aprobados y escalado bajo presupuesto. — **aceptación:** Fallback barato no mueve PII a proveedor no aprobado.
- **MKT-C38-T04** Implementar rate-limit/backpressure y aislamiento de ruido. — **aceptación:** Un tenant no monopoliza cola/cómputo ajenos.
- **MKT-C38-T05** Crear logs/traces sanitizados y métricas de lag/unknown/conflictos. — **aceptación:** No JWT/tokens/emails en etiquetas de telemetría.
- **MKT-C38-T06** Medir p50/p95, costo por tarea válida y sensibilidad de volumen. — **aceptación:** No presentar una simulación como SLA comercial.
- **MKT-C38-T07** Probar agotamiento y reconciliación tardía con extras disabled. — **aceptación:** Seguridad no se degrada; AV/MMM se bloquea si no cabe.

## Gates por ejecutar
- MKT-C38-G01: Plan mínimo AV supera bolsaLite: no se activa cargo automático.
- MKT-C38-G02: Segundo tenant bajo carga conserva límites/servicio sin lectura cruzada.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
