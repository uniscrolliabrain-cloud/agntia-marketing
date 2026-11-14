# MKT-C39 · Privacidad, derechos y pruebas adversariales

**PROGRAMA PREVIO · NOT_STARTED · 39/42.** [Campaña original](../../campaigns/39-privacidad-derechos-y-pruebas-adversariales.md).

## Objetivo y contrato
Cerrar superficies de fuga y ciclo de vida de datos antes de E2E.

**Invariante:** Fuga, bypass de supresión, secreto o efecto no autorizado detienen campaña.. **Dependencias:** MKT-C38. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/security/src/privacy.ts`.
- DTO/validación: `packages/contracts/src/39.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/39.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/039.test.ts` y fixtures `tests/fixtures/039/`.
- Evidencia: `docs/evidence/c39/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `tests/security/`, `packages/privacy/requests/`, `docs/threat-model.md`.

## Patchsets y aceptación por tarea
### 039.01 — MKT-C39-T01
**Acción:** Probar BOLA por API/campo/job/archivo/search/cache/Realtime/export.

**Archivo primario:** `packages/security/src/privacy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Dos tenants y proyectos compartidos sin metadatos ajenos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 039.02 — MKT-C39-T02
**Acción:** Probar JWT/scope/twin/approval manipulados y revocación.

**Archivo primario:** `packages/security/src/privacy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin owner/default ni provisioning desde user_metadata.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C39-T01.

### 039.03 — MKT-C39-T03
**Acción:** Inyectar instrucciones en sitios/creativos/CSV/adjuntos/tools.

**Archivo primario:** `packages/security/src/privacy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Datos no alteran política/capacidad/destinatario.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C39-T02.

### 039.04 — MKT-C39-T04
**Acción:** Probar SSRF/redirect/DNS/MIME/HTML/CSV y webhook/OAuth replay.

**Archivo primario:** `packages/security/src/privacy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Sin egress no aprobado ni ejecución de contenido.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C39-T03.

### 039.05 — MKT-C39-T05
**Acción:** Implementar solicitudes de derechos con identidad/alcance/revisión.

**Archivo primario:** `packages/security/src/privacy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Export no entrega datos de terceros; borrado no ignora retención legítima.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C39-T04.

### 039.06 — MKT-C39-T06
**Acción:** Propagar supresión a índices/memorias/backends y backups con ACK.

**Archivo primario:** `packages/security/src/privacy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Restore no resucita datos ni reenvía campañas.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C39-T05.

### 039.07 — MKT-C39-T07
**Acción:** Escanear centinelas y revisar evidencia/logs/reportes públicos.

**Archivo primario:** `packages/security/src/privacy.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cero secretos/PII de prueba sensible, riesgos pendientes explícitos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C39-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C39-G01 / NOT_EXECUTED:** Documento exige exportar audienceB: policy independiente del modelo bloquea.
- **MKT-C39-G02 / NOT_EXECUTED:** Restaurar backup anterior a baja conserva la supresión antes de activar worker.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff (rellenar al terminar)
Estado: PENDING. SHA: PENDING. Archivos creados/modificados: PENDING. Tests/comandos/fixtures: PENDING. Gates: PENDING. Desviaciones y ajustes de diseño: PENDING. Incidencias heredadas y deuda: PENDING. Recomendaciones para mejorar futuras campañas: PENDING. **No esperar auditoría Codex para seguir a la fase siguiente.**
