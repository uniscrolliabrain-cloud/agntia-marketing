# MKT-C41 · Operaciones, CI y release reversible

**PROGRAMA PREVIO · NOT_STARTED · 41/42.** [Campaña original](../../campaigns/41-operaciones-ci-y-release-reversible.md).

## Objetivo y contrato
Preparar despliegue controlado, restauración y rollback sin producción automática.

**Invariante:** No comprar servicios, tocar padre o desplegar producción por acabar campañas.. **Dependencias:** MKT-C40. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `.github/workflows/ci.yml`.
- DTO/validación: `packages/contracts/src/41.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/41.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/041.test.ts` y fixtures `tests/fixtures/041/`.
- Evidencia: `docs/evidence/c41/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `docs/operations/`, `.github/workflows/ci.yml`, `infra/`.

## Patchsets y aceptación por tarea
### 041.01 — MKT-C41-T01
**Acción:** Definir CI lint/typecheck/unit/contract/security/browser e integración.

**Archivo primario:** `.github/workflows/ci.yml`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Skips críticos visibles, no verde engañoso.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 041.02 — MKT-C41-T02
**Acción:** Fijar releases/digests/lockfiles y secrets por entorno.

**Archivo primario:** `.github/workflows/ci.yml`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No latest móvil o clave real en ejemplos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C41-T01.

### 041.03 — MKT-C41-T03
**Acción:** Crear runbooks de outage, credencial, DLQ, unknown y supresión.

**Archivo primario:** `.github/workflows/ci.yml`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Señal/responsable/acción/verificación, no solo consejos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C41-T02.

### 041.04 — MKT-C41-T04
**Acción:** Probar backup/restore y rollback de flags/conector/policy.

**Archivo primario:** `.github/workflows/ci.yml`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Mantener links/audit/receipts y no reactivar campañas históricas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C41-T03.

### 041.05 — MKT-C41-T05
**Acción:** Definir release candidata de prompt/KB/modelo/journey con eval/revisión.

**Archivo primario:** `.github/workflows/ci.yml`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cambio de contenido no salta aprobación de efecto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C41-T04.

### 041.06 — MKT-C41-T06
**Acción:** Medir carga/alertas/costes en staging sintético.

**Archivo primario:** `.github/workflows/ci.yml`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** SLA y presupuesto publicados solo con hipótesis/resultados claros.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C41-T05.

### 041.07 — MKT-C41-T07
**Acción:** Preparar guía/paquete instalable probado de este repo.

**Archivo primario:** `.github/workflows/ci.yml`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Wiring del padre queda patch documental para otro encargo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C41-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C41-G01 / NOT_EXECUTED:** Pausa remoto sin ACK sigue estado incierto tras rollback y no se considera deshecha.
- **MKT-C41-G02 / NOT_EXECUTED:** Restore completo preserva permisos/supresión y no reenvía outbox confirmada.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: PARTIAL
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: .github/workflows/ci.yml, db/README.md
Tests ejecutados: 11 en `tests/campaigns/c41-c42.test.ts` (`npx vitest run tests/campaigns/c41-c42.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C41-G01 / NOT_VERIFIED:** Pausa remoto sin ACK sigue estado incierto tras rollback y no se considera deshecha.
- **MKT-C41-G02 / NOT_VERIFIED:** Restore completo preserva permisos/supresión y no reenvía outbox confirmada.

Desviaciones y ajustes de diseño: CI definido pero no ejecutado en GitHub; release y rollback no probados.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Ejecutar el workflow y ensayar rollback por flag.
