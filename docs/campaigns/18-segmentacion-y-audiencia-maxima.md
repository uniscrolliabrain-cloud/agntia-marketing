# MKT-C18 · Segmentación y audiencia máxima

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia18/42. Dependencia: MKT-C17.

## Objetivo e invariante

Crear reglas cerradas y snapshots de elegibilidad que no se amplíen solos.

Invariante: Regla dinámica no amplía el máximo de personas aprobado.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/audiences/`
- `packages/segmentation/`
- `tests/audience-freeze.test.ts`

## Tareas en orden

### MKT-C18-T01

Acción: Definir DSL tipada con campos/operadores allowlist y límites.

Aceptación: No SQL/query libre del LLM ni joins fuera de scope.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C18-T02

Acción: Aplicar purpose/base/identidad/supresión antes de segmentar.

Aceptación: Dato unknown no se interpreta elegible.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C18-T03

Acción: Crear preview de counts/exclusiones y prueba mínima de selección.

Aceptación: No exportar emails al modelo para explicar un conteo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C18-T04

Acción: Congelar miembros reales, watermark, regla y policyVersion.

Aceptación: Hash de query solo no basta como snapshot.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C18-T05

Acción: Definir revalidación que puede reducir pero no ampliar población.

Aceptación: Nuevo elegible necesita nueva revisión/approval.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C18-T06

Acción: Validar cardinalidad cross-project, dedup y fatiga global autorizada.

Aceptación: Misma persona no recibe dos mensajes por alias si política lo prohíbe.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C18-T07

Acción: Probar datos tardíos, retirada y cambio de regla concurrentes.

Aceptación: Estado aprobado conserva su máximo y evidencia de exclusiones.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C18-G01 — NOT_EXECUTED:** Añadir100 nuevos contactos al segmento remoto tras approval no los incluye.
- **MKT-C18-G02 — NOT_EXECUTED:** Cambiar atributo sensible en regla se rechaza antes de consulta.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: L01, L02, P06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
