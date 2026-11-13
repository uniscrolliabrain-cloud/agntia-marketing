# MKT-C37 · Cooperación SaaS, handoffs y rotas

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia37/42. Dependencia: MKT-C36.

## Objetivo e invariante

Coordinar servicios solapados con contratos mínimos y recibos reales.

Invariante: Repos hermanos no reciben datos por defecto ni crean un scheduler empresarial paralelo.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/service-agreements/`
- `packages/handoffs/`
- `docs/sibling-contracts.md`

## Tareas en orden

### MKT-C37-T01

Acción: Definir contratos con redes/clientes/ventas/branding/finanzas/legal.

Aceptación: Alcance de dato/finalidad y autoridad por efecto explícitos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C37-T02

Acción: Crear WorkOrder y entregable con proponente/revisor/aceptante.

Aceptación: Aceptación comercial no autoriza cada efecto técnico.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C37-T03

Acción: Implementar offered/acknowledged/working/completed/returned para handoff.

Aceptación: Emitir evento no prueba trabajo recibido.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C37-T04

Acción: Coordinar autoridad única de envío/caps/budget entre servicios.

Aceptación: Conflicto produce bloqueo, no carrera de emisores.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C37-T05

Acción: Definir datos/eventos de briefing diario/semanal/mensual.

Aceptación: Padre gobierna rota; no inventar actividad para llenarla.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C37-T06

Acción: Definir operación de cliente externo y portabilidad/salida.

Aceptación: Sin UI AgntiaPro requerida, mismo twin/identity policy.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C37-T07

Acción: Probar hermano ausente, ACK tardío y datos sin permiso.

Aceptación: Tarea humana/local válida o bloqueo explicado, sin dictamen/saldo inventado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C37-G01 — NOT_EXECUTED:** Redes y marketing reciben mismo publicable: un EffectOwner controla dispatch.
- **MKT-C37-G02 — NOT_EXECUTED:** Export de clientes a servicio hermano sin contrato se rechaza aunque sea mismo owner.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, V02, V03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
