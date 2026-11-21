# agntia-marketing

Diseño de empresa SaaS especialista en marketing, investigación de mercado, campañas y medición, con middleware para `uniscrolliabrain-cloud/agente`. Entrega documental 3/9 · 12 de noviembre de 2026.

**IMPLEMENTADO EN `main`.** Las 42 campañas tienen código y pruebas: 23 DONE, 15 PARTIAL y 4 BLOCKED por proveedor. El estado real, fase por fase, está en [el anexo de ejecución](docs/evidence/ANEXO-42-FASES.md) y en el reporte dentro de cada `CAMPAIGN.md`. Postgres 16 sí se ha ejecutado: la capa SQL está verificada con un runner nativo y evidencia auditable ([db](db/README.md)), el worker de outbox ya corre como proceso propio y entrega sin duplicar (tres procesos contra el mismo tenant, 2026-11-21) y el estado de producto del API se guarda en un documento por tenant (`tenant_state`, etapa 1: sobrevive al reinicio, pero no es la ruta normalizada), así que la persistencia de producto sigue `PARTIAL` y no `PASS` (la vía administrativa, `POST /v1/marketing/admin/actions`, se verificó el 2026-11-18; desde esa fecha el API **autoriza** leyendo tenant y membership de Postgres y persiste el agregado del tenant con un escritor por tenant). No hay proveedores conectados: esas capacidades están deshabilitadas y no se simulan. El objetivo de calidad toma referentes mundiales, sin afirmar paridad actual, ingresos garantizados o cumplimiento universal.

## Implementación

```bash
npm install
npm run typecheck     # tsc estricto, sin emitir
npm test              # 155 pruebas (107 de campañas + 18 de Postgres real + 12 del API contra Postgres + 5 de estado durable + 13 del worker de outbox)
npm run api:dev       # API Hono en :8787 (portal en /portal/)
npm run worker:dev    # ciclo outbox → sandbox → receipt
```

| Ruta | Contenido |
|---|---|
| `packages/contracts` | envelope v1, DTO Zod estrictos, eventos y errores seguros |
| `packages/core` | autoridad, aprobaciones, consentimiento, audiencias, FSM, outbox, medición |
| `packages/adapters` | proveedores en stub deshabilitados + entrega sandbox local |
| `packages/sdk` | cliente allowlist, 8 tools y bridge al padre |
| `apps/api` | Hono con JWT de Supabase, PEP por capacidad, idempotencia y ruta administrativa auditada |
| `apps/worker` | outbox con fence, receipts y cierre de campaña |
| `apps/portal` | portal responsive mínimo |
| `db/migrations` | esquema Postgres, RLS forzada y flujo administrativo auditado (`0001`–`0006`, **ejecutados y verificados** en 16.15) |

Nada de esto envía correo real, publica landings, lanza anuncios, gasta dinero ni modifica el repositorio `agente`.

El owner podrá conversar con el especialista por chat/visio Anam, preparar briefs y campañas, revisar audiencias y materiales, aprobar acciones y recibir reportes con fuentes. El servicio atenderá tanto clientes integrados en AgntiaPro como externos mediante portal propio. Los agentes canónicos viven en `/agente`; aquí operarán twins vinculados con mandato. No se crea una identidad agéntica independiente.

Todos los modos son multitenant: JWT Supabase verificado, membresía/recursos/campos autorizados y aislamiento en API, DB/RLS, workers, archivos, búsquedas, Realtime y exportaciones. Se permite solapar servicios con redes, clientes, ventas y branding; cada encargo determina autoridad y responsable de los efectos para evitar dobles envíos, doble gasto o cambios contradictorios.

## Capacidades a construir

Estrategia e investigación con fuentes; ICP y segmentación por reglas autorizadas; briefs/creatividades ES/EN/FR con derechos y claims verificables; campañas email y journeys; landings/formularios; SEO técnico y seguimiento AEO/GEO; propuestas de paid media; experimentación; analítica, atribución explícita e incrementalidad cuando los datos la permitan; dashboard, infografías y briefing. No confundir atribución con causalidad ni entrenar modelos globales con datos de clientes por defecto.

## Ruta de lectura

1. [Producto](docs/01-producto-y-limites.md), [investigación](docs/02-investigacion-y-decisiones.md) y [referentes/brechas](docs/03-referentes-y-brechas.md).
2. [Repos/adaptadores](docs/04-repos-y-adaptadores.md), [arquitectura](docs/architecture/01-arquitectura.md), [Supabase/twins](docs/architecture/02-supabase-twins.md), [padre](docs/architecture/03-compatibilidad-agente.md).
3. [Contratos](docs/contracts/01-contratos.md), [runtime](docs/architecture/04-runtime-determinista.md), [privacidad](docs/05-seguridad-privacidad.md), [medición](docs/09-medicion-y-evaluacion.md).
4. [42 campañas](docs/campaigns/README.md), [manifest](docs/campaigns/campaign.json), [handoff](docs/release/HANDOFF.md), [informe owner](docs/release/INFORME-AL-OWNER.md).
5. [UX/Anam](docs/06-ux-anam.md), [operación SaaS](docs/07-servicio-y-operacion.md), [costes](docs/08-presupuestos.md), [aceptación](docs/release/PILOT-ACCEPTANCE.md).

Primera vertical prevista: dos tenants sintéticos→Supabase/twin→brief→audiencia autorizada→creatividad→preview→aprobación→backend de pruebas→receipt→medición/reportes. Publicidad inicialmente lectura/propuesta y test accounts; ninguna campaña de esta entrega lanza anuncios o gasta dinero. Un envío de prueba también es un efecto y exige sandbox de destinatarios.

Fuentes y SHAs en [research](docs/research/sources.json); resultados de comprobaciones documentales en [validación](docs/release/document-validation.json). `/agente` se consulta solo como referencia y no se modifica. SHA de referencia:54b8d5407a8576459448c4d059a877297d18ca7a.
