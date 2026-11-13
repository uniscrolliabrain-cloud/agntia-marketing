# MKT-C12 · Mautic borradores y autoridad de ejecución

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia12/42. Dependencia: MKT-C11.

## Objetivo e invariante

Preparar contactos/campañas sin activar side effects imprevistos.

Invariante: Crear/importar un contacto no debe disparar un workflow no aprobado.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/mautic/write.ts`
- `docs/mautic-execution-boundary.md`
- `tests/mautic-drafts.test.ts`

## Tareas en orden

### MKT-C12-T01

Acción: Inventariar eventos/cron/plugins que pueden enviar tras cambios.

Aceptación: Test fixture demuestra ausencia de triggers colaterales.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C12-T02

Acción: Definir create/update allowlist y dry-run local de diff.

Aceptación: Sin write remoto en preview.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C12-T03

Acción: Vincular approval al contenido/audiencia/canal/estado y coste.

Aceptación: No autorización general al árbol completo de campaña.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C12-T04

Acción: Crear draft desactivado en sandbox con idempotency/link.

Aceptación: No scheduled/running por valor default o relación al segmento.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C12-T05

Acción: Verificar estado remoto y escritura incierta por refs fiables.

Aceptación: Sin lookup suficiente no hay retry automático.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C12-T06

Acción: Evaluar si el backend permite supresión y máximo congelado al enviar.

Aceptación: Si no, dispatch permanece bloqueado por esa ruta.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C12-T07

Acción: Probar import/replay, edición concurrente y plugin de prueba adversarial.

Aceptación: Ningún correo fuera del sink y audit completo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C12-G01 — NOT_EXECUTED:** Agregar contacto al segmento intentaría enviar por cron: gate bloquea ruta.
- **MKT-C12-G02 — NOT_EXECUTED:** Timeout tras draft create no duplica campaña al reintentar.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: R01, A01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
