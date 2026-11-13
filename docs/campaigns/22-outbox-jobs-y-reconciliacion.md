# MKT-C22 · Outbox, jobs y reconciliación

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia22/42. Dependencia: MKT-C21.

## Objetivo e invariante

Hacer recuperable la ejecución sin retry ciego tras incertidumbre.

Invariante: Lease/fencing local no demuestra exactamente-una-vez remoto.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/jobs/`
- `packages/outbox/`
- `packages/reconcile/`

## Tareas en orden

### MKT-C22-T01

Acción: Persistir intent/key/hash/audit/outbox en una transacción.

Aceptación: Caída precommit no deja efecto huérfano o watermark avanzado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C22-T02

Acción: Implementar leases/fences y límites de attempts/DLQ.

Aceptación: Worker viejo no confirma estado después de perder lease.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C22-T03

Acción: Revalidar principal delegado/approval/audiencia/purpose/budget al ejecutar.

Aceptación: Job no conserva poderes revocados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C22-T04

Acción: Clasificar pre-dispatch/rejected/accepted/outcome_unknown por evidencia.

Aceptación: Timeout no se etiqueta automáticamente failed seguro.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C22-T05

Acción: Implementar lookup remoto por refs verificables y política por proveedor.

Aceptación: Sin reconciliación fiable se bloquea y escala.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C22-T06

Acción: Definir cancel/pause con ACK y efectos en vuelo.

Aceptación: No borrar historial remoto para simular rollback.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C22-T07

Acción: Inyectar crash antes/después de HTTP/ACK y repetición de lote.

Aceptación: Un efecto o uncertainty visible sin duplicación.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C22-G01 — NOT_EXECUTED:** Backend aceptó envío, worker cae antes ACK: no nuevo envío desde backend alterno.
- **MKT-C22-G02 — NOT_EXECUTED:** Tenant suspendido durante takeover impide HTTP aunque lease esté libre.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, A02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
