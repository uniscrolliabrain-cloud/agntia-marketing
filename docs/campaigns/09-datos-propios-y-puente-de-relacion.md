# MKT-C09 · Datos propios y puente de relación

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia9/42. Dependencia: MKT-C08.

## Objetivo e invariante

Normalizar personas/fuentes sin crear permisos ni leads de forma implícita.

Invariante: Origen público o lead aceptado no demuestra identidad/permiso comercial.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/customer-projections/`
- `packages/imports/`
- `tests/contact-sync.test.ts`

## Tareas en orden

### MKT-C09-T01

Acción: Definir campos permitidos, custodio y AuthorityMap por entidad.

Aceptación: Campo fiscal/sensible innecesario no se importa por comodidad.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C09-T02

Acción: Crear preview CSV/API con encoding/límites y saneado de fórmulas.

Aceptación: Import no ejecuta HTML/SQL ni crea memberships.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C09-T03

Acción: Mapear Contact/ChannelIdentity y source credit del padre.

Aceptación: placeId/ref/source preservados sin sustituir por dominio.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C09-T04

Acción: Persistir ExternalLink/hash/mapperVersion y staging revisable.

Aceptación: Misma carga no duplica; cambios revisados generan conflicto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C09-T05

Acción: Definir aliases/duplicados como propuestas humanas.

Aceptación: Homónimos/buzones compartidos no se fusionan automáticamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C09-T06

Acción: Implementar cursor estable/overlap y watermark tras commit.

Aceptación: Reorder/empate/fallo de lote no pierde objetos ni aparenta éxito completo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C09-T07

Acción: Probar1000+ registros sintéticos, bajas y resync.

Aceptación: Totales/contenido se reconcilian por fuente, no solo cantidad.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C09-G01 — NOT_EXECUTED:** CSV incluye tenant_id/owner y consent=true sin prueba: no concede permisos.
- **MKT-C09-G02 — NOT_EXECUTED:** LeadCandidate se importa como público pero no entra a un journey.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, L01, L02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
