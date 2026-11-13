# MKT-C03 · Supabase JWT y principal verificado

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia3/42. Dependencia: MKT-C02.

## Objetivo e invariante

Autenticar todos los modos y resolver tenant desde autoridad confiable.

Invariante: Firma válida sin membership/scope no concede acceso empresarial.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/auth/`
- `tests/security/jwt.test.ts`
- `docs/auth-contract.md`

## Tareas en orden

### MKT-C03-T01

Acción: Fijar issuer/audience/proyecto/JWKS y algoritmos en servidor.

Aceptación: Token no elige host de claves ni configuración de confianza.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C03-T02

Acción: Verificar firma, exp/nbf, tolerancia, rotación y caché acotada.

Aceptación: JWKS caído o algoritmo inválido no activa fallback.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C03-T03

Acción: Resolver sub a usuario activo y tenant a membership provisionada.

Aceptación: user_metadata no autoriza ni crea membership implícita.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C03-T04

Acción: Conservar tenantId opaco y roles/capacidades de servidor.

Aceptación: authenticated no equivale a owner ni marketer.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C03-T05

Acción: Aplicar ACL de proyecto/recurso/campo a principal.

Aceptación: Usuario válido no ve listas completas por compartir tenant.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C03-T06

Acción: Definir credencial privada de worker y mandato originado por principal.

Aceptación: No falsificar JWT humano o guardarlo indefinidamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C03-T07

Acción: Probar claims manipulados, suspensión y cambio de tenant.

Aceptación: 401/403/404 consistentes, sin metadatos de otros clientes.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C03-G01 — NOT_EXECUTED:** JWT de otro proyecto o tenant_idB en sesiónA se rechaza.
- **MKT-C03-G02 — NOT_EXECUTED:** Revocar membership con job en cola impide el siguiente efecto.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: S01, S02, H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
