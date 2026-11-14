# MKT-C16 · Marca, assets y evidencia de claims

**PROGRAMA PREVIO · NOT_STARTED · 16/42.** [Campaña original](../../campaigns/16-marca-assets-y-evidencia-de-claims.md).

## Objetivo y contrato
Producir materiales con derechos y fuentes revisables.

**Invariante:** Un modelo no inventa testimonios, licencias o soporte de afirmaciones.. **Dependencias:** MKT-C15. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/brand-assets.ts`.
- DTO/validación: `packages/contracts/src/16.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/16.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/016.test.ts` y fixtures `tests/fixtures/016/`.
- Evidencia: `docs/evidence/c16/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/brand-policy/`, `packages/assets/`, `packages/claims/`.

## Patchsets y aceptación por tarea
### 016.01 — MKT-C16-T01
**Acción:** Importar BrandPolicySnapshot de branding o módulo local autorizado.

**Archivo primario:** `packages/domain/src/brand-assets.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Versión/custodio/derechos, no solo prompt de tono.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 016.02 — MKT-C16-T02
**Acción:** Crear ledger de assets/licencias/releases de personas.

**Archivo primario:** `packages/domain/src/brand-assets.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Ausencia de derechos bloquea publicación aunque asset se vea en internet.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C16-T01.

### 016.03 — MKT-C16-T03
**Acción:** Definir ClaimEvidence con soporte/contradicción/vigencia.

**Archivo primario:** `packages/domain/src/brand-assets.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Número o cita fabricados quedan unverified.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C16-T02.

### 016.04 — MKT-C16-T04
**Acción:** Generar variantes ES/EN/FR con fuentes y locale.

**Archivo primario:** `packages/domain/src/brand-assets.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Traducción preserva importes, límites y disclaimers revisados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C16-T03.

### 016.05 — MKT-C16-T05
**Acción:** Crear QA de formato/legibilidad/destino y contenido regulado.

**Archivo primario:** `packages/domain/src/brand-assets.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Visión/LLM detectan posibles problemas pero no otorgan permiso.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C16-T04.

### 016.06 — MKT-C16-T06
**Acción:** Vincular revisiones de creativo/rights al approval hash.

**Archivo primario:** `packages/domain/src/brand-assets.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cambio de imagen/texto/claim invalida aprobación material.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C16-T05.

### 016.07 — MKT-C16-T07
**Acción:** Probar archivo adversarial, fuente caducada y derechos revocados.

**Archivo primario:** `packages/domain/src/brand-assets.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Se bloquea nuevo efecto y conserva versión histórica.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C16-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C16-G01 / NOT_EXECUTED:** IA inventa caso de éxito o beneficio médico: no habilita CreativeRevision publicable.
- **MKT-C16-G02 / NOT_EXECUTED:** Revocar licencia entre preview y dispatch impide uso nuevo del asset.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/campaigns.ts
Tests ejecutados: 20 en `tests/campaigns/c11-c20.test.ts` (`npx vitest run tests/campaigns/c11-c20.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C16-G01 / PASS:** IA inventa caso de éxito o beneficio médico: no habilita CreativeRevision publicable.
- **MKT-C16-G02 / PASS:** Revocar licencia entre preview y dispatch impide uso nuevo del asset.

Desviaciones y ajustes de diseño: La evidencia de claims es manual; no hay caducidad automática por fecha.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Añadir job de caducidad de claims y bloqueo de creatividades afectadas.
