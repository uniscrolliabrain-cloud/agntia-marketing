# MKT-C34 · Dashboard, infografías y briefing

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia34/42. Dependencia: MKT-C33.

## Objetivo e invariante

Mostrar trabajo y resultados reproducibles sin rellenar huecos.

Invariante: La visualización no convierte estimación o dato ausente en hecho.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/reporting/`
- `apps/portal/reports/`
- `docs/metrics-catalog.md`

## Tareas en orden

### MKT-C34-T01

Acción: Definir catálogo de KPI con definición/denominador/exclusiones.

Aceptación: CTR/CVR/ROAS no se suman o promedian sin regla.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C34-T02

Acción: Crear snapshots con datasets/filtros/versions/hash y ACL.

Aceptación: Mismo snapshot reproduce cifras aunque fuente cambie.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C34-T03

Acción: Construir gráficos/tablas con coverage/freshness/uncertainty.

Aceptación: Descriptivo/atribuido/causal visibles en cada claim.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C34-T04

Acción: Agregar timeline de entregables, approvals, efectos y bloqueos.

Aceptación: Laia/supervisor solo reporta trabajo con receipt/evidencia.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C34-T05

Acción: Generar narrativa con fuentes y afirmaciones verificables.

Aceptación: Modelo no rellena ingresos/métricas que faltan.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C34-T06

Acción: Exportar PDF/SVG/HTML u otros formatos tras revisión de datos.

Aceptación: Sin PII/secretos/CSV injection o enlaces de otros tenants.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C34-T07

Acción: Probar cifras tardías, cero, null y reporte multilingüe.

Aceptación: Nueva revisión no altera silenciosamente un informe aceptado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C34-G01 — NOT_EXECUTED:** Sin conversiones observadas no se afirma ROI ni fracaso sin cobertura.
- **MKT-C34-G02 — NOT_EXECUTED:** InformeA no muestra lista, modelo, links o agregados identificables deB.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: P01, V06, A06, A07. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
