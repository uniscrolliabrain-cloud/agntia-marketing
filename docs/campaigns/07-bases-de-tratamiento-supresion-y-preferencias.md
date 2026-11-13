# MKT-C07 · Bases de tratamiento, supresión y preferencias

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia7/42. Dependencia: MKT-C06.

## Objetivo e invariante

Modelar elegibilidad de contacto y tracking sin ampliar permisos.

Invariante: Contactar, rastrear, grabar y entrenar son finalidades separadas.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/privacy/`
- `packages/eligibility/`
- `tests/consent.test.ts`

## Tareas en orden

### MKT-C07-T01

Acción: Definir propósitos y bases con revisión humana/contextual.

Aceptación: No usar consent=true universal para todos los flujos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C07-T02

Acción: Crear ledger grant/withdraw/restriction con prueba/versiones.

Aceptación: Estado actual se reconstruye sin borrar historia.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C07-T03

Acción: Definir preferencias por sujeto/canal/marca/purpose según contrato.

Aceptación: Buzón compartido no traslada permiso entre personas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C07-T04

Acción: Integrar supresión/oposiciones del padre o custodio mediante contrato.

Aceptación: Lead aceptado no implica permission marketing.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C07-T05

Acción: Configurar política de tags/cookies y señales técnicas separadas.

Aceptación: Consent Mode/cookie-free no habilitan tracking sin decisión aplicable.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C07-T06

Acción: Revalidar elegibilidad justo antes del efecto con política de frescura.

Aceptación: Dato stale/unknown bloquea, no supone autorización.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C07-T07

Acción: Probar retirada en cola, cambio de finalidad y sincronización tardía.

Aceptación: No se añaden miembros ni se ignoran bajas por caché.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C07-G01 — NOT_EXECUTED:** Persona retira permiso entre approval y dispatch: bloqueada para efectos nuevos.
- **MKT-C07-G02 — NOT_EXECUTED:** Consentimiento AV intenta habilitar audience upload o newsletter: denegado.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: L01, L02, L03, L04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
