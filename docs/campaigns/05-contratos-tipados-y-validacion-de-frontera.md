# MKT-C05 · Contratos tipados y validación de frontera

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia5/42. Dependencia: MKT-C04.

## Objetivo e invariante

Definir DTOs y errores antes de conectar proveedores.

Invariante: DTO nuevo del servicio y tipo nativo del host se mapean explícitamente.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/contracts/`
- `docs/api-design.md`
- `tests/contracts.test.ts`

## Tareas en orden

### MKT-C05-T01

Acción: Definir IDs opacos, Money string/currency, fechas y límites.

Aceptación: Round-trip rechaza NaN/float ambiguo/fecha inválida/campos extra.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C05-T02

Acción: Definir Brief, CreativeRevision, ClaimEvidence y BrandPolicy.

Aceptación: Objetivo/fuente/rights no quedan solo en prompt libre.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C05-T03

Acción: Definir AudienceRule/Snapshot y EligibilityDecision.

Aceptación: Máximo aprobado liga miembros reales y finalidad, no solo query.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C05-T04

Acción: Definir ApprovalBinding, Intent, Job, Conflict y ExternalLink.

Aceptación: Outcome_unknown no se serializa como éxito o retryable seguro.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C05-T05

Acción: Definir Observation, ConversionFact, MeasurementClaim y ExperimentSpec.

Aceptación: Atribuido/descriptivo/causal son tipos distinguibles.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C05-T06

Acción: Generar JSON Schema y fixtures públicos sin secretos.

Aceptación: SchemaVersion propio no se confunde con SystemEvent string1.0.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C05-T07

Acción: Probar límites, discriminantes y compatibilidad SDK/backend.

Aceptación: Rechazo consistente en todas las interfaces, no solo frontend.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C05-G01 — NOT_EXECUTED:** Payload incluye SQL/model/method/baseURL y scope arbitrario: rechazado.
- **MKT-C05-G02 — NOT_EXECUTED:** Conversiones atribuidas intentan serializarse como ventas causales: contrato exige tipo/fuente.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, A01, A02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
