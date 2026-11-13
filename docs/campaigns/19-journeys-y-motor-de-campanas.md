# MKT-C19 · Journeys y motor de campañas

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia19/42. Dependencia: MKT-C18.

## Objetivo e invariante

Ejecutar workflows por FSM versionada con límites de reentrada.

Invariante: El LLM propone el grafo, el runtime decide transiciones y efectos.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/journeys/`
- `packages/campaign-state/`
- `tests/journey-fsm.test.ts`

## Tareas en orden

### MKT-C19-T01

Acción: Definir steps/guards/actions nominadas, versiones y validación DAG/ciclos permitidos.

Aceptación: No step HTTP/SQL/shell arbitrario.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C19-T02

Acción: Definir enrollment, ventanas, timezone y propósito por paso.

Aceptación: Evento recibido no concede permiso de contacto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C19-T03

Acción: Implementar simulación local sin IO remoto o envío.

Aceptación: Preview de journey no activa cron/provider.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C19-T04

Acción: Persistir run/step/subject/iteration con CAS e idempotencia.

Aceptación: Replay/reentrada no duplican paso efectuado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C19-T05

Acción: Revalidar mandato, policy, elegibilidad y caps en cada paso.

Aceptación: Permiso inicial no vale indefinidamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C19-T06

Acción: Definir pausa/cancel/timeout/handoff y estado de mensajes en vuelo.

Aceptación: Pause requested no se anuncia como recall completado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C19-T07

Acción: Probar DST, reinicio, cambios de versión y ramas concurrentes.

Aceptación: Historia original y nueva revisión se conservan sin efectos extra.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C19-G01 — NOT_EXECUTED:** Ciclo de nurture sin máximo de pasos/reentrada se rechaza.
- **MKT-C19-G02 — NOT_EXECUTED:** Baja en paso2 cancela siguientes efectos aunque run siga almacenado.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: R01, R02, H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
