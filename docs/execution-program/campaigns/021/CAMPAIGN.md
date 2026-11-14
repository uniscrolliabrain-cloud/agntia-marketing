# MKT-C21 · Frecuencia, presupuestos y límites de contacto

**PROGRAMA PREVIO · NOT_STARTED · 21/42.** [Campaña original](../../campaigns/21-frecuencia-presupuestos-y-limites-de-contacto.md).

## Objetivo y contrato
Evitar fatiga y doble gasto sin confundir bolsas económicas.

**Invariante:** Rate-limit, permiso, presupuesto de servicio y medios son controles diferentes.. **Dependencias:** MKT-C20. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/policy/src/frequency.ts`.
- DTO/validación: `packages/contracts/src/21.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/21.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/021.test.ts` y fixtures `tests/fixtures/021/`.
- Evidencia: `docs/evidence/c21/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/frequency/`, `packages/budget/`, `tests/caps-concurrency.test.ts`.

## Patchsets y aceptación por tarea
### 021.01 — MKT-C21-T01
**Acción:** Definir caps por sujeto/canal/marca/purpose/periodo conforme contrato.

**Archivo primario:** `packages/policy/src/frequency.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No usar identidad global entre tenants sin base/permiso.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 021.02 — MKT-C21-T02
**Acción:** Definir bolsillos separados de inferencia/AV/email/medios.

**Archivo primario:** `packages/policy/src/frequency.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Plan30€ no autoriza30€ de publicidad.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C21-T01.

### 021.03 — MKT-C21-T03
**Acción:** Implementar reserva transaccional por operationKey y moneda.

**Archivo primario:** `packages/policy/src/frequency.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Dos workers no consumen el mismo último saldo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C21-T02.

### 021.04 — MKT-C21-T04
**Acción:** Coordinar caps con padre/redes/otros emisores mediante ledger/puerto.

**Archivo primario:** `packages/policy/src/frequency.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Si no existe autoridad común, no prometer cap global exacto.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C21-T03.

### 021.05 — MKT-C21-T05
**Acción:** Revalidar fatiga/supresión/budget justo antes de dispatch.

**Archivo primario:** `packages/policy/src/frequency.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Prioridad comercial no salta bloqueo.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C21-T04.

### 021.06 — MKT-C21-T06
**Acción:** Definir consumo real, liberación y ajuste tardío.

**Archivo primario:** `packages/policy/src/frequency.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cuota o factura remota no se inventa a partir de un intento.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C21-T05.

### 021.07 — MKT-C21-T07
**Acción:** Probar límites de volumen, coste desconocido y override humano autorizado.

**Archivo primario:** `packages/policy/src/frequency.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Override no elimina consentimiento ni aislamiento.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C21-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C21-G01 / NOT_EXECUTED:** Dos journeys simultáneos compiten por último slot de contacto: uno queda bloqueado.
- **MKT-C21-G02 / NOT_EXECUTED:** Forecast de medios intenta reservar tokens del SaaS como ad spend: rechazado.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
