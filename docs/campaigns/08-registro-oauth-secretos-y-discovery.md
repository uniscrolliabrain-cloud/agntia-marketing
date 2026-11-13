# MKT-C08 · Registro, OAuth, secretos y discovery

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia8/42. Dependencia: MKT-C07.

## Objetivo e invariante

Conectar solo endpoints/admin y capacidades comprobadas por despliegue.

Invariante: El modelo no elige URL, token, cuenta o método remoto.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/integrations/registry/`
- `packages/secrets/`
- `tests/discovery-egress.test.ts`

## Tareas en orden

### MKT-C08-T01

Acción: Crear conexiones tenant-scoped con endpointRef/secretRef y bindings.

Aceptación: No URL libre del owner final o del LLM.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C08-T02

Acción: Aplicar TLS/host/puerto allowlist, DNS/IP y bloqueo de redirects.

Aceptación: Metadata/private no aprobado/credenciales en URL se rechazan.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C08-T03

Acción: Implementar OAuth state/PKCE y callback ligado a tenant/proyecto.

Aceptación: SesiónB no conecta credencial aA.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C08-T04

Acción: Usar cuenta bot de mínimo privilegio y rotación sin perder links.

Aceptación: Permiso faltante no hace fallback admin.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C08-T05

Acción: Descubrir versión/edición/schema/campos y capacidades por operación.

Aceptación: 200 con HTML o schema erróneo no cuenta como healthy.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C08-T06

Acción: Guardar CapabilityReport con evidencia, expiry y causa sanitizada.

Aceptación: Unknown/forbidden/not_configured deshabilitan operación.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C08-T07

Acción: Probar tamaño/timeout/errores y centinelas secretos.

Aceptación: Token/DSN/PII no salen en logs, eventos o frontend.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C08-G01 — NOT_EXECUTED:** ConexiónA usa site/accountB válido: binding bloquea antes de leer.
- **MKT-C08-G02 — NOT_EXECUTED:** Cambio de edición/rol invalida report de capacidad antes del write.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: A01, A02, A03, A04, A08. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
