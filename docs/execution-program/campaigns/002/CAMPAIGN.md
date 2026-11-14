# MKT-C02 · Dominio, autoridad y modelo SaaS

**PROGRAMA PREVIO · NOT_STARTED · 2/42.** [Campaña original](../../campaigns/02-dominio-autoridad-y-modelo-saas.md).

## Objetivo y contrato
Separar operador, tenants, marcas, personas y responsables del efecto.

**Invariante:** Servicio solapado no implica dos ejecutores para el mismo efecto.. **Dependencias:** MKT-C01. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/authority.ts`.
- DTO/validación: `packages/contracts/src/02.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/02.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/002.test.ts` y fixtures `tests/fixtures/002/`.
- Evidencia: `docs/evidence/c02/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `docs/domain-model.md`, `docs/authority-map.md`, `docs/adr/002-boundaries.md`.

## Patchsets y aceptación por tarea
### 002.01 — MKT-C02-T01
**Acción:** Modelar operadorP, tenantsA/B y proyectos/marcas por tenant.

**Archivo primario:** `packages/domain/src/authority.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Misma marca o dominio no fusiona seguridad.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 002.02 — MKT-C02-T02
**Acción:** Distinguir persona de audiencia, Contact, usuario Supabase y membership.

**Archivo primario:** `packages/domain/src/authority.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Importar una lista no crea usuarios autorizados.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C02-T01.

### 002.03 — MKT-C02-T03
**Acción:** Definir AuthorityMap por campo, workflow y canal.

**Archivo primario:** `packages/domain/src/authority.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** CRM/marketing/redes tienen decisiones y conflictos explícitos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C02-T02.

### 002.04 — MKT-C02-T04
**Acción:** Definir ServiceAgreement/WorkOrder y aceptación de entregables.

**Archivo primario:** `packages/domain/src/authority.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Contratar servicio no autoriza gasto/envío/grabación automáticamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C02-T03.

### 002.05 — MKT-C02-T05
**Acción:** Documentar portal externo con equipo canónico vinculado al padre.

**Archivo primario:** `packages/domain/src/authority.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Cliente no necesita UI AgntiaPro ni existe registro agéntico soberano.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C02-T04.

### 002.06 — MKT-C02-T06
**Acción:** Acotar piloto email-sink/lecturas/ads test sin dinero real.

**Archivo primario:** `packages/domain/src/authority.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Mutaciones futuras de producción requieren autorización posterior.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C02-T05.

### 002.07 — MKT-C02-T07
**Acción:** Crear fixtures de delegación, proyecto compartido y competencia de emisores.

**Archivo primario:** `packages/domain/src/authority.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Toda acción tiene un responsable y prueba de alcance.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C02-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C02-G01 / NOT_EXECUTED:** Padre y Mautic intentan emitir mismo mensaje: un intent o conflicto, no duplicado.
- **MKT-C02-G02 / NOT_EXECUTED:** Colaborador de marcaX intenta abrir proyectoY sin permiso.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/contracts/src/envelope.ts, packages/core/src/authority.ts
Tests ejecutados: 26 en `tests/campaigns/c01-c10.test.ts` (`npx vitest run tests/campaigns/c01-c10.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C02-G01 / PASS:** Padre y Mautic intentan emitir mismo mensaje: un intent o conflicto, no duplicado.
- **MKT-C02-G02 / PASS:** Colaborador de marcaX intenta abrir proyectoY sin permiso.

Desviaciones y ajustes de diseño: La autoridad se resolvió con roles y scopes; no se modelaron entitlements comerciales por plan.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Añadir matriz de entitlements cuando exista contrato de servicio firmado.
