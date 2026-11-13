# MKT-C24 · Plausible y PostHog como alternativas

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia24/42. Dependencia: MKT-C23.

## Objetivo e invariante

Añadir analítica opcional sin equiparar Cloud, CE y permisos.

Invariante: Privacy-first y licencia base no garantizan todas funciones o configuración segura.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/plausible/`
- `packages/adapters/posthog/`
- `tests/analytics-alternatives.test.ts`

## Tareas en orden

### MKT-C24-T01

Acción: Revisar edición/versiones/operación y licencias mixtas.

Aceptación: Stats API o Enterprise se habilitan solo si existen en instalación.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C24-T02

Acción: Validar binding tenant→site/project y roles.

Aceptación: Proyecto con mismo nombre no se selecciona automáticamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C24-T03

Acción: Descubrir métricas/filtros y lectura nominada permitida.

Aceptación: No SQL/HogQL libre, exports o admin tools al modelo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C24-T04

Acción: Mapear métricas/eventos y freshness con fuente/versiones.

Aceptación: Datos modelados/observados se distinguen si aplica.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C24-T05

Acción: Configurar replay/PII capture off hasta aprobación específica.

Aceptación: Instalar adaptador de lectura no activa tracking nuevo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C24-T06

Acción: Crear sync y conflictos de configuración/cobertura.

Aceptación: Missing/unsupported no se rellena con cero.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C24-T07

Acción: Probar2proyectos, revisión de roles y límite de respuesta.

Aceptación: Un adaptador opcional no probado permanece disabled.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C24-G01 — NOT_EXECUTED:** Plausible CE no expone operación Cloud requerida: unsupported, no scraping.
- **MKT-C24-G02 — NOT_EXECUTED:** PostHog replay captura PII por default heredado: bloquear hasta configuración revisada.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: R04, R08, A04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
