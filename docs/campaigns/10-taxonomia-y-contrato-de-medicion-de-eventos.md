# MKT-C10 · Taxonomía y contrato de medición de eventos

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia10/42. Dependencia: MKT-C09.

## Objetivo e invariante

Capturar hechos con finalidad, dedup y definición estable.

Invariante: Evento observado no es persona única, venta ni causalidad por defecto.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/measurement/events/`
- `docs/event-taxonomy.md`
- `tests/event-ingestion.test.ts`

## Tareas en orden

### MKT-C10-T01

Acción: Definir eventos/propiedades allowlist, purpose y data classification.

Aceptación: No credenciales/email/PII en URLs/UTM o bus.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C10-T02

Acción: Verificar ingreso/webhook/binding y antiabuso.

Aceptación: Evento no autenticado no cambia campaign state o enroll sin regla.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C10-T03

Acción: Definir occurredAt/receivedAt, timezone y IDs de dedup.

Aceptación: Replay/tardío genera proyección correcta y nueva revisión si corresponde.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C10-T04

Acción: Crear Observation con unidad/agregación/ventana/config fuente.

Aceptación: Missing/zero/stale/censored permanecen distintos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C10-T05

Acción: Definir ConversionFact con referencia negocio y ajustes.

Aceptación: Plataforma atribuida no crea venta financiera duplicada.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C10-T06

Acción: Configurar tracking/privacy por política sin tags ocultos.

Aceptación: Formulario/landing no activa pixels automáticamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C10-T07

Acción: Probar duplicados, bot traffic, clock skew y permisos retirados.

Aceptación: No se incrementa un KPI ni identifica persona fuera de alcance.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C10-G01 — NOT_EXECUTED:** Dos plataformas atribuyen misma order: ConversionFact no duplica ingreso.
- **MKT-C10-G02 — NOT_EXECUTED:** Consentimiento de analítica retirado no se suplanta con captura server-side.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: A06, A07, L01, L04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
