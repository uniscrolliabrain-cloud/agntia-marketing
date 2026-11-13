# MKT-C04 · Twins y nomenclatura de procedencia

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia4/42. Dependencia: MKT-C03.

## Objetivo e invariante

Vincular ejecución local al agente canónico y preservar delegación/linaje.

Invariante: Persona, rol, runtime y mandato no son identidades intercambiables.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/domain/twin-binding.ts`
- `docs/native-lineage-map.md`
- `tests/twins.test.ts`

## Tareas en orden

### MKT-C04-T01

Acción: Mapear Actor.kind/id/tenantId y roleId/runtimeId/personaId/kernelTurnId según tipo.

Aceptación: AgentActor.id conserva runtimeId sin nuevo canonicalAgentId supuesto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C04-T02

Acción: Definir TwinBinding como DTO nuevo versionado del servicio.

Aceptación: Referencias canónicas, instancia local y configuración recuperables.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C04-T03

Acción: Definir mandato entre tenant de origen y targetTenantId.

Aceptación: No reescribir Actor.tenantId para simular membresía del cliente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C04-T04

Acción: Aplicar capability/resource/purpose/budget/expiry/revocación al twin.

Aceptación: Caducar mandato bloquea efectos y conserva historial.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C04-T05

Acción: Preservar provenance.source/actor/updatedAt/confidence y extensiones explícitas.

Aceptación: Modelo no fabrica evidencia ni atribuye su texto al humano.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C04-T06

Acción: Vincular assignedBy/assignedTo, requestId, tareas, artefactos y causalidad.

Aceptación: Delegante/ejecutor y fuente original reconstruibles.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C04-T07

Acción: Probar revisión canónica obsoleta y separación de memorias por cliente.

Aceptación: Misma persona no comparte contexto privado entre tenants.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C04-G01 — NOT_EXECUTED:** Twin con nombre marketing pero sin capability no prepara envío autorizado.
- **MKT-C04-G02 — NOT_EXECUTED:** Sesión AV mantiene mandato vencido: PEP bloquea efectos nuevos.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
