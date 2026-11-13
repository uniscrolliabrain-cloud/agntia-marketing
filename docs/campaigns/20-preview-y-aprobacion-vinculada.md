# MKT-C20 · Preview y aprobación vinculada

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia20/42. Dependencia: MKT-C19.

## Objetivo e invariante

Congelar contenido, propósito, audiencia y coste antes del efecto.

Invariante: Proponente/twin no puede aprobarse ni ampliar el alcance autorizado.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/approvals/`
- `packages/campaign-preview/`
- `tests/approval-binding.test.ts`

## Tareas en orden

### MKT-C20-T01

Acción: Crear preview puro de payload/render/assets/links/variantes.

Aceptación: Sin test-send/upload/cron/mutation remota.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C20-T02

Acción: Canonicalizar hashes de contenido, audienceMax, rights, claims y policy.

Aceptación: Cambio material invalida binding aunque campaignId sea igual.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C20-T03

Acción: Vincular approval a revisor humano verificado y tenant/proyecto.

Aceptación: Nombre/voz/JSON approved no prueban autorización.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C20-T04

Acción: Agregar expiry, expectedVersion, purpose/channel y costCeiling.

Aceptación: Approval genérica no autoriza otro canal/cuenta.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C20-T05

Acción: Integrar puerto local/host de aprobación con verificación de prueba.

Aceptación: Si host no existe, no inventar approval ni editar padre.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C20-T06

Acción: Implementar commit con key/hash y revalidación de bajas.

Aceptación: Repetición igual devuelve estado; nuevo payload da409.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C20-T07

Acción: Probar doble click, sesión expirada, voz y retirada.

Aceptación: Aprobación sensible se confirma en UI autenticada del piloto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C20-G01 — NOT_EXECUTED:** ApprovalA con texto igual intenta usar audienciaB: scope/hash bloquean.
- **MKT-C20-G02 — NOT_EXECUTED:** Cambiar targeting, precio o creativo tras aprobar exige otra revisión.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, L02, P06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
