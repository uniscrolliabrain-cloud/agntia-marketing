# MKT-C07 · Bases de tratamiento, supresión y preferencias

**PROGRAMA PREVIO · NOT_STARTED · 7/42.** [Campaña original](../../campaigns/07-bases-de-tratamiento-supresion-y-preferencias.md).

## Objetivo y contrato
Modelar elegibilidad de contacto y tracking sin ampliar permisos.

**Invariante:** Contactar, rastrear, grabar y entrenar son finalidades separadas.. **Dependencias:** MKT-C06. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/policy/src/consent.ts`.
- DTO/validación: `packages/contracts/src/07.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/07.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/007.test.ts` y fixtures `tests/fixtures/007/`.
- Evidencia: `docs/evidence/c07/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/privacy/`, `packages/eligibility/`, `tests/consent.test.ts`.

## Patchsets y aceptación por tarea
### 007.01 — MKT-C07-T01
**Acción:** Definir propósitos y bases con revisión humana/contextual.

**Archivo primario:** `packages/policy/src/consent.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No usar consent=true universal para todos los flujos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 007.02 — MKT-C07-T02
**Acción:** Crear ledger grant/withdraw/restriction con prueba/versiones.

**Archivo primario:** `packages/policy/src/consent.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Estado actual se reconstruye sin borrar historia.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C07-T01.

### 007.03 — MKT-C07-T03
**Acción:** Definir preferencias por sujeto/canal/marca/purpose según contrato.

**Archivo primario:** `packages/policy/src/consent.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Buzón compartido no traslada permiso entre personas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C07-T02.

### 007.04 — MKT-C07-T04
**Acción:** Integrar supresión/oposiciones del padre o custodio mediante contrato.

**Archivo primario:** `packages/policy/src/consent.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Lead aceptado no implica permission marketing.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C07-T03.

### 007.05 — MKT-C07-T05
**Acción:** Configurar política de tags/cookies y señales técnicas separadas.

**Archivo primario:** `packages/policy/src/consent.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Consent Mode/cookie-free no habilitan tracking sin decisión aplicable.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C07-T04.

### 007.06 — MKT-C07-T06
**Acción:** Revalidar elegibilidad justo antes del efecto con política de frescura.

**Archivo primario:** `packages/policy/src/consent.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Dato stale/unknown bloquea, no supone autorización.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C07-T05.

### 007.07 — MKT-C07-T07
**Acción:** Probar retirada en cola, cambio de finalidad y sincronización tardía.

**Archivo primario:** `packages/policy/src/consent.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No se añaden miembros ni se ignoran bajas por caché.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C07-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C07-G01 / NOT_EXECUTED:** Persona retira permiso entre approval y dispatch: bloqueada para efectos nuevos.
- **MKT-C07-G02 / NOT_EXECUTED:** Consentimiento AV intenta habilitar audience upload o newsletter: denegado.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
