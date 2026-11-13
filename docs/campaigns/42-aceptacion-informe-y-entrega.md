# MKT-C42 · Aceptación, informe y entrega

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia42/42. Dependencia: MKT-C41.

## Objetivo e invariante

Consolidar evidencia, límites y backlog para decidir piloto real.

Invariante: Pendiente o no verificado no se declara terminado, conforme o paridad mundial.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `docs/release/final-report.md`
- `docs/release/acceptance.md`
- `docs/release/handoff-next.md`

## Tareas en orden

### MKT-C42-T01

Acción: Consolidar42 campañas PASS/BLOCKED/NOT_VERIFIED con commits/PRs.

Aceptación: Cada PASS enlaza resultado real, no documento que planea el test.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C42-T02

Acción: Inventariar tests ejecutados/pasados/fallidos/skipped por entorno.

Aceptación: No sumar84 escenarios planeados como pruebas ejecutadas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C42-T03

Acción: Publicar matriz de funciones/ediciones/roles/canales habilitados.

Aceptación: Función optativa sin evidencia sigue deshabilitada.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C42-T04

Acción: Revisar STOP conditions de seguridad/consentimiento/doble efecto/medición.

Aceptación: Cualquier crítico falla aceptación hasta resolverse.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C42-T05

Acción: Entregar demo sintética y manuales/costes/restore/rollback.

Aceptación: Owner puede rastrear actor/fuente/approval/receipt y límites.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C42-T06

Acción: Documentar producción/presupuesto/contratos y wiring que requieren otro permiso.

Aceptación: Cero cambios aplicados a agente o gasto real por esta campaña.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C42-T07

Acción: Entregar backlog de expansión y handoff a siguiente equipo.

Aceptación: No promesas de ROI/rankings/cumplimiento universal ni cobertura inventada.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C42-G01 — NOT_EXECUTED:** Se intenta aprobar piloto con conector real crítico no probado: BLOCKED.
- **MKT-C42-G02 — NOT_EXECUTED:** Owner reproduce un efecto y reporte desde fixture hasta receipt/claim verificable.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: H01, P01, P04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
