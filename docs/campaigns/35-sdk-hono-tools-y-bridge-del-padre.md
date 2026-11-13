# MKT-C35 · SDK Hono, tools y bridge del padre

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia35/42. Dependencia: MKT-C34.

## Objetivo e invariante

Preparar interoperabilidad tipada sin editar agente.

Invariante: MCP/Anam/SDK pasan por mismo PEP; no proxy genérico ni wiring automático al padre.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/sdk/`
- `packages/host-bridge/`
- `docs/host-patch-proposal.md`

## Tareas en orden

### MKT-C35-T01

Acción: Crear cliente servidor con DTOs/error/timeouts y config privada.

Aceptación: No token proveedor en browser ni unknown sin validación.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C35-T02

Acción: Crear allowlist exacta método/ruta/tamaño en Hono.

Aceptación: Nuevo endpoint sensible no queda expuesto por prefijo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C35-T03

Acción: Definir tools de lectura/propuesta con input mínimo.

Aceptación: Actor/tenant/capabilities fuera del control del modelo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C35-T04

Acción: Mapear SystemEvent nativo1.0/owner/emittedAt/source permitido.

Aceptación: Marketing events nuevos no se insertan como enum inventado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C35-T05

Acción: Implementar inbox/outbox/receipt/ACK y enlaces de tarea/evidencia.

Aceptación: Replay no crea doble tarea/envío.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C35-T06

Acción: Documentar patch de instalación/wiring sin aplicarlo.

Aceptación: Cero cambios a claims/rutas/config del padre.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C35-T07

Acción: Probar contratos API↔SDK↔host fake y build.

Aceptación: Fake no se anuncia integración instalada, real queda gate pendiente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C35-G01 — NOT_EXECUTED:** Modelo intenta /provider/method o SQL libre: rechazo antes de ejecutar.
- **MKT-C35-G02 — NOT_EXECUTED:** Host approval adapter ausente no permite fabricar una aprobación local equivalente.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, S01, P06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
