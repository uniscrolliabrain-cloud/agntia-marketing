# Baseline · MKT-C01

**Fecha:** 2026-11-14
**Repo:** `uniscrolliabrain-cloud/agntia-marketing`
**Rama de implementación:** `feat/marketing-42-campaigns`
**SHA de partida (documental):** `9285dc21f1b80cdbf284dc44fe797954ee151b56`
**SHA del padre consultado:** `54b8d5407a8576459448c4d059a877297d18ca7a`
**Autorización:** el owner pide, en esta sesión, ejecutar las 42 campañas en
código. No modificar `agente` ni otros repositorios.

## Alcance de lectura y escritura

| Ámbito | Lectura | Escritura |
|---|---|---|
| `docs/campaigns/*` (42 especificaciones) | sí | sólo el reporte de fase |
| `docs/execution-program/campaigns/*/CAMPAIGN.md` | sí | reporte de fase |
| `docs/contracts`, `docs/architecture`, `docs/05-seguridad-privacidad.md` | sí | no |
| `uniscrolliabrain-cloud/agente` | referencia (SHA fijado) | **no** |
| Código de este repo | — | sí, en rama aislada |
| Proveedores externos | ninguno | ninguno |
| Datos reales de clientes | ninguno | ninguno |

## Entorno realmente disponible

| Herramienta | Estado | Consecuencia |
|---|---|---|
| Node.js | 26.13.0 | ejecuta tests y typecheck |
| npm | 11.20.0 | instala dependencias |
| Docker | binario presente, **sin daemon** | Postgres no se puede levantar |
| PostgreSQL | no instalado | persistencia real queda **NOT_VERIFIED** |
| Cuentas Mautic/Listmonk/Matomo/GA4/Ads/Anam | no disponibles | adaptadores **deshabilitados** |

Por tanto: los gates que dependen de Postgres, de un proveedor real o de una
cuenta no se declaran PASS. Se declaran `NOT_VERIFIED` o `BLOCKED` y la
capacidad permanece apagada.

## Hallazgos heredados (no causados por esta implementación)

1. **Sin código previo.** El repositorio sólo tenía documentación; el 100 % del
   código de esta rama es nuevo.
2. **Discrepancia catálogo 12 / índice 16** en el padre, heredada del diseño
   documental. No se resuelve aquí: se conserva como deuda y el binding de
   proveedores no la usa como fuente de verdad.
3. **Mautic con edición y versión de API sin confirmar.** El adaptador declara
   lectura y cero escrituras hasta verificar edición.
4. **Meta Insights devolvió 429** durante la investigación documental previa.
   No se ha reintentado ni se ha usado como evidencia.
5. **`agente` no se ha tocado.** Sólo se ha leído su SHA y sus contratos.

## Contratos del padre que marketing necesita

| Contrato | Uso aquí | Estado |
|---|---|---|
| `Actor` / JWT | principal verificado | implementado en `apps/api/src/auth.ts` |
| `tenantId` nativo | ámbito de datos | conservado, no sustituido por UUID propio |
| `provenance` | twin y eventos | `tenant/twin@agente:<sha>` |
| `tasks` / `events` | bridge de eventos | allowlist en `packages/contracts/src/events.ts` |
| lead discovery / accept | no se usa | buscar o aceptar un lead **no** es consentimiento de campaña |
| seguimiento / oposiciones | se respeta | la supresión local manda; una baja reduce audiencia |

## Bitácora de riesgos inicial

- **R1** Ejecutar 42 fases sin proveedor real puede producir una demo que parezca
  producto. Mitigación: health semántico, `verified: false` en conexiones y
  gates `NOT_VERIFIED` explícitos.
- **R2** Un `tenantId` de cuerpo podría colarse como autorización. Mitigación:
  el envelope se construye en servidor y `resolvePrincipal` ignora el payload.
- **R3** El outbox puede duplicar si un worker reintenta tras timeout.
  Mitigación: fence monotónico, receipts únicos y estado `unknown` sin reintento.
- **R4** Un claim sin fuente puede llegar a una creatividad. Mitigación: claims
  con evidencia obligatoria y bloqueo del preview.
- **R5** Confundir atribución con causalidad. Mitigación: tipos de claim
  separados y rechazo de suma entre plataformas.
