# MKT-C23 · Matomo lectura y binding de propiedades

**PROGRAMA PREVIO · NOT_STARTED · 23/42.** [Campaña original](../../campaigns/23-matomo-lectura-y-binding-de-propiedades.md).

## Objetivo y contrato
Importar métricas con definiciones y configuración de medición.

**Invariante:** Un siteId remoto no es tenantId y una métrica no prueba cumplimiento.. **Dependencias:** MKT-C22. **Contrato obligatorio:** `docs/architecture/02-supabase-twins.md`.

## Superficies de archivos (propuestas, no afirmar existencia)
- Código principal: `packages/adapters/src/matomo.ts`.
- DTO/validación: `packages/contracts/src/23.ts` si se necesita contrato nuevo.
- API Hono: `apps/api/src/routes/23.ts` solo si se requiere capability nominada.
- Test: `tests/campaigns/023.test.ts` y fixtures `tests/fixtures/023/`.
- Evidencia: `docs/evidence/c23/`, con un **reporte de Freebuff dentro del documento de campaña** al finalizar, más enlace al SHA/diff y artefactos. Si el archivo principal resulta inadecuado tras construir el monorepo, registrar ruta real y justificación.
- Artefactos originales: `packages/adapters/matomo/`, `docs/adapters/matomo.md`, `tests/integration/matomo.test.ts`.

## Patchsets y aceptación por tarea
### 023.01 — MKT-C23-T01
**Acción:** Fijar versión/plugins/licencia y roles de laboratorio.

**Archivo primario:** `packages/adapters/src/matomo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Función premium no se declara Community por estar en docs.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** inicio.

### 023.02 — MKT-C23-T02
**Acción:** Validar tenant/proyecto→site y scopes de lectura.

**Archivo primario:** `packages/adapters/src/matomo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No token admin global para filtrar después.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C23-T01.

### 023.03 — MKT-C23-T03
**Acción:** Descubrir módulos/métricas/dimensiones permitidos.

**Archivo primario:** `packages/adapters/src/matomo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Método Reporting API cerrado, sin module/action arbitrario.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C23-T02.

### 023.04 — MKT-C23-T04
**Acción:** Leer reportes paginados con ventana/timezone/segment aprobado.

**Archivo primario:** `packages/adapters/src/matomo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Totales y cobertura preservados, sin SQL libre.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C23-T03.

### 023.05 — MKT-C23-T05
**Acción:** Mapear unidades, unique/visits/events y config privacidad.

**Archivo primario:** `packages/adapters/src/matomo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** No sumar métricas incompatibles entre backends.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C23-T04.

### 023.06 — MKT-C23-T06
**Acción:** Persistir Observation/snapshot y actualizar con versiones tardías.

**Archivo primario:** `packages/adapters/src/matomo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Reporte aprobado no se recalcula silenciosamente.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C23-T05.

### 023.07 — MKT-C23-T07
**Acción:** Probar site ajeno, plugin ausente, vacío y credencial revocada.

**Archivo primario:** `packages/adapters/src/matomo.ts`; verificar dependencias e imports; crear o modificar DTO, servicio, adaptador y test solo cuando proceda. Para tarea documental, no crear endpoints ficticios.

**Aceptación:** Unsupported/forbidden honesto sin fixtures presentados reales.

**Verificación:** test positivo, rechazo de tenant ajeno/scope insuficiente y timeout/replay/resultado incierto cuando haya efecto; registrar SHA, comando, fixture y resultado. **Depende de:** MKT-C23-T06.


## Wiring transversal
Supabase JWT+membresía → scope de tenant/recurso/finalidad → Zod DTO → AuthorityMap/policy → versión+aprobación → Postgres RLS+audit/outbox → worker delegado → proveedor allowlist → receipt/reconciliación → bridge del padre. Sin HTTP/SQL/shell genéricos desde LLM. Consentimiento, oposición, frequency cap, presupuesto y derecho de uso de creatividades antes de cualquier envío/gasto. Para documentación pura: NO_APLICA justificado.

## Gates pendientes
- **MKT-C23-G01 / NOT_EXECUTED:** SiteB pedido desdeA se bloquea antes del Reporting API.
- **MKT-C23-G02 / NOT_EXECUTED:** Sin datos no se reporta0 ventas o ROI positivo.

**Bloqueos:** Fuga tenant/proyecto, secreto o dato de audiencia expuesto; Bypass de mandato/approval/supresión o gasto no autorizado; Doble efecto, pérdida de audit o retry ciego de resultado incierto; Claim causal o capacidad productiva no respaldados por evidencia.

**Rollback:** Deshabilitar capacidad/flag de la fase y detener nuevos efectos; conservar audit/links/intents/receipts. Restaurar solo con plan probado y reaplicar supresiones. No borrar mensajes/anuncios o historia para simular reversión.

## Reporte de fase Freebuff

Estado: BLOCKED
SHA: 9285dc2 (base documental) · implementación en `feat/marketing-42-campaigns`
Archivos creados/modificados: packages/core/src/measurement.ts
Tests ejecutados: 17 en `tests/campaigns/c21-c30.test.ts` (`npx vitest run tests/campaigns/c21-c30.test.ts`); 0 fallos en el bloque.
Gates:
- **MKT-C23-G01 / NOT_VERIFIED:** SiteB pedido desdeA se bloquea antes del Reporting API.
- **MKT-C23-G02 / NOT_VERIFIED:** Sin datos no se reporta0 ventas o ROI positivo.

Desviaciones y ajustes de diseño: Sin conexión Matomo: sólo se ingieren observaciones ya extraídas.

Incidencias heredadas y deuda: sin proveedor real ni Postgres, las capacidades externas quedan deshabilitadas y sus gates en NOT_VERIFIED. No se modificó `agente`.

Recomendaciones para mejorar futuras campañas: Verificar binding por propiedad y cuotas de API.
