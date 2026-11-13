# MKT-C33 · Escenarios de mix y presupuesto

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia33/42. Dependencia: MKT-C32.

## Objetivo e invariante

Proponer decisiones revisables bajo restricciones e incertidumbre.

Invariante: Recomendación de inversión no ejecuta reasignación ni compromete caja.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/planning/`
- `docs/budget-scenarios.md`
- `tests/planning.test.ts`

## Tareas en orden

### MKT-C33-T01

Acción: Definir restricciones comerciales por canal/periodo/moneda.

Aceptación: Separar coste de servicio de gasto publicitario.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C33-T02

Acción: Consumir MeasurementClaims/ModelRuns con validez y coverage.

Aceptación: Datos stale/no aptos no se transforman en óptimo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C33-T03

Acción: Generar escenarios base/alternativos con intervalos/supuestos.

Aceptación: No punto óptimo único sin sensibilidad.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C33-T04

Acción: Agregar riesgos de extrapolación, saturación y coste de cambio.

Aceptación: No extender curvas fuera de rango observado sin advertencia.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C33-T05

Acción: Proponer experimento adicional cuando identificación es débil.

Aceptación: Se incluye coste/permiso pendiente, sin lanzarlo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C33-T06

Acción: Crear propuesta a finanzas/owner con diff y evidencia.

Aceptación: Aceptar informe no es autorización de compra.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C33-T07

Acción: Probar moneda, límites, datos contradictorios y plan imposible.

Aceptación: Infeasible explicado en vez de inventar saldo o ROI.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C33-G01 — NOT_EXECUTED:** El optimizador pide duplicar budget y tool no tiene capability de mutate.
- **MKT-C33-G02 — NOT_EXECUTED:** Scenario usa ingreso atribuido como causal: revisión bloquea afirmación.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: P04, A10, H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
