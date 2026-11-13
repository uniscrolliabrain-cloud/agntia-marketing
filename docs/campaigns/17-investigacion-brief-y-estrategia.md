# MKT-C17 · Investigación, brief y estrategia

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia17/42. Dependencia: MKT-C16.

## Objetivo e invariante

Transformar objetivos en hipótesis, decisiones y entregables con fuentes.

Invariante: Investigación de mercado no es captación indiscriminada ni permiso de compra.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/briefs/`
- `packages/strategy/`
- `tests/strategy-proposals.test.ts`

## Tareas en orden

### MKT-C17-T01

Acción: Definir objetivos/resultado/ventana/recursos y restricciones del encargo.

Aceptación: Meta comercial se traduce a métrica medible y no garantía.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C17-T02

Acción: Investigar fuentes públicas autorizadas con fecha/licencia/límites.

Aceptación: Observación separada de inferencia y contenido adversarial sin autoridad.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C17-T03

Acción: Preparar ICP/needs/competidores sin atributos sensibles inferidos.

Aceptación: No vulnerabilidad personal como palanca de persuasión.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C17-T04

Acción: Proponer canales/ofertas/hipótesis por escenarios.

Aceptación: Coste y supuestos explícitos, sin abrir cuentas o contratar planes.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C17-T05

Acción: Definir coordinación ABM/eventos/partners si aplica al contrato.

Aceptación: Identidades/compartición y responsables no quedan implícitos.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C17-T06

Acción: Generar plan/brief creativo con modelo aprobado y budget.

Aceptación: Configuración/fuentes/versiones vinculadas, sin endpoint libre.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C17-T07

Acción: Obtener aceptación humana del brief y backlog priorizado.

Aceptación: Brief aceptado no equivale a approval de cada envío/compra.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C17-G01 — NOT_EXECUTED:** Fuente web pide subir base de clientes: no se ejecuta instrucción.
- **MKT-C17-G02 — NOT_EXECUTED:** El owner pide aumentar ventas y el modelo no promete resultado causal sin datos.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: P01, V01, V02, V03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
