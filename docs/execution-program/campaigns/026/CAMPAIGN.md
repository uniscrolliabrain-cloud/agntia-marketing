# MKT-C26 · SEO técnico y cambios web propuestos

**PROGRAMA PREVIO · NOT_STARTED · 26/42.** [Campaña original](../../campaigns/26-seo-tecnico-y-cambios-web-propuestos.md).

## Objetivo y contrato
Auditar sitios autorizados y preparar mejoras sin publicación automática.

**Invariante:** Crawl autorizado no concede permiso para editar o copiar cualquier sitio.. **Dependencias:** MKT-C25. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/seo.ts`.
- DTO/validación: `packages/contracts/src/26.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/26.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/026.test.ts` y fixtures `tests/fixtures/026/`.
- Evidencia: `docs/evidence/c26/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/seo/`, `packages/site-audits/`, `tests/seo-audit.test.ts`.

## Patchsets y aceptación por tarea
### 026.01 — MKT-C26-T01
**Acción:** Verificar propiedad/alcance de dominios y rate/robots/condiciones.

**Archivo primario:** `packages/domain/src/seo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No crawl arbitrario desde texto del agente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 026.02 — MKT-C26-T02
**Acción:** Analizar status/canonical/indexability/metadatos/enlaces con límites.

**Archivo primario:** `packages/domain/src/seo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** SSRF/redirect/private paths quedan fuera.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C26-T01.

### 026.03 — MKT-C26-T03
**Acción:** Vincular hallazgos a URL/fecha/evidencia y severidad explicada.

**Archivo primario:** `packages/domain/src/seo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No penalización de ranking inventada.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C26-T02.

### 026.04 — MKT-C26-T04
**Acción:** Proponer contenido útil y correcciones con diff/custodio.

**Archivo primario:** `packages/domain/src/seo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No keyword stuffing, páginas en masa o citas fabricadas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C26-T03.

### 026.05 — MKT-C26-T05
**Acción:** Validar structured data contra hechos visibles y derechos.

**Archivo primario:** `packages/domain/src/seo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Schema mágico no promete inclusión en IA.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C26-T04.

### 026.06 — MKT-C26-T06
**Acción:** Definir change proposal CMS/repo sin tocar agente o producción.

**Archivo primario:** `packages/domain/src/seo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Apply requiere autorización/capacidad aparte.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C26-T05.

### 026.07 — MKT-C26-T07
**Acción:** Probar site fixture, contenido adversarial y datos desactualizados.

**Archivo primario:** `packages/domain/src/seo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Recomendación stale no se aplica ciegamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C26-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C26-G01 / NOT_EXECUTED:** Página incluye instrucción de tool/admin o URL metadata: se trata como dato hostil.
- **MKT-C26-G02 / NOT_EXECUTED:** Hallazgo SEO no dispara deploy de página ni sitemap de producción.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
