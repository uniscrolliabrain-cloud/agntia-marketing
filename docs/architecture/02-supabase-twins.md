# Supabase y twins: requisito transversal

Supabase JWT obligatorio en todos los modos de cliente. Agentes canónicos en `/agente`, twins especializados aquí. Nombres y procedencia leídos del código padre. Esta especificación no modifica ni afirma que haya endurecido la autenticación del padre.

## Autenticación y ámbito

Validar firma/algoritmo, issuer/audience de proyecto aprobado, exp/nbf, rotación y caché JWKS limitada. No decodificar sin verificar ni descargar claves de un host indicado por token no confiable. Preferir verificación asimétrica con configuración de servidor; proyectos legacy requieren estrategia Supabase explícita y no distribuir secretos de firma. JWT técnico `role: authenticated` no es rol de negocio.

Mantener `sub`, `tenant_id` y `app_metadata.tenant_id` en frontera; `tenantId` en contexto interno. Resolver usuario/membership activa, scope proyecto/recurso/campo y capability en servidor. `user_metadata` editable no concede permisos; tenant del body/query/LLM se contrasta o rechaza. No hay fallback owner/default. Claims válidos pueden estar obsoletos: revalidar suspensión/revocación antes de efectos y acceso sensible.

El padre observado incluye compatibilidad de tenantClaimOf con user_metadata y materialización de primera membership. El nuevo middleware no usa esos caminos como autorización suficiente. Requiere provisioning confiable, sin alterar el padre; si el bridge necesita cambios allí, documentar propuesta y esperar otra autorización. Cookies de sesión, JWT, token Anam y OAuth de proveedores son credenciales distintas.

Workers actúan con identidad privada de servicio y delegación verificable originada en un principal autorizado. No fabricar JWT humano, reenviar tokens a proveedores ni conservar access token para tareas indefinidas. Cada job reconstruye scope, mandato y permisos; AsyncLocalStorage por sí solo no viaja a una cola durable. Operador de otro tenant necesita delegado/target explícitos, sin reescribir Actor de origen.

## TwinBinding nuevo del servicio

Referenciar campos nativos según Actor: kind/id/tenantId, roleId/runtimeId y personaId?/kernelTurnId?; AgentActor.id corresponde a runtimeId. El binding agrega instancia local, revisión de configuración canónica, targetTenantId, mandato, capacidades, límites, purpose, issued/expires/revocationVersion y proofRef. No llamar a un campo nuevo «ya existente» en el padre. Persona y rol no son permiso ni ejecución.

El catálogo vive en `clientes/`; índice default12 frente a catálogo base16 es una discrepancia observada, no prueba de cantidad de runtimes activos. Existe una plantilla marketing, pero no se copian memorias ni se supone que esté ejecutándose. Especializaciones y contexto local se versionan por tenant/proyecto; no hay memoria común de clientes. Un mandato puede permitir ejecución local acotada y lectura de estado durante fallos; al caducar se bloquean nuevos efectos y se conserva historia reconciliable.

## Aislamiento en todas las superficies

RLS USING/WITH CHECK, FKs/consultas por tenant, roles reales API/worker y pruebas de owner/BYPASSRLS. Una service_role no garantiza RLS: requiere PEP y alcance explícito. Storage/URLs firmadas, Realtime, vectores, cachés, búsqueda, observaciones, exports y backups también son fronteras. Colaborador externo ve recursos compartidos, no todas las campañas por pertenecer a una marca. Acceso de soporte excepcional exige motivo/mandato/audit.

Intake público es un flujo separado: formulario/inbox provisionado por servidor, Supabase sesión anónima/capacidad mínima si se usa interacción, antiabuso y sin acceso al interior. Persona de una lista no se convierte en tenant member. Webhooks se verifican por firma/credencial y binding; no suplantan sesión humana. Preferencias/baja pueden usar capability de sujeto firmada y acotada sin abrir API empresarial.

Gates previstos: token de otro proyecto, tenant manipulado, JWT caducado, baja durante cola, twin de otro proyecto, lease vencida, búsquedas/archivos/exports de B desde A y cambio de tenant con sesión Anam abierta. Todos pendientes de ejecución.
