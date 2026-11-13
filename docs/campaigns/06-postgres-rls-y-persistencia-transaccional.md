# MKT-C06 · Postgres, RLS y persistencia transaccional

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia6/42. Dependencia: MKT-C05.

## Objetivo e invariante

Crear almacenamiento scoped con historia, índices y recovery.

Invariante: Relaciones, consultas y jobs conservan tenant; privilegio DB no reemplaza policy.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/storage/`
- `migrations/`
- `tests/integration/storage.test.ts`

## Tareas en orden

### MKT-C06-T01

Acción: Diseñar tablas/FKs compuestas y ACL de proyectos/objetos.

Aceptación: Un intentA no referencia audienceSnapshotB por SQL.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C06-T02

Acción: Implementar migraciones versionadas con transacción/backup.

Aceptación: Fresh/upgrade/fallo parcial mantienen registros y audit.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C06-T03

Acción: Configurar RLS USING/WITH CHECK y roles API/worker reales.

Aceptación: Probar owner/BYPASSRLS/service_role, sin suposiciones.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C06-T04

Acción: Crear índices de external links, inbox e idempotency por ámbito.

Aceptación: Colisión de externalId entre proveedores/tenants no pisa objetos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C06-T05

Acción: Persistir audit y payload de retención separada.

Aceptación: Correlación de intentos/denegaciones sin PII eterna en ledger.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C06-T06

Acción: Implementar CAS/versiones, outbox y locks/leases.

Aceptación: Commit local de estado/audit/outbox es indivisible.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C06-T07

Acción: Probar concurrencia, rollback y restore de fixtures.

Aceptación: Cursores/receipts no se pierden ni reactivan campañas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C06-G01 — NOT_EXECUTED:** INSERT/UPDATE de FK cross-tenant falla por API y DB con roles usados.
- **MKT-C06-G02 — NOT_EXECUTED:** Caída en migración/commit no deja aprobación/intención parcial visible.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: S02, H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
