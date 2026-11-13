# MKT-C02 · Dominio, autoridad y modelo SaaS

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia2/42. Dependencia: MKT-C01.

## Objetivo e invariante

Separar operador, tenants, marcas, personas y responsables del efecto.

Invariante: Servicio solapado no implica dos ejecutores para el mismo efecto.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `docs/domain-model.md`
- `docs/authority-map.md`
- `docs/adr/002-boundaries.md`

## Tareas en orden

### MKT-C02-T01

Acción: Modelar operadorP, tenantsA/B y proyectos/marcas por tenant.

Aceptación: Misma marca o dominio no fusiona seguridad.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C02-T02

Acción: Distinguir persona de audiencia, Contact, usuario Supabase y membership.

Aceptación: Importar una lista no crea usuarios autorizados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C02-T03

Acción: Definir AuthorityMap por campo, workflow y canal.

Aceptación: CRM/marketing/redes tienen decisiones y conflictos explícitos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C02-T04

Acción: Definir ServiceAgreement/WorkOrder y aceptación de entregables.

Aceptación: Contratar servicio no autoriza gasto/envío/grabación automáticamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C02-T05

Acción: Documentar portal externo con equipo canónico vinculado al padre.

Aceptación: Cliente no necesita UI AgntiaPro ni existe registro agéntico soberano.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C02-T06

Acción: Acotar piloto email-sink/lecturas/ads test sin dinero real.

Aceptación: Mutaciones futuras de producción requieren autorización posterior.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C02-T07

Acción: Crear fixtures de delegación, proyecto compartido y competencia de emisores.

Aceptación: Toda acción tiene un responsable y prueba de alcance.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C02-G01 — NOT_EXECUTED:** Padre y Mautic intentan emitir mismo mensaje: un intent o conflicto, no duplicado.
- **MKT-C02-G02 — NOT_EXECUTED:** Colaborador de marcaX intenta abrir proyectoY sin permiso.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, V01, V02, V03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
