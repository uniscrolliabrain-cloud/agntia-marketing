# MKT-C21 · Frecuencia, presupuestos y límites de contacto

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia21/42. Dependencia: MKT-C20.

## Objetivo e invariante

Evitar fatiga y doble gasto sin confundir bolsas económicas.

Invariante: Rate-limit, permiso, presupuesto de servicio y medios son controles diferentes.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/frequency/`
- `packages/budget/`
- `tests/caps-concurrency.test.ts`

## Tareas en orden

### MKT-C21-T01

Acción: Definir caps por sujeto/canal/marca/purpose/periodo conforme contrato.

Aceptación: No usar identidad global entre tenants sin base/permiso.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C21-T02

Acción: Definir bolsillos separados de inferencia/AV/email/medios.

Aceptación: Plan30€ no autoriza30€ de publicidad.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C21-T03

Acción: Implementar reserva transaccional por operationKey y moneda.

Aceptación: Dos workers no consumen el mismo último saldo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C21-T04

Acción: Coordinar caps con padre/redes/otros emisores mediante ledger/puerto.

Aceptación: Si no existe autoridad común, no prometer cap global exacto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C21-T05

Acción: Revalidar fatiga/supresión/budget justo antes de dispatch.

Aceptación: Prioridad comercial no salta bloqueo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C21-T06

Acción: Definir consumo real, liberación y ajuste tardío.

Aceptación: Cuota o factura remota no se inventa a partir de un intento.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C21-T07

Acción: Probar límites de volumen, coste desconocido y override humano autorizado.

Aceptación: Override no elimina consentimiento ni aislamiento.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C21-G01 — NOT_EXECUTED:** Dos journeys simultáneos compiten por último slot de contacto: uno queda bloqueado.
- **MKT-C21-G02 — NOT_EXECUTED:** Forecast de medios intenta reservar tokens del SaaS como ad spend: rechazado.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, L02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
