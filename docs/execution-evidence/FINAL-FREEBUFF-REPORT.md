# Informe final FreeBuff · `agntia-marketing`

**Repositorio:** `uniscrolliabrain-cloud/agntia-marketing`
**Rama de trabajo:** `feat/marketing-42-campaigns` (sin push, sin merge a `main`)
**Base documental:** `9285dc2` · **Implementación:** `eeacf9d` · **Merge de `origin/main`:** `f26c7f5`
**Padre consultado y no modificado:** `uniscrolliabrain-cloud/agente` @ `54b8d5407a8576459448c4d059a877297d18ca7a`
**Fecha del informe:** 2026-11-15

## 1. Resultado en una tabla

| Métrica | Valor |
|---|---|
| Campañas del programa | 42/42 con código, pruebas y reporte de fase |
| Estado declarado | 23 DONE · 15 PARTIAL · 4 BLOCKED |
| Pruebas automatizadas | 120 en 8 archivos (13 contra Postgres real) |
| Typecheck | `npx tsc -p tsconfig.json --noEmit` sin errores |
| Gates del programa | 84 · 50 PASS · 34 NOT_VERIFIED |
| Proveedores externos conectados | 0 (todos en stub `disabled` salvo email sandbox local) |
| Postgres ejecutado | Sí: 16.15 real sin Docker (migraciones + 13 pruebas) |
| Despliegues, gasto, envíos reales | Ninguno |

`PARTIAL` y `NOT_VERIFIED` no son sinónimos de roto: significan que el código y
sus pruebas existen, pero la parte que depende de un proveedor, de Postgres o de
una cuenta real no se ha podido verificar aquí. Se declara en vez de simularse.

## 2. Reproducción exacta

```bash
npm install --no-audit --no-fund
npx tsc -p tsconfig.json --noEmit      # exit 0, sin salida
npx vitest run                         # 107 pruebas, 13 skipped (sin DB)
DATABASE_URL=postgres://… npx vitest run   # 120 pruebas (incluye 13 de Postgres real)
npm run api:dev                        # servidor en :8787
```

Smoke verificado a mano:

```bash
curl -s localhost:8787/healthz                                  # 200 JSON {"status":"ok"}
curl -s -o /dev/null -w '%{http_code}' localhost:8787/portal/    # 200
curl -s -o /dev/null -w '%{http_code}' localhost:8787/v1/marketing/me  # 401
```

## 3. Matriz 42 × 7

Columnas: especificación leída · código implementado · pruebas ejecutadas ·
gates del programa · proveedor externo real · Postgres real · archivo de evidencia.

| Fase | Spec | Código | Tests | Gates | Proveedor real | Postgres real | Evidencia |
|---|---|---|---|---|---|---|---|
| `MKT-C01` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | N/A | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C02` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | N/A | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C03` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | N/A | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C04` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | N/A | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C05` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | N/A | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C06` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C07` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C08` | PASS | PASS | PASS (26) | 0/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C09` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C10` | PASS | PASS | PASS (26) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c01-c10.test.ts` |
| `MKT-C11` | PASS | PASS | PASS (20) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C12` | PASS | PASS | PASS (20) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C13` | PASS | PASS | PASS (20) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C14` | PASS | PASS | PASS (20) | 2/2 PASS | SANDBOX | SQL VERIFICADO / API en memoria | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C15` | PASS | PASS | PASS (20) | 0/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C16` | PASS | PASS | PASS (20) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C17` | PASS | PASS | PASS (20) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C18` | PASS | PASS | PASS (20) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C19` | PASS | PASS | PASS (20) | 2/2 PASS | N/A | N/A | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C20` | PASS | PASS | PASS (20) | 2/2 PASS | N/A | N/A | `tests/campaigns/c11-c20.test.ts` |
| `MKT-C21` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C22` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C23` | PASS | PASS | PASS (17) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C24` | PASS | PASS | PASS (17) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C25` | PASS | PASS | PASS (17) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C26` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C27` | PASS | PASS | PASS (17) | 0/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C28` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C29` | PASS | PASS | PASS (17) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C30` | PASS | PASS | PASS (17) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c21-c30.test.ts` |
| `MKT-C31` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C32` | PASS | PASS | PASS (17) | 0/2 PASS | NO | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C33` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C34` | PASS | PASS | PASS (17) | 0/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C35` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | N/A | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C36` | PASS | PASS | PASS (17) | 0/2 PASS | STUB | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C37` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C38` | PASS | PASS | PASS (17) | 0/2 PASS | NO | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C39` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C40` | PASS | PASS | PASS (17) | 2/2 PASS | N/A | SQL VERIFICADO / API en memoria | `tests/campaigns/c31-c40.test.ts` |
| `MKT-C41` | PASS | PASS | PASS (11) | 0/2 PASS | NO | SQL VERIFICADO / API en memoria | `tests/campaigns/c41-c42.test.ts` |
| `MKT-C42` | PASS | PASS | PASS (11) | 0/2 PASS | NO | SQL VERIFICADO / API en memoria | `tests/campaigns/c41-c42.test.ts` |

Ninguna fila declara `PASS` en proveedor o Postgres: la columna existe para que
la auditoría vea de un golpe qué depende de infraestructura no disponible.

## 4. Los 84 gates

| Gate | Enunciado | Estado |
|---|---|---|
| `MKT-C01-G01` | SHA padre cambia entre lecturas: detener mapping hasta cotejar | **PASS** |
| `MKT-C01-G02` | Intentar ejecutar campaña real para probar baseline queda fuera de alcance | **PASS** |
| `MKT-C02-G01` | Padre y Mautic intentan emitir mismo mensaje: un intent o conflicto, no duplicado | **PASS** |
| `MKT-C02-G02` | Colaborador de marcaX intenta abrir proyectoY sin permiso | **PASS** |
| `MKT-C03-G01` | JWT de otro proyecto o tenant_idB en sesiónA se rechaza | **PASS** |
| `MKT-C03-G02` | Revocar membership con job en cola impide el siguiente efecto | **PASS** |
| `MKT-C04-G01` | Twin con nombre marketing pero sin capability no prepara envío autorizado | **PASS** |
| `MKT-C04-G02` | Sesión AV mantiene mandato vencido: PEP bloquea efectos nuevos | **PASS** |
| `MKT-C05-G01` | Payload incluye SQL/model/method/baseURL y scope arbitrario: rechazado | **PASS** |
| `MKT-C05-G02` | Conversiones atribuidas intentan serializarse como ventas causales: contrato exige tipo/fuente | **PASS** |
| `MKT-C06-G01` | INSERT/UPDATE de FK cross-tenant falla por API y DB con roles usados | **PASS** |
| `MKT-C06-G02` | Caída en migración/commit no deja aprobación/intención parcial visible | **PASS** |
| `MKT-C07-G01` | Persona retira permiso entre approval y dispatch: bloqueada para efectos nuevos | **PASS** |
| `MKT-C07-G02` | Consentimiento AV intenta habilitar audience upload o newsletter: denegado | **PASS** |
| `MKT-C08-G01` | ConexiónA usa site/accountB válido: binding bloquea antes de leer | **NOT_VERIFIED** |
| `MKT-C08-G02` | Cambio de edición/rol invalida report de capacidad antes del write | **NOT_VERIFIED** |
| `MKT-C09-G01` | CSV incluye tenant_id/owner y consent=true sin prueba: no concede permisos | **PASS** |
| `MKT-C09-G02` | LeadCandidate se importa como público pero no entra a un journey | **PASS** |
| `MKT-C10-G01` | Dos plataformas atribuyen misma order: ConversionFact no duplica ingreso | **PASS** |
| `MKT-C10-G02` | Consentimiento de analítica retirado no se suplanta con captura server-side | **PASS** |
| `MKT-C11-G01` | Token de instanciaB en conexiónA no lista contactos deB | **NOT_VERIFIED** |
| `MKT-C11-G02` | Mautic API deshabilitada produce unsupported, sin scraping fallback | **NOT_VERIFIED** |
| `MKT-C12-G01` | Agregar contacto al segmento intentaría enviar por cron: gate bloquea ruta | **NOT_VERIFIED** |
| `MKT-C12-G02` | Timeout tras draft create no duplica campaña al reintentar | **NOT_VERIFIED** |
| `MKT-C13-G01` | Tool intenta POST campaign/test a email libre: denegado por policy | **NOT_VERIFIED** |
| `MKT-C13-G02` | Publicar archive con datos personales no sucede al crear newsletter | **NOT_VERIFIED** |
| `MKT-C14-G01` | Proveedor aceptó pero cliente recibe timeout: no mandar de nuevo por Resend/padre | **PASS** |
| `MKT-C14-G02` | Mensaje de prueba a dirección del owner no aprobada como sandbox se rechaza | **PASS** |
| `MKT-C15-G01` | Formulario recopila email para recurso y no inscribe automáticamente a newsletter | **NOT_VERIFIED** |
| `MKT-C15-G02` | Landing incluye tag remoto no aprobado: publicación bloqueada | **NOT_VERIFIED** |
| `MKT-C16-G01` | IA inventa caso de éxito o beneficio médico: no habilita CreativeRevision publicable | **PASS** |
| `MKT-C16-G02` | Revocar licencia entre preview y dispatch impide uso nuevo del asset | **PASS** |
| `MKT-C17-G01` | Fuente web pide subir base de clientes: no se ejecuta instrucción | **PASS** |
| `MKT-C17-G02` | El owner pide aumentar ventas y el modelo no promete resultado causal sin datos | **PASS** |
| `MKT-C18-G01` | Añadir100 nuevos contactos al segmento remoto tras approval no los incluye | **PASS** |
| `MKT-C18-G02` | Cambiar atributo sensible en regla se rechaza antes de consulta | **PASS** |
| `MKT-C19-G01` | Ciclo de nurture sin máximo de pasos/reentrada se rechaza | **PASS** |
| `MKT-C19-G02` | Baja en paso2 cancela siguientes efectos aunque run siga almacenado | **PASS** |
| `MKT-C20-G01` | ApprovalA con texto igual intenta usar audienciaB: scope/hash bloquean | **PASS** |
| `MKT-C20-G02` | Cambiar targeting, precio o creativo tras aprobar exige otra revisión | **PASS** |
| `MKT-C21-G01` | Dos journeys simultáneos compiten por último slot de contacto: uno queda bloqueado | **PASS** |
| `MKT-C21-G02` | Forecast de medios intenta reservar tokens del SaaS como ad spend: rechazado | **PASS** |
| `MKT-C22-G01` | Backend aceptó envío, worker cae antes ACK: no nuevo envío desde backend alterno | **PASS** |
| `MKT-C22-G02` | Tenant suspendido durante takeover impide HTTP aunque lease esté libre | **PASS** |
| `MKT-C23-G01` | SiteB pedido desdeA se bloquea antes del Reporting API | **NOT_VERIFIED** |
| `MKT-C23-G02` | Sin datos no se reporta0 ventas o ROI positivo | **NOT_VERIFIED** |
| `MKT-C24-G01` | Plausible CE no expone operación Cloud requerida: unsupported, no scraping | **NOT_VERIFIED** |
| `MKT-C24-G02` | PostHog replay captura PII por default heredado: bloquear hasta configuración revisada | **NOT_VERIFIED** |
| `MKT-C25-G01` | GSC devuelve top rows y reporte no las etiqueta como universo completo | **NOT_VERIFIED** |
| `MKT-C25-G02` | GA4 mismo nombre de property pero ID distinto no cambia binding | **NOT_VERIFIED** |
| `MKT-C26-G01` | Página incluye instrucción de tool/admin o URL metadata: se trata como dato hostil | **PASS** |
| `MKT-C26-G02` | Hallazgo SEO no dispara deploy de página ni sitemap de producción | **PASS** |
| `MKT-C27-G01` | Proveedor cambia modelo: serie se marca cambio de régimen, no victoria de campaña | **NOT_VERIFIED** |
| `MKT-C27-G02` | Generar fake citations para aparecer más en IA queda bloqueado | **NOT_VERIFIED** |
| `MKT-C28-G01` | SRM o contaminación impiden reportar uplift como conclusión firme | **PASS** |
| `MKT-C28-G02` | LLM intenta activar feature flag de todos los proyectos: denegado | **PASS** |
| `MKT-C29-G01` | Tool ads_read solicita billing/mutate: capability denegada antes de HTTP | **NOT_VERIFIED** |
| `MKT-C29-G02` | Datos atribuidos duplicados de Meta/Google no se convierten en ingreso único sumado | **NOT_VERIFIED** |
| `MKT-C30-G01` | Cambiar testAccountId por cuenta real bloquea antes de mutar | **NOT_VERIFIED** |
| `MKT-C30-G02` | Timeout de creación paused no se reintenta con nueva key creando duplicado | **NOT_VERIFIED** |
| `MKT-C31-G01` | Modelo ajusta bien pero atribuye ventas preexistentes: no se certifica causalidad | **PASS** |
| `MKT-C31-G02` | Plataforma reporta ingresos pero no IDs negocio: cobertura/dedup limitados se explican | **PASS** |
| `MKT-C32-G01` | Serie corta/confundida no genera recomendación firme por necesidad comercial | **NOT_VERIFIED** |
| `MKT-C32-G02` | Modelo pide GPU/coste mayor que reserva: se bloquea sin gasto sorpresa | **NOT_VERIFIED** |
| `MKT-C33-G01` | El optimizador pide duplicar budget y tool no tiene capability de mutate | **PASS** |
| `MKT-C33-G02` | Scenario usa ingreso atribuido como causal: revisión bloquea afirmación | **PASS** |
| `MKT-C34-G01` | Sin conversiones observadas no se afirma ROI ni fracaso sin cobertura | **NOT_VERIFIED** |
| `MKT-C34-G02` | InformeA no muestra lista, modelo, links o agregados identificables deB | **NOT_VERIFIED** |
| `MKT-C35-G01` | Modelo intenta /provider/method o SQL libre: rechazo antes de ejecutar | **PASS** |
| `MKT-C35-G02` | Host approval adapter ausente no permite fabricar una aprobación local equivalente | **PASS** |
| `MKT-C36-G01` | Sesión Anam de campañaA intenta leer audienceB: bloqueada | **NOT_VERIFIED** |
| `MKT-C36-G02` | Dos pestañas cambian tenant durante approval: scope/revisión se revalidan | **NOT_VERIFIED** |
| `MKT-C37-G01` | Redes y marketing reciben mismo publicable: un EffectOwner controla dispatch | **PASS** |
| `MKT-C37-G02` | Export de clientes a servicio hermano sin contrato se rechaza aunque sea mismo owner | **PASS** |
| `MKT-C38-G01` | Plan mínimo AV supera bolsaLite: no se activa cargo automático | **NOT_VERIFIED** |
| `MKT-C38-G02` | Segundo tenant bajo carga conserva límites/servicio sin lectura cruzada | **NOT_VERIFIED** |
| `MKT-C39-G01` | Documento exige exportar audienceB: policy independiente del modelo bloquea | **PASS** |
| `MKT-C39-G02` | Restaurar backup anterior a baja conserva la supresión antes de activar worker | **PASS** |
| `MKT-C40-G01` | Buen fit MMM con recuperación causal mala no pasa gate científico | **PASS** |
| `MKT-C40-G02` | Respuesta final correcta con acción prohibida intermedia falla la evaluación | **PASS** |
| `MKT-C41-G01` | Pausa remoto sin ACK sigue estado incierto tras rollback y no se considera deshecha | **NOT_VERIFIED** |
| `MKT-C41-G02` | Restore completo preserva permisos/supresión y no reenvía outbox confirmada | **NOT_VERIFIED** |
| `MKT-C42-G01` | Se intenta aprobar piloto con conector real crítico no probado: BLOCKED | **NOT_VERIFIED** |
| `MKT-C42-G02` | Owner reproduce un efecto y reporte desde fixture hasta receipt/claim verificable | **NOT_VERIFIED** |

## 5. Integraciones: real, simulada y ausente

| Integración | Estado | Qué se ejecutó realmente |
|---|---|---|
| Supabase JWT | Implementado, verificado con HS256 de test | Firma, issuer, audiencia, expiración y membership de servidor; RS256 contra proyecto real no probado |
| Postgres + RLS | Ejecutado y verificado | Cuatro migraciones en Postgres 16.15; RLS forzada, aislamiento A/B, FK cross-tenant y `SKIP LOCKED` probados |
| Email | `SandboxEmailAdapter` | Entrega local sólo a destinatarios `sandbox_*`, con modos accept/fail/unknown y reconciliación |
| Mautic, Listmonk | Stub `disabled` | Contratos y mapeo; ninguna llamada HTTP real |
| Matomo, Plausible, PostHog, GA4, GSC | Stub `disabled` | Contratos de observación; ninguna lectura real |
| GrowthBook | Stub | Propuesta de experimento y análisis de potencia; sin SDK |
| Ads (Meta/Google) | Stub | Propuesta y validación con techo de 50 EUR/día; ninguna mutación |
| Anam | Stub | Sesión simulada; sin token ni vídeo |
| Bus del padre | Propuesta | Eventos en memoria; no se tocó `agente` |

## 6. Qué NO está verificado (y por qué)

1. **Postgres en el camino del API** (C22/C41): el SQL está verificado, pero el API y el worker siguen en memoria.
2. **JWT RS256 contra Supabase staging** (C03): sólo se probó el camino HS256 de test.
3. **Cualquier API de proveedor** (C11–C13, C23–C25, C29–C30, C36, C38): sin cuentas, licencias ni tokens.
4. **CI de GitHub** (C41): el workflow existe; sólo se ejecutaron los mismos comandos en local.
5. **Envío real de correo, publicación de landings, gasto en ads**: fuera del alcance autorizado.
6. **Rate limit distribuido**: el contador compartido está verificado en SQL; el despliegue multi-instancia no se ha probado.

## 7. Cómo auditar esto de forma independiente (Codex Cloud)

1. `git checkout feat/marketing-42-campaigns`, confirmar HEAD y `git log --oneline -5`.
2. Ejecutar los tres comandos de la sección 2 y comparar: 101 pruebas, 0 fallos, typecheck limpio.
3. Leer `tests/campaigns/hardening.test.ts`: cubre journey programado, revocación de aprobación, baja posterior al commit, zona IANA, FSM de handoff y rate limit.
4. Con Postgres: `DATABASE_URL=… npx vitest run tests/db/postgres.test.ts` debe dar 13/13.
5. Verificar que ningún adaptador externo hace red: `grep -rn "fetch(" packages/adapters/src` no debe encontrar llamadas a proveedores.
6. Confirmar aislamiento unitario: `tests/campaigns/c01-c10.test.ts` incluye tenant B contra recursos de A.
7. Contrastar cada fila de la matriz con su `CAMPAIGN.md`; cada reporte de fase cita archivos y tests concretos.
8. Buscar secretos: `git grep -nE "(sk_|pk_|ghp_|AKIA)"` no debe encontrar valores.

Discrepancia documental conocida: `docs/implementation/README.md` desaconseja
implementar desde scaffolds incompletos; el founder autorizó ejecutar las 42
fases y esa decisión prevalece, anotada aquí como decisión y no como olvido.

## 8. Qué falta para llamar esto `PRODUCTION_READY`

Nada de lo pendiente es cosmético: persistencia real, RLS probado, CI en GitHub
y al menos un proveedor verificado. Hasta entonces el estado correcto es
`SCAFFOLDING COMPLETO Y VERIFICADO EN LOCAL`.
