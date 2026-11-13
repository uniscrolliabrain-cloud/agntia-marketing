# MKT-C27 · AEO y GEO observacional

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia27/42. Dependencia: MKT-C26.

## Objetivo e invariante

Medir visibilidad generativa con panel reproducible y límites.

Invariante: No hay garantía de mención/ranking ni API universal de respuestas de consumo.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/aeo/`
- `docs/aeo-measurement-contract.md`
- `tests/aeo-observations.test.ts`

## Tareas en orden

### MKT-C27-T01

Acción: Definir panel de preguntas/fuentes/idiomas/regiones aprobado.

Aceptación: Se evita personalización sensible y consultas con PII.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C27-T02

Acción: Seleccionar APIs/acuerdos de acceso permitidos por proveedor.

Aceptación: Si no hay acceso, unsupported sin browser scraping evasivo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C27-T03

Acción: Guardar modelo/versión/config/fecha y evidencia de respuesta.

Aceptación: Observaciones no equivalen al buscador de todos los usuarios.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C27-T04

Acción: Definir métricas de mención/cita/cobertura y variabilidad.

Aceptación: Ausente, error y no disponible no se mezclan.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C27-T05

Acción: Comparar cambios con controles/repeticiones y límites explícitos.

Aceptación: Mejora observada no se declara efecto causal sin diseño.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C27-T06

Acción: Proponer mejoras de contenido basadas en fuentes/claridad.

Aceptación: No fabricar estadísticas/reviews o explotar prompt injection en sitios.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C27-T07

Acción: Probar ES/EN/FR, cambio de modelo y coste de consultas.

Aceptación: Reporte conserva versiones y no extrapola benchmark GEO histórico.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C27-G01 — NOT_EXECUTED:** Proveedor cambia modelo: serie se marca cambio de régimen, no victoria de campaña.
- **MKT-C27-G02 — NOT_EXECUTED:** Generar fake citations para aparecer más en IA queda bloqueado.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: P05, A09. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
