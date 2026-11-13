# MKT-C29 · Paid media lectura y descubrimiento

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia29/42. Dependencia: MKT-C28.

## Objetivo e invariante

Preparar informes/propuestas de ads sin habilitar compras.

Invariante: Acceso a cuenta/reportes no autoriza mutación, customer-match o billing.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/google-ads/read.ts`
- `packages/adapters/meta-ads/read.ts`
- `docs/ads-capabilities.md`

## Tareas en orden

### MKT-C29-T01

Acción: Verificar documentación/scopes/versión y credenciales aprobadas.

Aceptación: Meta429 mantiene actual verificación pendiente, no ejemplo heredado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C29-T02

Acción: Validar tenant→ad account/manager/currency/timezone.

Aceptación: Cuenta hija de otro cliente no se descubre como fallback.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C29-T03

Acción: Implementar consultas nominadas de rendimiento con fields cerrados.

Aceptación: No GAQL/query arbitraria del modelo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C29-T04

Acción: Preservar definiciones de conversión/atribución/ventana y data lag.

Aceptación: No sumar ventas atribuidas entre plataformas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C29-T05

Acción: Descubrir límites de test accounts/reporting y capacidades.

Aceptación: Fake performance no se presenta como dataset de campaña real.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C29-T06

Acción: Crear propuestas de creativo/targeting/presupuesto en DTO local.

Aceptación: Sin mutation/upload audiencia/offline conversions por leer.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C29-T07

Acción: Probar revocación, rate-limit, cuentaB y payload grande.

Aceptación: Lectura falla segura y no activa anuncios.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C29-G01 — NOT_EXECUTED:** Tool ads_read solicita billing/mutate: capability denegada antes de HTTP.
- **MKT-C29-G02 — NOT_EXECUTED:** Datos atribuidos duplicados de Meta/Google no se convierten en ingreso único sumado.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: A08, A11, P01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
