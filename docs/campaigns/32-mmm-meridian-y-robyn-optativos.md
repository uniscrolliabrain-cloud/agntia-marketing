# MKT-C32 · MMM Meridian y Robyn optativos

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia32/42. Dependencia: MKT-C31.

## Objetivo e invariante

Ejecutar análisis agregado aislado solo si datos/método/recursos son aptos.

Invariante: Instalar MMM no crea causalidad ni aptitud para cualquier pyme.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/model-jobs/`
- `workers/measurement/`
- `tests/mmm-admissibility.test.ts`

## Tareas en orden

### MKT-C32-T01

Acción: Fijar versiones/licencias/runtime y elegir motor inicial justificado.

Aceptación: Referencia rama Robyn no se adopta automáticamente estable.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C32-T02

Acción: Definir contrato de dataset agregado y controles/periodos/geo.

Aceptación: No completar historia real con sintéticos para pasar admisibilidad.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C32-T03

Acción: Validar missing, colinealidad, cambios de régimen y calidad.

Aceptación: Datos insuficientes producen blocked/needs_review.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C32-T04

Acción: Fijar priors/transformaciones/seeds y presupuesto de cómputo.

Aceptación: LLM no ejecuta scripts o librerías arbitrarias.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C32-T05

Acción: Ejecutar worker aislado sin secretos de canal y outputs tipados.

Aceptación: Un model job no puede comprar medios o leer otro tenant.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C32-T06

Acción: Evaluar diagnostics, calibración experimental y sensibilidad.

Aceptación: No seleccionar solo por R², MAPE o gráfica bonita.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C32-T07

Acción: Probar datos sintéticos con verdad conocida y restore de artifacts.

Aceptación: ModelRun reproducible con límites y sin score de autores heredado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C32-G01 — NOT_EXECUTED:** Serie corta/confundida no genera recomendación firme por necesidad comercial.
- **MKT-C32-G02 — NOT_EXECUTED:** Modelo pide GPU/coste mayor que reserva: se bloquea sin gasto sorpresa.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: R06, R07, A10, P02, P04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
