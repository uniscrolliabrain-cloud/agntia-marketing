# MKT-C30 · Ads en test accounts y borradores controlados

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia30/42. Dependencia: MKT-C29.

## Objetivo e invariante

Validar propuestas con proveedores de prueba sin gasto/producción.

Invariante: No lanzar campañas, activar billing o gastar medios de clientes en esta campaña.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/ads-test/`
- `docs/paid-activation-boundary.md`
- `tests/integration/ads-sandbox.test.ts`

## Tareas en orden

### MKT-C30-T01

Acción: Definir allowlist de cuentas exclusivamente test y credenciales separadas.

Aceptación: Cuenta producción se rechaza incluso si token tiene acceso.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C30-T02

Acción: Descubrir validate_only por método admitido y semántica de errors.

Aceptación: No inventar garantía universal de dry-run para cualquier API.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C30-T03

Acción: Crear preview con creativo, audience/targeting, moneda, límites y riesgos.

Aceptación: Una propuesta de budget no es aprobación de compra.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C30-T04

Acción: Vincular autorización humana y expectedVersion a validación/write test.

Aceptación: LLM no puede elevar test a ejecución real.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C30-T05

Acción: Crear borrador/paused solo si estado y atomicidad están probados.

Aceptación: No defaults enabled o activación por otra entidad.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C30-T06

Acción: Reconciliar timeout/partial_failure sin borrar o duplicar objetos.

Aceptación: Error por operación conserva resultado parcial explícito.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C30-T07

Acción: Documentar gates de producción pendientes y no probados en test.

Aceptación: Performance/overdelivery reales requieren otro encargo y entorno autorizado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C30-G01 — NOT_EXECUTED:** Cambiar testAccountId por cuenta real bloquea antes de mutar.
- **MKT-C30-G02 — NOT_EXECUTED:** Timeout de creación paused no se reintenta con nueva key creando duplicado.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: A08, A11, H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
