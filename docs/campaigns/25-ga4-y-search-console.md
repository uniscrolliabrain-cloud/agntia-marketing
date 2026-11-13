# MKT-C25 · GA4 y Search Console

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia25/42. Dependencia: MKT-C24.

## Objetivo e invariante

Medir fuentes Google con scopes y cobertura documentados.

Invariante: Top rows/reporting identity no equivalen a datos completos o personas identificadas.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/ga4/`
- `packages/adapters/search-console/`
- `tests/google-measurement.test.ts`

## Tareas en orden

### MKT-C25-T01

Acción: Configurar OAuth/scopes read-only y bindings de property/site.

Aceptación: Credencial no autoriza otras propiedades por existir en cuenta.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C25-T02

Acción: Descubrir métricas/dimensiones/versiones y compatibilidad.

Aceptación: No usar Universal Analytics como si fuera GA4.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C25-T03

Acción: Implementar reportes con filtros allowlist/cuotas/timezone.

Aceptación: Consulta costosa respeta budget y límites.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C25-T04

Acción: Persistir identidad/configuración de reporting y ventanas.

Aceptación: Snapshot indica si cifras dependen de modelo/config fuente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C25-T05

Acción: Importar Search Console sin prometer todas las filas.

Aceptación: Query ausente no se interpreta cero impresiones automáticamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C25-T06

Acción: Mapear frescura, late data y métricas agregadas por definición.

Aceptación: Reprocesado produce versión nueva con evidencia.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C25-T07

Acción: Probar propiedadesA/B, datos omitidos y token revocado.

Aceptación: 403/404 sin fuga ni fallback cuenta administrador.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C25-G01 — NOT_EXECUTED:** GSC devuelve top rows y reporte no las etiqueta como universo completo.
- **MKT-C25-G02 — NOT_EXECUTED:** GA4 mismo nombre de property pero ID distinto no cambia binding.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: A06, A07. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
