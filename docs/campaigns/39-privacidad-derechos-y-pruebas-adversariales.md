# MKT-C39 · Privacidad, derechos y pruebas adversariales

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia39/42. Dependencia: MKT-C38.

## Objetivo e invariante

Cerrar superficies de fuga y ciclo de vida de datos antes de E2E.

Invariante: Fuga, bypass de supresión, secreto o efecto no autorizado detienen campaña.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `tests/security/`
- `packages/privacy/requests/`
- `docs/threat-model.md`

## Tareas en orden

### MKT-C39-T01

Acción: Probar BOLA por API/campo/job/archivo/search/cache/Realtime/export.

Aceptación: Dos tenants y proyectos compartidos sin metadatos ajenos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C39-T02

Acción: Probar JWT/scope/twin/approval manipulados y revocación.

Aceptación: Sin owner/default ni provisioning desde user_metadata.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C39-T03

Acción: Inyectar instrucciones en sitios/creativos/CSV/adjuntos/tools.

Aceptación: Datos no alteran política/capacidad/destinatario.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C39-T04

Acción: Probar SSRF/redirect/DNS/MIME/HTML/CSV y webhook/OAuth replay.

Aceptación: Sin egress no aprobado ni ejecución de contenido.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C39-T05

Acción: Implementar solicitudes de derechos con identidad/alcance/revisión.

Aceptación: Export no entrega datos de terceros; borrado no ignora retención legítima.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C39-T06

Acción: Propagar supresión a índices/memorias/backends y backups con ACK.

Aceptación: Restore no resucita datos ni reenvía campañas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C39-T07

Acción: Escanear centinelas y revisar evidencia/logs/reportes públicos.

Aceptación: Cero secretos/PII de prueba sensible, riesgos pendientes explícitos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C39-G01 — NOT_EXECUTED:** Documento exige exportar audienceB: policy independiente del modelo bloquea.
- **MKT-C39-G02 — NOT_EXECUTED:** Restaurar backup anterior a baja conserva la supresión antes de activar worker.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: P06, S02, L01, L02, L03, L04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
