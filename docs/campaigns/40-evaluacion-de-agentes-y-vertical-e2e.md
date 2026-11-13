# MKT-C40 · Evaluación de agentes y vertical E2E

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia40/42. Dependencia: MKT-C39.

## Objetivo e invariante

Verificar trayectoria, datos, efectos y medición con fixtures reproducibles.

Invariante: Texto convincente o mock verde no compensan efecto incorrecto o conector sin probar.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `tests/e2e/`
- `tests/evals/`
- `docs/e2e-evidence.md`

## Tareas en orden

### MKT-C40-T01

Acción: Crear fixtures propios A/B/P y dataset con endogeneidad/efecto conocido.

Aceptación: Sin datos reales ni material sin licencia incorporado.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C40-T02

Acción: Ejecutar E2E A–I, reseteando entorno y seeds por caso.

Aceptación: Estado inicial/final y protected state registrados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C40-T03

Acción: Combinar assertions deterministas de tools/estado con juez de lenguaje.

Aceptación: No dar PASS a cifra falsa por tono profesional.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C40-T04

Acción: Repetir ES/EN/FR y cambios concurrentes de audiencia/policy/claims.

Aceptación: No extrapolar un idioma o configuración al resto.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C40-T05

Acción: Inyectar caída DB/proveedor/worker y revocación en cola.

Aceptación: Sin doble envío, pérdida de audit o permiso residual.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C40-T06

Acción: Medir calidad/coste/latencia/cobertura y conclusiones causales falsas.

Aceptación: Resultados con métodos/versions; sin scores de autores heredados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C40-T07

Acción: Distinguir real/sandbox/fake y publicar matriz de capacidades.

Aceptación: Conector sin laboratorio NOT_VERIFIED y disabled, no producto completo.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C40-G01 — NOT_EXECUTED:** Buen fit MMM con recuperación causal mala no pasa gate científico.
- **MKT-C40-G02 — NOT_EXECUTED:** Respuesta final correcta con acción prohibida intermedia falla la evaluación.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: P01, P02, P04, P06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
