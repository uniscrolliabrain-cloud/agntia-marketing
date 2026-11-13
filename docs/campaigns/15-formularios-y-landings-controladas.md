# MKT-C15 · Formularios y landings controladas

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia15/42. Dependencia: MKT-C14.

## Objetivo e invariante

Recoger datos mínimos y proponer cambios web revisables.

Invariante: Publicar página y activar tracking son efectos distintos de guardar un borrador.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/landings/`
- `packages/forms/`
- `tests/landing-intake.test.ts`

## Tareas en orden

### MKT-C15-T01

Acción: Definir plantilla/HTML permitido y derechos de assets.

Aceptación: Scripts/iframes/URLs arbitrarios no pasan por contenido LLM.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C15-T02

Acción: Definir formulario mínimo con notice/purpose/version y consentimiento separado.

Aceptación: Casillas no preaceptan promoción por enviar consulta.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C15-T03

Acción: Provisionar binding dominio/proyecto/tenant por servidor.

Aceptación: Visitante no dirige datos a otro tenant desde hidden field.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C15-T04

Acción: Aplicar Supabase/capacidad de intake limitada y antiabuso.

Aceptación: Registro no crea membership ni acceso interior.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C15-T05

Acción: Crear preview/diff con audiencia/copy/links/UTM y política tags.

Aceptación: Sin deploy o pixels al previsualizar.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C15-T06

Acción: Definir adaptador CMS opcional nominativo con aprobación de cambio.

Aceptación: No tocar repo agente ni deploy producción desde este plan.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C15-T07

Acción: Probar móvil/accesibilidad, CSV/HTML injection y doble submit.

Aceptación: Un intake deduplicado y aviso/versión recuperables.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C15-G01 — NOT_EXECUTED:** Formulario recopila email para recurso y no inscribe automáticamente a newsletter.
- **MKT-C15-G02 — NOT_EXECUTED:** Landing incluye tag remoto no aprobado: publicación bloqueada.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: L01, L02, L04, S01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
