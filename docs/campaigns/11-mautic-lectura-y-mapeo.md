# MKT-C11 · Mautic lectura y mapeo

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia11/42. Dependencia: MKT-C10.

## Objetivo e invariante

Verificar backend de contactos/segmentos por instancia autorizada.

Invariante: API disponible no prueba aislamiento multitenant de la instalación.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/mautic/read.ts`
- `docs/adapters/mautic.md`
- `tests/integration/mautic-read.test.ts`

## Tareas en orden

### MKT-C11-T01

Acción: Fijar release/imagen/licencia y resolver inconsistencia de docs.

Aceptación: SHA de rama observada no se usa como pin de producción sin validar.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C11-T02

Acción: Validar binding tenant→instancia/contexto y cuenta bot mínima.

Aceptación: Si compartido no es seguro, exigir instancia dedicada.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C11-T03

Acción: Descubrir API habilitada/campos/permisos/edición reales.

Aceptación: No modificar configuración del padre o proveedor producción para pasar gate.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C11-T04

Acción: Leer contactos/segmentos/preferencias con fields y paginación cerrados.

Aceptación: No descargar todo con admin para filtrar después.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C11-T05

Acción: Mapear do-not-contact, identidades y fechas con provenance.

Aceptación: Falta de campo de permiso produce unknown, no eligible.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C11-T06

Acción: Crear staging/links y conflicto por cambios remotos.

Aceptación: Campo revisado no se pisa por último escritor.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C11-T07

Acción: Probar dos instancias/roles,1000+ registros y ausencia API.

Aceptación: Mocks separados de capacidad real, sin activar campaigns.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C11-G01 — NOT_EXECUTED:** Token de instanciaB en conexiónA no lista contactos deB.
- **MKT-C11-G02 — NOT_EXECUTED:** Mautic API deshabilitada produce unsupported, sin scraping fallback.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: R01, A01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
