# MKT-C28 · Experimentación con GrowthBook

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia28/42. Dependencia: MKT-C27.

## Objetivo e invariante

Diseñar y ejecutar asignación acotada con análisis predefinido.

Invariante: Feature flag no es permiso para exponer población o gastar; p-value no sustituye diseño.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/experiments/`
- `packages/adapters/growthbook/`
- `tests/experiment-integrity.test.ts`

## Tareas en orden

### MKT-C28-T01

Acción: Fijar versión/licencias/funciones y scope proyecto.

Aceptación: Enterprise no se asume disponible por README.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C28-T02

Acción: Definir ExperimentSpec de unidad/población/hipótesis/MDE/guardrails.

Aceptación: Estimand y análisis plan revisados antes de observar resultado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C28-T03

Acción: Validar elegibilidad/asignación/exposición y persistencia de bucket.

Aceptación: No reasignación por reintento o cambio de dispositivo sin policy.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C28-T04

Acción: Implementar exposición y outcomes con dedup/ventanas.

Aceptación: No contamination silenciosa entre tratamiento/control.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C28-T05

Acción: Comprobar SRM, potencia, comparaciones múltiples y reglas de parada.

Aceptación: No declarar ganador por mirar repetidamente sin método válido.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C28-T06

Acción: Aplicar preview/approval a activar configuración, no flag global libre.

Aceptación: Solo fixture/sandbox en esta campaña sin usuarios reales.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C28-T07

Acción: Probar A/A, efecto sintético conocido, nulo y cambio concurrente.

Aceptación: Falso positivo, pérdida y exclusiones quedan medidos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C28-G01 — NOT_EXECUTED:** SRM o contaminación impiden reportar uplift como conclusión firme.
- **MKT-C28-G02 — NOT_EXECUTED:** LLM intenta activar feature flag de todos los proyectos: denegado.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: R05, A05, P03, P04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
