# MKT-C23 · Matomo lectura y binding de propiedades

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia23/42. Dependencia: MKT-C22.

## Objetivo e invariante

Importar métricas con definiciones y configuración de medición.

Invariante: Un siteId remoto no es tenantId y una métrica no prueba cumplimiento.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/matomo/`
- `docs/adapters/matomo.md`
- `tests/integration/matomo.test.ts`

## Tareas en orden

### MKT-C23-T01

Acción: Fijar versión/plugins/licencia y roles de laboratorio.

Aceptación: Función premium no se declara Community por estar en docs.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C23-T02

Acción: Validar tenant/proyecto→site y scopes de lectura.

Aceptación: No token admin global para filtrar después.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C23-T03

Acción: Descubrir módulos/métricas/dimensiones permitidos.

Aceptación: Método Reporting API cerrado, sin module/action arbitrario.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C23-T04

Acción: Leer reportes paginados con ventana/timezone/segment aprobado.

Aceptación: Totales y cobertura preservados, sin SQL libre.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C23-T05

Acción: Mapear unidades, unique/visits/events y config privacidad.

Aceptación: No sumar métricas incompatibles entre backends.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C23-T06

Acción: Persistir Observation/snapshot y actualizar con versiones tardías.

Aceptación: Reporte aprobado no se recalcula silenciosamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C23-T07

Acción: Probar site ajeno, plugin ausente, vacío y credencial revocada.

Aceptación: Unsupported/forbidden honesto sin fixtures presentados reales.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C23-G01 — NOT_EXECUTED:** SiteB pedido desdeA se bloquea antes del Reporting API.
- **MKT-C23-G02 — NOT_EXECUTED:** Sin datos no se reporta0 ventas o ROI positivo.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: R03, A03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
