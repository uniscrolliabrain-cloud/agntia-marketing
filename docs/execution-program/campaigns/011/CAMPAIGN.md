# MKT-C11 · Mautic lectura y mapeo

**PROGRAMA PREVIO · NOT_STARTED · 11/42.** [Campaña original](../../campaigns/11-mautic-lectura-y-mapeo.md).

## Objetivo y contrato
Verificar backend de contactos/segmentos por instancia autorizada.

**Invariante:** API disponible no prueba aislamiento multitenant de la instalación.. **Dependencias:** MKT-C10. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/mautic-read.ts`.
- DTO/validación: `packages/contracts/src/11.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/11.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/011.test.ts` y fixtures `tests/fixtures/011/`.
- Evidencia: `docs/evidence/c11/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/adapters/mautic/read.ts`, `docs/adapters/mautic.md`, `tests/integration/mautic-read.test.ts`.

## Patchsets y aceptación por tarea
### 011.01 — MKT-C11-T01
**Acción:** Fijar release/imagen/licencia y resolver inconsistencia de docs.

**Archivo primario:** `packages/adapters/src/mautic-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** SHA de rama observada no se usa como pin de producción sin validar.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 011.02 — MKT-C11-T02
**Acción:** Validar binding tenant→instancia/contexto y cuenta bot mínima.

**Archivo primario:** `packages/adapters/src/mautic-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Si compartido no es seguro, exigir instancia dedicada.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C11-T01.

### 011.03 — MKT-C11-T03
**Acción:** Descubrir API habilitada/campos/permisos/edición reales.

**Archivo primario:** `packages/adapters/src/mautic-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No modificar configuración del padre o proveedor producción para pasar gate.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C11-T02.

### 011.04 — MKT-C11-T04
**Acción:** Leer contactos/segmentos/preferencias con fields y paginación cerrados.

**Archivo primario:** `packages/adapters/src/mautic-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No descargar todo con admin para filtrar después.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C11-T03.

### 011.05 — MKT-C11-T05
**Acción:** Mapear do-not-contact, identidades y fechas con provenance.

**Archivo primario:** `packages/adapters/src/mautic-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Falta de campo de permiso produce unknown, no eligible.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C11-T04.

### 011.06 — MKT-C11-T06
**Acción:** Crear staging/links y conflicto por cambios remotos.

**Archivo primario:** `packages/adapters/src/mautic-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Campo revisado no se pisa por último escritor.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C11-T05.

### 011.07 — MKT-C11-T07
**Acción:** Probar dos instancias/roles,1000+ registros y ausencia API.

**Archivo primario:** `packages/adapters/src/mautic-read.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Mocks separados de capacidad real, sin activar campaigns.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C11-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C11-G01 / NOT_EXECUTED:** Token de instanciaB en conexiónA no lista contactos deB.
- **MKT-C11-G02 / NOT_EXECUTED:** Mautic API deshabilitada produce unsupported, sin scraping fallback.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
