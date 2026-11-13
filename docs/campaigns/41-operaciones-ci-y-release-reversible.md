# MKT-C41 · Operaciones, CI y release reversible

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia41/42. Dependencia: MKT-C40.

## Objetivo e invariante

Preparar despliegue controlado, restauración y rollback sin producción automática.

Invariante: No comprar servicios, tocar padre o desplegar producción por acabar campañas.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `docs/operations/`
- `.github/workflows/ci.yml`
- `infra/`

## Tareas en orden

### MKT-C41-T01

Acción: Definir CI lint/typecheck/unit/contract/security/browser e integración.

Aceptación: Skips críticos visibles, no verde engañoso.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C41-T02

Acción: Fijar releases/digests/lockfiles y secrets por entorno.

Aceptación: No latest móvil o clave real en ejemplos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C41-T03

Acción: Crear runbooks de outage, credencial, DLQ, unknown y supresión.

Aceptación: Señal/responsable/acción/verificación, no solo consejos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C41-T04

Acción: Probar backup/restore y rollback de flags/conector/policy.

Aceptación: Mantener links/audit/receipts y no reactivar campañas históricas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C41-T05

Acción: Definir release candidata de prompt/KB/modelo/journey con eval/revisión.

Aceptación: Cambio de contenido no salta aprobación de efecto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C41-T06

Acción: Medir carga/alertas/costes en staging sintético.

Aceptación: SLA y presupuesto publicados solo con hipótesis/resultados claros.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C41-T07

Acción: Preparar guía/paquete instalable probado de este repo.

Aceptación: Wiring del padre queda patch documental para otro encargo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C41-G01 — NOT_EXECUTED:** Pausa remoto sin ACK sigue estado incierto tras rollback y no se considera deshecha.
- **MKT-C41-G02 — NOT_EXECUTED:** Restore completo preserva permisos/supresión y no reenvía outbox confirmada.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: S01, S02, H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
