# Runbook previsto

NOT_IMPLEMENTED/NOT_EXECUTED. Estos procedimientos requieren comandos concretos, responsables, entorno y evidencia en la implementación. No se han desplegado flags/tablas/colas ni proveedores. No operar contra clientes reales por esta entrega documental.

## Preparación

Staging aislado con dos tenants sintéticos, operador y Supabase configurado/verificado. Provisionar memberships/ACL, roles Postgres/RLS y secretos externos; no usar service_role en el browser o como permiso universal. Conexiones por endpointRef aprobado y egress acotado. Canales de salida a sink/allowlist, writes producción/ads/billing/audience upload deshabilitados. TwinBinding/mandato comprobados por contrato; si no existe bridge real del padre, HOST_BRIDGE_NOT_VERIFIED visible. No modificar agente para resolverlo.

Verificar migraciones, fixture reset, backup/restore y supresiones antes de levantar workers. CapabilityReport fresco por backend/edición/operación; módulo unknown/forbidden permanece apagado. No cron de Mautic/listmonk no inventariado ni triggers de envío tras importación. Dominios y tracking bajo política separada; preview no activa pixel o publicación.

## Incertidumbre y outage

Clasificar alcance tenant/conexión/capacidad. Suspender nuevos dispatches si degradación o permiso revocado; snapshot previo puede leerse con freshness explícita. Conservar intent/payloadHash/receipt/correlación. No cambiar de proveedor para resolver un timeout de envío. Reconciliar por referencias remotas seguras; si falta lookup, tarea humana y bloqueo. Backoff finito de lecturas; escrituras no retry ciego. No convertir cancel/pause local en garantía de que no hubo envío/gasto remoto.

Reanudar job exige lease/fence y revalidación de actor delegado, mandato, revisionHash, audienceMax, elegibilidad/supresión/frecuencia y budget. ACK después de commit local. DLQ tiene causa y revisión; regenerar una key no es solución a un efecto incierto. Un cursor de métricas avanza tras commit y no modifica retrospectivamente informe aceptado sin revisión nueva.

## Baja, privacidad y acceso

Una retirada actualiza ledger y proyección, cancela efectos futuros según punto de autorización y propaga restricciones a backends con ACK. No presumir que sincronización eventual impide un envío ya delegado. Si el backend no cumple la política de autorización por destinatario, deshabilitar dispatch por esa ruta. Derechos de datos con identidad/alcance/revisión, no export o borrado por prompt. Registrar pendiente/rechazado con responsable y plazo aplicable revisado.

Rotar JWT/JWKS/OAuth/API keys con caché y revocación comprobadas. Bajas de membership y mandato llegan a jobs/sesiones; un token aún firmado no garantiza permiso vigente. Cerrar contexto Anam/realtime cuando cambie tenant o scope. Soporte operador por acceso excepcional mínimo y auditado.

## Incidente

Cortar capacidades/secretos/mandatos comprometidos, preservar evidencia minimizada y establecer responsables. Evaluar exposición/efectos/datos/obligaciones con revisión humana competente, sin anunciar automáticamente cumplimiento o certificación. Cross-tenant, listas expuestas, approval fabricada, doble envío y gasto no autorizado detienen rollout. Un reporte causal incorrecto se retira/corrige con fuente e impacto, sin ocultar revisión anterior.

## Restore y release

Backups cifrados con claves separadas y prueba de restauración. Comparar tablas, links, audit, outbox/receipts, cursores, supresiones y modelos/report snapshots. Reaplicar restricciones posteriores al backup antes de habilitar workers. Restore no manda campañas históricas ni reactiva mandatos vencidos. Feature flag de rollback detiene nuevos efectos, conserva historia y muestra uncertainty; no borra mensajes/anuncios para simular reversión.

Prompt/brand/claim/journey/modelo candidatos pasan eval y revisión antes de rollout canario. Revalidar approvals si el cambio altera alcance. Métricas SRE: lag, error class, unknown, revisión pendiente, freshness, coste y latencia medidos bajo workload. Rota empresarial en padre; cron técnico solo por servicio. Producción requiere aceptación owner posterior y gates reales, nunca un merge automático al acabar42 fases.
