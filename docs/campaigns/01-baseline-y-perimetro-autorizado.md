# MKT-C01 · Baseline y perímetro autorizado

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia1/42. Dependencia: ninguna.

## Objetivo e invariante

Congelar estado documental, padre y fuentes antes de introducir código.

Invariante: No modificar agente; diseño no significa capacidad operativa.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `docs/baseline.md`
- `docs/parent-diff.md`
- `docs/evidence/c01/`

## Tareas en orden

### MKT-C01-T01

Acción: Anotar SHA propio/padre, fecha, árbol e instrucciones aplicables.

Aceptación: Registro reproducible con scopes de lectura/escritura explícitos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C01-T02

Acción: Inventariar contratos Actor/JWT/provenance/tasks/events que necesita marketing.

Aceptación: Ruta/blob y alcance de lectura; no símbolos inventados como existentes.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C01-T03

Acción: Cotejar lead discovery/accept y seguimiento/oposiciones del padre.

Aceptación: Buscar/aceptar no se convierten en consentimiento de campaña.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C01-T04

Acción: Capturar catálogo12/16 y plantilla marketing por revisión.

Aceptación: No presumir runtimes activos ni crear agentes canónicos aquí.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C01-T05

Acción: Inventariar herramientas, red, Docker y permisos disponibles.

Aceptación: Gate sin entorno queda NOT_VERIFIED, no PASS con mock.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C01-T06

Acción: Congelar manifiesto inicial de documentos y refs de investigación.

Aceptación: Rutas futuras no cuentan como implementación ni tests ejecutados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C01-T07

Acción: Crear bitácora sanitizada y primer checkpoint de riesgos.

Aceptación: Fallos preexistentes separados de cambios de campaña.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C01-G01 — NOT_EXECUTED:** SHA padre cambia entre lecturas: detener mapping hasta cotejar.
- **MKT-C01-G02 — NOT_EXECUTED:** Intentar ejecutar campaña real para probar baseline queda fuera de alcance.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
