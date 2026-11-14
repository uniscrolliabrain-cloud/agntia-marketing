# MKT-C21 — Frecuencia, presupuestos y límites de contacto

**SCAFFOLD / NO LISTA PARA IMPLEMENTACIÓN.** Fuente: [campaña original](../../campaigns/21-frecuencia-presupuestos-y-limites-de-contacto.md). Lectura obligatoria: [protocolo](../../OPERACION-PIPELINE-3-AGENTES.md), [léxico](../../LEXICO-CANONICO-AGENTE-MARKETING.md), [guardrails](../../architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md), campaña anterior/actual/posterior.

Objetivo: Evitar fatiga y doble gasto sin confundir bolsas económicas.

Dependencias: MKT-C20.

Invariante: Rate-limit, permiso, presupuesto de servicio y medios son controles diferentes.

## Artefactos previstos (no creados)
- `packages/frequency/`
- `packages/budget/`
- `tests/caps-concurrency.test.ts`

## Tareas por descomponer
- **MKT-C21-T01** Definir caps por sujeto/canal/marca/purpose/periodo conforme contrato. — **aceptación:** No usar identidad global entre tenants sin base/permiso.
- **MKT-C21-T02** Definir bolsillos separados de inferencia/AV/email/medios. — **aceptación:** Plan30€ no autoriza30€ de publicidad.
- **MKT-C21-T03** Implementar reserva transaccional por operationKey y moneda. — **aceptación:** Dos workers no consumen el mismo último saldo.
- **MKT-C21-T04** Coordinar caps con padre/redes/otros emisores mediante ledger/puerto. — **aceptación:** Si no existe autoridad común, no prometer cap global exacto.
- **MKT-C21-T05** Revalidar fatiga/supresión/budget justo antes de dispatch. — **aceptación:** Prioridad comercial no salta bloqueo.
- **MKT-C21-T06** Definir consumo real, liberación y ajuste tardío. — **aceptación:** Cuota o factura remota no se inventa a partir de un intento.
- **MKT-C21-T07** Probar límites de volumen, coste desconocido y override humano autorizado. — **aceptación:** Override no elimina consentimiento ni aislamiento.

## Gates por ejecutar
- MKT-C21-G01: Dos journeys simultáneos compiten por último slot de contacto: uno queda bloqueado.
- MKT-C21-G02: Forecast de medios intenta reservar tokens del SaaS como ad spend: rechazado.

## Handoffs requeridos
- HANDOFF-FREEBUFF.md: writer, patchsets y tests
- HANDOFF-CODEX.md: review independiente y evidencias
- HANDOFF-ARCHITECT-FOUNDER.md: arquitectura, dependencias y aprobación

**BLOCKED hasta** inventario de archivos reales, rutas nuevas, firmas, patchsets concretos, tests y los tres handoffs personalizados. Rollback: Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.
