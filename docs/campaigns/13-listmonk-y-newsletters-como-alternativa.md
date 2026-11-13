# MKT-C13 · Listmonk y newsletters como alternativa

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia13/42. Dependencia: MKT-C12.

## Objetivo e invariante

Adaptar listas/campañas con aislamiento y pruebas de efecto.

Invariante: Endpoint test envía realmente; listas/permisos no prueban tenancy por sí solos.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/listmonk/`
- `docs/adapters/listmonk.md`
- `tests/integration/listmonk.test.ts`

## Tareas en orden

### MKT-C13-T01

Acción: Fijar versión/licencia e instancia/DB por tenant inicialmente si hace falta.

Aceptación: Aislamiento demostrado con roles usados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C13-T02

Acción: Descubrir lectura/campos/permisos de listas/subscribers/campaigns.

Aceptación: Usuario limitado no ve listas ajenas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C13-T03

Acción: Mapear estado/datos/identidad y no publicar archive automáticamente.

Aceptación: Archivo web se trata como efecto independiente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C13-T04

Acción: Implementar preview local y draft remoto explícito en laboratorio.

Aceptación: Test endpoint no se llama como previsualización.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C13-T05

Acción: Congelar destinatarios máximos y reconciliar supresiones frescas.

Aceptación: Lista dinámica no amplía aprobados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C13-T06

Acción: Crear writeback controlado con ledger y búsqueda/reconciliación verificadas.

Aceptación: Cambiar status no se reintenta a ciegas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C13-T07

Acción: Probar envíos solo a sink/allowlist y pausa/cancel/replay.

Aceptación: Historial distingue aceptado, enviado e incierto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C13-G01 — NOT_EXECUTED:** Tool intenta POST campaign/test a email libre: denegado por policy.
- **MKT-C13-G02 — NOT_EXECUTED:** Publicar archive con datos personales no sucede al crear newsletter.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: R02, A02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
