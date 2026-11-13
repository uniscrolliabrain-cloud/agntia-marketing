# MKT-C31 · Atribución e incrementalidad admisible

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia31/42. Dependencia: MKT-C30.

## Objetivo e invariante

Separar crédito de efecto causal y validar datasets de medición.

Invariante: Ajuste, correlación o ventas atribuidas no prueban incremento.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/measurement/claims/`
- `docs/identification-contract.md`
- `tests/measurement-claims.test.ts`

## Tareas en orden

### MKT-C31-T01

Acción: Definir métricas de negocio, ingreso neto/bruto/margen y fuentes.

Aceptación: Sin coste/margen no mostrar beneficio inventado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C31-T02

Acción: Deduplicar ConversionFacts y aplicar cancelaciones/refunds.

Aceptación: Una venta atribuida por varios canales cuenta una vez como hecho.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C31-T03

Acción: Definir reglas de atribución versionadas y límites de ventana.

Aceptación: Reporte etiqueta explícitamente plataforma/modelo y cobertura.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C31-T04

Acción: Crear contrato causal con estimand/población/tratamiento/controles.

Aceptación: No denominar causal una regresión sin justificación.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C31-T05

Acción: Validar experimentos naturales/cortes con supuestos y alternativas.

Aceptación: Intervención descubierta no se asume exógena.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C31-T06

Acción: Calcular incertidumbre/sensibilidad y estados insufficient/blocked.

Aceptación: Salida descriptiva sigue útil sin fabricar iROAS.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C31-T07

Acción: Probar confusión endógena, placebo y efecto conocido sintético.

Aceptación: Se mide recuperación/false conclusions, no solo fit.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C31-G01 — NOT_EXECUTED:** Modelo ajusta bien pero atribuye ventas preexistentes: no se certifica causalidad.
- **MKT-C31-G02 — NOT_EXECUTED:** Plataforma reporta ingresos pero no IDs negocio: cobertura/dedup limitados se explican.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: P02, P03, P04, A06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
