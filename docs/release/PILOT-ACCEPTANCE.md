# Aceptación prevista del piloto

Todos los gates **NOT_EXECUTED**. No hay aceptación de producto por la entrega documental. Una capacidad crítica no verificada bloquea piloto de ese camino; una alternativa optativa puede quedar explícitamente disabled sin alegar soporte.

| Gate | Evidencia mínima |
|---|---|
| Baseline/contratos | SHA propio/padre/upstreams, licencias/ediciones y discrepancias |
| Identidad | JWT Supabase, membership/ACL, scope y revocación; no default/user_metadata |
| Twin | Referencias canónicas, mandato vigente/target, memoria aislada y tarea/evidencia |
| Persistencia | FKs/RLS/roles reales, CAS/outbox/audit y restore |
| Audiencia | Finalidad/permiso, snapshot máximo y supresión fresca; no ampliación tras aprobar |
| Creativo | Claims/derechos/fuentes, revisión final y variantes declaradas |
| Efecto | Preview puro, aprobación humana, key/hash, emisor único y receipt |
| Fallos | Crash/timeout/replay/concurrencia sin doble envío ni permiso residual |
| Journey | Pasos/horarios/reentrada/caps, pausa con estado remoto honesto |
| Medición | Definición/cobertura, dedup negocio/ajustes, atribución separada de causalidad |
| Ciencia opcional | Experimento/MMM aptos o blocked; sensibilidad y límites visibles |
| UI/AV | Responsive/roles/ES-EN-FR/accesibilidad; Anam scoped o texto útil |
| Operación | Backup/restore/retención/rotación/runbooks sin reactivar campañas |
| Integración | SDK/Hono/host contrato, fake frente a real y padres sin modificación |

Ejecutar E2E A–I de [medición/evaluación](../09-medicion-y-evaluacion.md). Cero fugas tenant/proyecto, secretos centinela, approvals fabricadas, bypass de supresión, duplicados replay o gasto no autorizado. Un fallo crítico detiene, aunque el resto de la suite pase. No convertir escenarios planeados en cantidad de tests ejecutados.

Test accounts ads no prueban performance/overdelivery/billing reales. Ninguna compra/producción/campaña a lista real forma parte del piloto inicial. No abrir esa frontera por necesidad de completar un gráfico. p50/p95/costo/calidad/cobertura se miden con workload/versiones, no metas inventadas ya alcanzadas.

La demo y reporte final deben permitir al owner reconstruir un efecto y una cifra desde actor/fuente/approval/receipt/MeasurementClaim. Pendientes jurídicos/comerciales/operativos se enumeran con responsable; no una certificación universal. Instalación/wiring en agente y producción requieren autorización separada.
