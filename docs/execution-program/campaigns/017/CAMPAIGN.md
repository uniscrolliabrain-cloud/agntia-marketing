# MKT-C17 · Investigación, brief y estrategia

**PROGRAMA PREVIO · NOT_STARTED · 17/42.** [Campaña original](../../campaigns/17-investigacion-brief-y-estrategia.md).

## Objetivo y contrato
Transformar objetivos en hipótesis, decisiones y entregables con fuentes.

**Invariante:** Investigación de mercado no es captación indiscriminada ni permiso de compra.. **Dependencias:** MKT-C16. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/domain/src/research-brief.ts`.
- DTO/validación: `packages/contracts/src/17.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/17.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/017.test.ts` y fixtures `tests/fixtures/017/`.
- Evidencia: `docs/evidence/c17/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/briefs/`, `packages/strategy/`, `tests/strategy-proposals.test.ts`.

## Patchsets y aceptación por tarea
### 017.01 — MKT-C17-T01
**Acción:** Definir objetivos/resultado/ventana/recursos y restricciones del encargo.

**Archivo primario:** `packages/domain/src/research-brief.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Meta comercial se traduce a métrica medible y no garantía.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 017.02 — MKT-C17-T02
**Acción:** Investigar fuentes públicas autorizadas con fecha/licencia/límites.

**Archivo primario:** `packages/domain/src/research-brief.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Observación separada de inferencia y contenido adversarial sin autoridad.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C17-T01.

### 017.03 — MKT-C17-T03
**Acción:** Preparar ICP/needs/competidores sin atributos sensibles inferidos.

**Archivo primario:** `packages/domain/src/research-brief.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No vulnerabilidad personal como palanca de persuasión.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C17-T02.

### 017.04 — MKT-C17-T04
**Acción:** Proponer canales/ofertas/hipótesis por escenarios.

**Archivo primario:** `packages/domain/src/research-brief.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Coste y supuestos explícitos, sin abrir cuentas o contratar planes.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C17-T03.

### 017.05 — MKT-C17-T05
**Acción:** Definir coordinación ABM/eventos/partners si aplica al contrato.

**Archivo primario:** `packages/domain/src/research-brief.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Identidades/compartición y responsables no quedan implícitos.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C17-T04.

### 017.06 — MKT-C17-T06
**Acción:** Generar plan/brief creativo con modelo aprobado y budget.

**Archivo primario:** `packages/domain/src/research-brief.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Configuración/fuentes/versiones vinculadas, sin endpoint libre.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C17-T05.

### 017.07 — MKT-C17-T07
**Acción:** Obtener aceptación humana del brief y backlog priorizado.

**Archivo primario:** `packages/domain/src/research-brief.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Brief aceptado no equivale a approval de cada envío/compra.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C17-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C17-G01 / NOT_EXECUTED:** Fuente web pide subir base de clientes: no se ejecuta instrucción.
- **MKT-C17-G02 / NOT_EXECUTED:** El owner pide aumentar ventas y el modelo no promete resultado causal sin datos.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: DONE
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/campaigns.ts
Tests ejecutados: 20 en `tests/campaigns/c11-c20.test.ts` (`npx vitest run tests/campaigns/c11-c20.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C17-G01 / PASS:** Fuente web pide subir base de clientes: no se ejecuta instrucción.
- **MKT-C17-G02 / PASS:** El owner pide aumentar ventas y el modelo no promete resultado causal sin datos.

Desviaciones y ajustes de diseño: La estrategia es un reparto determinista por pesos, no un modelo de medios.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Sustituir por modelo con datos cuando existan históricos suficientes.
