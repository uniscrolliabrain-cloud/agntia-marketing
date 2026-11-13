# MKT-C16 · Marca, assets y evidencia de claims

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia16/42. Dependencia: MKT-C15.

## Objetivo e invariante

Producir materiales con derechos y fuentes revisables.

Invariante: Un modelo no inventa testimonios, licencias o soporte de afirmaciones.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/brand-policy/`
- `packages/assets/`
- `packages/claims/`

## Tareas en orden

### MKT-C16-T01

Acción: Importar BrandPolicySnapshot de branding o módulo local autorizado.

Aceptación: Versión/custodio/derechos, no solo prompt de tono.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C16-T02

Acción: Crear ledger de assets/licencias/releases de personas.

Aceptación: Ausencia de derechos bloquea publicación aunque asset se vea en internet.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C16-T03

Acción: Definir ClaimEvidence con soporte/contradicción/vigencia.

Aceptación: Número o cita fabricados quedan unverified.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C16-T04

Acción: Generar variantes ES/EN/FR con fuentes y locale.

Aceptación: Traducción preserva importes, límites y disclaimers revisados.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C16-T05

Acción: Crear QA de formato/legibilidad/destino y contenido regulado.

Aceptación: Visión/LLM detectan posibles problemas pero no otorgan permiso.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C16-T06

Acción: Vincular revisiones de creativo/rights al approval hash.

Aceptación: Cambio de imagen/texto/claim invalida aprobación material.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C16-T07

Acción: Probar archivo adversarial, fuente caducada y derechos revocados.

Aceptación: Se bloquea nuevo efecto y conserva versión histórica.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C16-G01 — NOT_EXECUTED:** IA inventa caso de éxito o beneficio médico: no habilita CreativeRevision publicable.
- **MKT-C16-G02 — NOT_EXECUTED:** Revocar licencia entre preview y dispatch impide uso nuevo del asset.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: P06, H01, V01, V02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
