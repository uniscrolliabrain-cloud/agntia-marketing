# MKT-C27 · AEO y GEO observacional

**PROGRAMA PREVIO · NOT_STARTED · 27/42.** [Campaña original](../../campaigns/27-aeo-y-geo-observacional.md).

## Objetivo y contrato
Medir visibilidad generativa con panel reproducible y límites.

**Invariante:** No hay garantía de mención/ranking ni API universal de respuestas de consumo.. **Dependencias:** MKT-C26. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/aeo-geo.ts`.
- DTO/validación: `packages/contracts/src/27.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/27.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/027.test.ts` y fixtures `tests/fixtures/027/`.
- Evidencia: `docs/evidence/c27/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/aeo/`, `docs/aeo-measurement-contract.md`, `tests/aeo-observations.test.ts`.

## Patchsets y aceptación por tarea
### 027.01 — MKT-C27-T01
**Acción:** Definir panel de preguntas/fuentes/idiomas/regiones aprobado.

**Archivo primario:** `packages/domain/src/aeo-geo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Se evita personalización sensible y consultas con PII.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 027.02 — MKT-C27-T02
**Acción:** Seleccionar APIs/acuerdos de acceso permitidos por proveedor.

**Archivo primario:** `packages/domain/src/aeo-geo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Si no hay acceso, unsupported sin browser scraping evasivo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C27-T01.

### 027.03 — MKT-C27-T03
**Acción:** Guardar modelo/versión/config/fecha y evidencia de respuesta.

**Archivo primario:** `packages/domain/src/aeo-geo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Observaciones no equivalen al buscador de todos los usuarios.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C27-T02.

### 027.04 — MKT-C27-T04
**Acción:** Definir métricas de mención/cita/cobertura y variabilidad.

**Archivo primario:** `packages/domain/src/aeo-geo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Ausente, error y no disponible no se mezclan.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C27-T03.

### 027.05 — MKT-C27-T05
**Acción:** Comparar cambios con controles/repeticiones y límites explícitos.

**Archivo primario:** `packages/domain/src/aeo-geo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Mejora observada no se declara efecto causal sin diseño.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C27-T04.

### 027.06 — MKT-C27-T06
**Acción:** Proponer mejoras de contenido basadas en fuentes/claridad.

**Archivo primario:** `packages/domain/src/aeo-geo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No fabricar estadísticas/reviews o explotar prompt injection en sitios.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C27-T05.

### 027.07 — MKT-C27-T07
**Acción:** Probar ES/EN/FR, cambio de modelo y coste de consultas.

**Archivo primario:** `packages/domain/src/aeo-geo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Reporte conserva versiones y no extrapola benchmark GEO histórico.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C27-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C27-G01 / NOT_EXECUTED:** Proveedor cambia modelo: serie se marca cambio de régimen, no victoria de campaña.
- **MKT-C27-G02 / NOT_EXECUTED:** Generar fake citations para aparecer más en IA queda bloqueado.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: PARTIAL
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/measurement.ts
Tests ejecutados: 17 en `tests/campaigns/c21-c30.test.ts` (`npx vitest run tests/campaigns/c21-c30.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C27-G01 / NOT_VERIFIED:** Proveedor cambia modelo: serie se marca cambio de régimen, no victoria de campaña.
- **MKT-C27-G02 / NOT_VERIFIED:** Generar fake citations para aparecer más en IA queda bloqueado.

Desviaciones y ajustes de diseño: Se registran observaciones AEO/GEO; no hay monitorización programada.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Programar prompt-set con límites y sin garantizar aparición.
