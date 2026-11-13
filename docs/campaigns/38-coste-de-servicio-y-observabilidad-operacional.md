# MKT-C38 · Coste de servicio y observabilidad operacional

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia38/42. Dependencia: MKT-C37.

## Objetivo e invariante

Medir consumo y fiabilidad antes de prometer planes y escala.

Invariante: Bolsas30/70/300 son hipótesis, no tarifa/proveedor contratado ni gasto de medios.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/observability/`
- `packages/usage/`
- `docs/cost-workloads.md`

## Tareas en orden

### MKT-C38-T01

Acción: Verificar tarifas/mínimos/región/retención de proveedores elegidos.

Aceptación: No precios de memoria ni compra para pasar un gate.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C38-T02

Acción: Instrumentar tokens/minutosAV/email/storage/egress/compute por operación.

Aceptación: Consumo observado ligado a reserva y receipt.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C38-T03

Acción: Aplicar routing de modelos aprobados y escalado bajo presupuesto.

Aceptación: Fallback barato no mueve PII a proveedor no aprobado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C38-T04

Acción: Implementar rate-limit/backpressure y aislamiento de ruido.

Aceptación: Un tenant no monopoliza cola/cómputo ajenos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C38-T05

Acción: Crear logs/traces sanitizados y métricas de lag/unknown/conflictos.

Aceptación: No JWT/tokens/emails en etiquetas de telemetría.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C38-T06

Acción: Medir p50/p95, costo por tarea válida y sensibilidad de volumen.

Aceptación: No presentar una simulación como SLA comercial.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C38-T07

Acción: Probar agotamiento y reconciliación tardía con extras disabled.

Aceptación: Seguridad no se degrada; AV/MMM se bloquea si no cabe.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C38-G01 — NOT_EXECUTED:** Plan mínimo AV supera bolsaLite: no se activa cargo automático.
- **MKT-C38-G02 — NOT_EXECUTED:** Segundo tenant bajo carga conserva límites/servicio sin lectura cruzada.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: N01, H01, V06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
