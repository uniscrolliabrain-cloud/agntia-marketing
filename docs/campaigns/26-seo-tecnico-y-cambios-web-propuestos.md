# MKT-C26 · SEO técnico y cambios web propuestos

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**.
Secuencia26/42. Dependencia: MKT-C25.

## Objetivo e invariante

Auditar sitios autorizados y preparar mejoras sin publicación automática.

Invariante: Crawl autorizado no concede permiso para editar o copiar cualquier sitio.

## Precondiciones y alcance

Cerrar gate anterior, congelar SHA/entorno/ediciones y consultar contratos/fuentes. Las rutas siguientes son artefactos propuestos para una implementación futura autorizada, no código existente. No editar `/agente`, instalarle paquetes, modificar claims/enums ni aplicar wiring en esta campaña.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. Agente canónico en el padre, twin ligado aquí por mandato verificable. Conservar nombres nativos/provenance y separar tenant de origen de ámbito objetivo. Cliente externo usa portal propio sin crear registro agéntico independiente.

## Artefactos previstos

- `packages/seo/`
- `packages/site-audits/`
- `tests/seo-audit.test.ts`

## Tareas en orden

### MKT-C26-T01

Acción: Verificar propiedad/alcance de dominios y rate/robots/condiciones.

Aceptación: No crawl arbitrario desde texto del agente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C26-T02

Acción: Analizar status/canonical/indexability/metadatos/enlaces con límites.

Aceptación: SSRF/redirect/private paths quedan fuera.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C26-T03

Acción: Vincular hallazgos a URL/fecha/evidencia y severidad explicada.

Aceptación: No penalización de ranking inventada.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C26-T04

Acción: Proponer contenido útil y correcciones con diff/custodio.

Aceptación: No keyword stuffing, páginas en masa o citas fabricadas.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C26-T05

Acción: Validar structured data contra hechos visibles y derechos.

Aceptación: Schema mágico no promete inclusión en IA.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C26-T06

Acción: Definir change proposal CMS/repo sin tocar agente o producción.

Aceptación: Apply requiere autorización/capacidad aparte.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

### MKT-C26-T07

Acción: Probar site fixture, contenido adversarial y datos desactualizados.

Aceptación: Recomendación stale no se aplica ciegamente.

Evidencia pendiente: diff/SHA, fixture, salida real sanitizada y estado resultante. Si no se puede ejecutar, registrar el bloqueo y no habilitar la capacidad.

## Gates específicos

- **MKT-C26-G01 — NOT_EXECUTED:** Página incluye instrucción de tool/admin o URL metadata: se trata como dato hostil.
- **MKT-C26-G02 — NOT_EXECUTED:** Hallazgo SEO no dispara deploy de página ni sitemap de producción.

Para pasar: ejecutar unit/contratos y laboratorio real pertinentes; distinguir fake, sandbox y proveedor real. Mocks prueban lógica local, no API/edición/ACL productivos. Sin Docker/red/cuenta/permisos, el gate de integración queda BLOCKED o NOT_VERIFIED; no seguir habilitando capacidades dependientes. Verificar no regresión de scopes, aprobaciones, supresión, máximos de audiencia, idempotencia y audit.

No gastar dinero ni usar datos/clientes reales para forzar un PASS. Ningún test de esta campaña activa ads de producción o manda a listas reales. Un endpoint de test email es un efecto y debe estar acotado al sink/allowlist. Publicar, exportar audience y hacer tracking tienen capacidades independientes.

## Evidencia y reversión

Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

Registrar lecturas/writes ensayados, actor/tenant/mandato/purpose, estado inicial y final, receipts, fallos deliberados, tests reales passed/failed/skipped, versiones, tiempos y coste si existe. No volcar prompts, listas, tokens, PII o payload remoto completo al repo público; guardar evidencia sensible fuera y referenciar mínimo necesario.

Detener ante fuga, bypass, secreto, duplicado, gasto, pérdida de audit o afirmación de medición sin sustento. Resolver antes de avanzar. Reportar después de5/10/15/20/25/30/35/40/42 con cambios, resultados, riesgos y siguiente dependencia. Una fase especificada no es una fase ejecutada.

Fuentes: A07, A09, L01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md), [mapa padre](../research/parent-source-map.json) y [medición](../09-medicion-y-evaluacion.md).
