# MKT-C36 · Portal responsive y sesiones Anam

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia36/42. Dependencia: MKT-C35.

## Objetivo e invariante

Construir experiencia revisable para cliente integrado o externo.

Invariante: AV es presencia del twin, no identidad, firma o permiso de compra.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `apps/portal/`
- `packages/presence/anam/`
- `tests/browser/portal-anam.test.ts`

## Tareas en orden

### MKT-C36-T01

Acción: Diseñar vistas owner/marketer/revisor/colaborador con scope visible.

Aceptación: Listas y datos sensibles no se muestran por defecto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C36-T02

Acción: Construir chat lateral desktop/panel móvil y flujo de edición/revisión.

Aceptación: Teclado/lectores/táctil permiten contrastar fuentes antes de aprobar.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C36-T03

Acción: Integrar Supabase/cambio de tenant con invalidación de caché/Realtime.

Aceptación: Borrador deA no se manda bajo sesiónB.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C36-T04

Acción: Crear token Anam backend efímero ligado a TwinBinding/mandato/campaña.

Aceptación: API key nunca sale y token AV no sustituye JWT.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C36-T05

Acción: Aplicar duración/concurrencia/budget/retención y disclosure/permisos AV.

Aceptación: Grabación off hasta política aprobada; fallback texto útil.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C36-T06

Acción: Enrutar tools/confirmaciones por PEP y UI autenticada.

Aceptación: Un sí hablado no compra medios o lanza campañas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C36-T07

Acción: Probar móvil ES/EN/FR, red lenta, revocación y reconexión.

Aceptación: No contexto residual privado ni fake activity.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C36-G01 — NOT_EXECUTED:** Sesión Anam de campañaA intenta leer audienceB: bloqueada.
- **MKT-C36-G02 — NOT_EXECUTED:** Dos pestañas cambian tenant durante approval: scope/revisión se revalidan.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: N01, V01, S01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
