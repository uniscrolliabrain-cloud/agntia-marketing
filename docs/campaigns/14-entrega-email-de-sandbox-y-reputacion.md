# MKT-C14 · Entrega email de sandbox y reputación

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia14/42. Dependencia: MKT-C13.

## Objetivo e invariante

Crear primer camino de efecto verificable y autoridad única.

Invariante: Ningún correo real fuera de destinatarios sandbox se usa para pasar pruebas.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/channels/email/`
- `docs/email-sandbox.md`
- `tests/email-delivery.test.ts`

## Tareas en orden

### MKT-C14-T01

Acción: Asignar un único emisor entre padre/backend/canal local por intent.

Aceptación: Una petición duplicada no invoca dos transportes.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C14-T02

Acción: Configurar sink local y allowlist de destinos de prueba.

Aceptación: Destino no sandbox bloqueado antes de HTTP/SMTP.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C14-T03

Acción: Definir remitente/headers/links y sanitización HTML/adjuntos.

Aceptación: CRLF, scripts y receptor mutable rechazados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C14-T04

Acción: Aplicar elegibilidad/supresión/caps justo antes de dispatch.

Aceptación: Backend no puede añadir suscriptores fuera del máximo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C14-T05

Acción: Normalizar receipt accepted/sent/delivered/bounce/complaint.

Aceptación: Open/click no se declara entrega humana o compra.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C14-T06

Acción: Definir idempotencia y ventanas reales del transporte.

Aceptación: Ledger local no promete dedup remoto ilimitado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C14-T07

Acción: Probar pérdida ACK, caída worker y fallback prohibido.

Aceptación: Un efecto o uncertainty visible, nunca nuevo envío desde otro backend.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C14-G01 — NOT_EXECUTED:** Proveedor aceptó pero cliente recibe timeout: no mandar de nuevo por Resend/padre.
- **MKT-C14-G02 — NOT_EXECUTED:** Mensaje de prueba a dirección del owner no aprobada como sandbox se rechaza.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, A02, L02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
