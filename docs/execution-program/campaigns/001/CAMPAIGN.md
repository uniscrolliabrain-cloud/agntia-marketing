# MKT-C01 · Baseline y perímetro autorizado

**PROGRAMA PREVIO · NOT_STARTED · 1/42.** [Campaña original](../../campaigns/01-baseline-y-perimetro-autorizado.md).

## Objetivo y contrato
Congelar estado documental, padre y fuentes antes de introducir código.

**Invariante:** No modificar agente; diseño no significa capacidad operativa.. **Dependencias:** ninguna. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `docs/baseline.md`.
- DTO/validación: `packages/contracts/src/01.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/01.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/001.test.ts` y fixtures `tests/fixtures/001/`.
- Evidencia: `docs/evidence/c01/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `docs/baseline.md`, `docs/parent-diff.md`, `docs/evidence/c01/`.

## Patchsets y aceptación por tarea
### 001.01 — MKT-C01-T01
**Acción:** Anotar SHA propio/padre, fecha, árbol e instrucciones aplicables.

**Archivo primario:** `docs/baseline.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Registro reproducible con scopes de lectura/escritura explícitos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 001.02 — MKT-C01-T02
**Acción:** Inventariar contratos Actor/JWT/provenance/tasks/events que necesita marketing.

**Archivo primario:** `docs/baseline.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Ruta/blob y alcance de lectura; no símbolos inventados como existentes.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C01-T01.

### 001.03 — MKT-C01-T03
**Acción:** Cotejar lead discovery/accept y seguimiento/oposiciones del padre.

**Archivo primario:** `docs/baseline.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Buscar/aceptar no se convierten en consentimiento de campaña.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C01-T02.

### 001.04 — MKT-C01-T04
**Acción:** Capturar catálogo12/16 y plantilla marketing por revisión.

**Archivo primario:** `docs/baseline.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No presumir runtimes activos ni crear agentes canónicos aquí.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C01-T03.

### 001.05 — MKT-C01-T05
**Acción:** Inventariar herramientas, red, Docker y permisos disponibles.

**Archivo primario:** `docs/baseline.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Gate sin entorno queda NOT_VERIFIED, no PASS con mock.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C01-T04.

### 001.06 — MKT-C01-T06
**Acción:** Congelar manifiesto inicial de documentos y refs de investigación.

**Archivo primario:** `docs/baseline.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Rutas futuras no cuentan como implementación ni tests ejecutados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C01-T05.

### 001.07 — MKT-C01-T07
**Acción:** Crear bitácora sanitizada y primer checkpoint de riesgos.

**Archivo primario:** `docs/baseline.md`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Fallos preexistentes separados de cambios de campaña.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C01-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C01-G01 / NOT_EXECUTED:** SHA padre cambia entre lecturas: detener mapping hasta cotejar.
- **MKT-C01-G02 / NOT_EXECUTED:** Intentar ejecutar campaña real para probar baseline queda fuera de alcance.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: docs/BASELINE.md, docs/PARENT-DIFF.md
Tests ejecutados: 26 en `tests/campaigns/c01-c10.test.ts` (`npx vitest run tests/campaigns/c01-c10.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C01-G01 / PASS:** SHA padre cambia entre lecturas: detener mapping hasta cotejar.
- **MKT-C01-G02 / PASS:** Intentar ejecutar campaña real para probar baseline queda fuera de alcance.

Desviaciones y ajustes de diseño: Se documenta el entorno real: sin daemon Docker ni Postgres, por lo que la persistencia real no se declara PASS.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Mantener el baseline como documento vivo cuando cambie el SHA del padre.
