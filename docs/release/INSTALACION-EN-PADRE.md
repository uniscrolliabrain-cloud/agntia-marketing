# Instalar el SDK de `agntia-marketing` en el repo padre

**Verificado el 2026-11-23** con `npm run verify:pack`: los dos tarballs se
instalan con `npm install` real en un consumidor limpio, se importan como ESM,
ejercitan las 8 tools y el bridge de eventos. No se ha publicado nada en ningún
registro y **no se ha modificado el repositorio `agente`**.

## 1. Qué se instala y qué no

| Paquete | Contenido | Para qué |
|---|---|---|
| `@agntia/contracts` | envelope v1, DTO Zod, mapa de eventos al padre, errores seguros | tipar y validar lo que el padre envía y recibe |
| `@agntia/sdk` | `MarketingClient` con allowlist de rutas, 8 tools y `toParentEvent` | hablar con el servicio sin reimplementar autoridad |

**No** se instalan `apps/api`, `apps/worker`, `apps/portal`, `packages/core` ni
`packages/adapters`. El padre no ejecuta el servidor ni el worker: los llama por
HTTP. Esto es deliberado, porque la autoridad no puede viajar en el cliente:

- el `tenantId` y el `actorId` salen del JWT verificado + membership de servidor,
  nunca del cuerpo (`MarketingClient` no acepta un tenant en el input);
- la capability la decide el PEP del servidor, y un tool no puede pedir otra;
- no hay tool de envío, aprobación, export total, cambio de presupuesto, subida de
  audiencia ni administración.

## 2. Camino recomendado: tarballs

```bash
# en agntia-marketing
npm ci
npm run pack:sdk        # deja dist/npm/agntia-contracts-0.1.0.tgz y agntia-sdk-0.1.0.tgz
npm run verify:pack     # opcional: instala en un consumidor limpio y lo ejercita

# en el repo padre
npm install /ruta/a/agntia-marketing/dist/npm/agntia-contracts-0.1.0.tgz
npm install /ruta/a/agntia-marketing/dist/npm/agntia-sdk-0.1.0.tgz
```

**El orden importa.** `@agntia/sdk` declara `@agntia/contracts@0.1.0`; si se
instalan los dos a la vez, npm intenta resolver esa dependencia del registro
público, donde el paquete no existe. Instalando contratos primero, npm ya la ve
satisfecha.

`pack:sdk` compila con `tsc` a `dist/`, reescribe los especificadores relativos
con extensión `.js` (Node ESM la exige), genera un `package.json` de distribución
con `exports`/`types` y empaqueta. El workspace **no cambia**: los `package.json`
de `packages/*` siguen apuntando a `src/`, así que `npm test` y `npm run api:dev`
siguen funcionando sin compilar.

### Alternativas

| Camino | Cuándo | Límite |
|---|---|---|
| `"@agntia/sdk": "file:../agntia-marketing/dist/npm/sdk"` | monorepo del padre con el repo a mano | enlaza, no versiona: un `npm ci` en otra máquina falla |
| registro privado (Verdaccio, GitHub Packages) | el padre quiere versiones fijas | requiere quitar `private: true` de los `package.json` del workspace y publicar los mismos artefactos |
| dependencia `git:` | evitar tarballs | **no soportado hoy**: los paquetes del workspace apuntan a `src/*.ts`, no a `dist/` |

## 3. Uso mínimo

```ts
import { MarketingClient, TOOLS, toParentEvent } from '@agntia/sdk';
import { MarketingError, PARENT_EVENT_MAP } from '@agntia/contracts';

const client = new MarketingClient({
  baseUrl: process.env.MARKETING_API_URL!, // http(s)://host, sin barra final obligatoria
  token: jwtDelTenant,                     // el JWT del actor; el SDK no lo valida
  correlationId: `kernel_${kernelTurnId}`,
});

// Una tool allowlist: el input no lleva tenant, actor ni capability.
const briefTool = TOOLS.find((t) => t.name === 'marketing_brief_read')!;
const brief = await briefTool.invoke(client, { briefId: 'brf_123' });

// Evento hacia el bus del padre: sólo tipos mapeados y sin PII.
const envelope = toParentEvent(
  { type: 'marketing.campaign.committed', payloadRefs: [{ kind: 'campaign', id: 'cmp_1' }] },
  { owner: tenantId, emittedAt: new Date().toISOString() },
);
if (!envelope) return; // sin equivalente en el padre: no se inventa un tipo
```

Reglas que el SDK no relaja:

1. `POST` exige `Idempotency-Key` (el SDK la rechaza si falta).
2. La ruta debe empezar por `/v1/marketing/`; cualquier otra cosa lanza
   `path_not_allowlisted` antes de tocar la red.
3. `toParentEvent` devuelve `null` si el tipo no está en `PARENT_EVENT_MAP`.
4. `MarketingError` trae `code`, `detail` y `httpStatus`; un error de red llega
   como excepción del `fetch`, no como envelope.

## 4. Lo que el padre tiene que aportar

- **JWT de Supabase** con firma, `iss`, `aud` y tiempos verificados en el
  servidor de marketing. Sin JWKS del proyecto real, RS256 sigue `BLOCKED`.
- **Membership de servidor**: `tenantId`, `actorId`, roles y scopes viven en
  Postgres; provisionarlos es un flujo administrativo auditado
  (`POST /v1/marketing/admin/actions`), no una escritura del SDK.
- **Registro del especialista** con sus capacidades y clases de efecto, y el
  contrato de handoff con ACK firmado (ver
  `FreeBuff/INTEGRATION-AGENTE-PROPOSAL.md` §8). Nada de eso está aplicado: es
  propuesta, y requiere aprobación del founder y del owner del kernel.
- **Mandato explícito** entre el tenant de origen del operador y el tenant
  objetivo. Un twin no hereda capacidades por nombre.

## 5. Verificación reproducible

```bash
npm run pack:sdk        # build + staging + tarballs
npm run verify:pack     # npm install real en dist/npm/consumer + check.mjs
```

Salida esperada de `verify:pack` (2026-11-23):

```json
{"ok":true,"tools":8,"event":"specialist.work_item.updated","contract":"1.0.0"}
{"installedInto":".../dist/npm/consumer","result":"PASS"}
```

El consumidor comprueba: import ESM de los dos paquetes, `CONTRACT_VERSION`,
`marketing_brief_read` contra un `fetch` de prueba (URL y `authorization`
correctos), exactamente 8 tools, rechazo de `baseUrl` inválida y de ruta fuera de
la allowlist, y mapeo de evento con `schemaVersion: "1.0"` más `null` para un tipo
desconocido.

Primer paso en un padre real, sin publicar nada:

```bash
npm install ./dist/npm/agntia-contracts-0.1.0.tgz ./dist/npm/agntia-sdk-0.1.0.tgz
node -e "import('@agntia/sdk').then(m => console.log(m.TOOLS.length))"   # 8
```

## 6. Límites que siguen abiertos

- **No hay publicación**: los tarballs se generan en `dist/npm/` (ignorado por
  git). Un registro privado no se ha probado.
- **`verify:pack` necesita red** para bajar `zod`; sin registro el script falla y
  eso es un fallo del entorno, no un PASS.
- **`toParentEvent` no cubre todos los eventos**: sólo los de `PARENT_EVENT_MAP`.
  Un evento sin equivalente debe quedarse en marketing.
- El SDK **no** verifica el JWT ni resuelve membership: eso es del servidor. Un
  token robado sirve para lo que el servidor autorice, y nada más.
- Probado con Node local (ver `docs/evidence/vertical-slice-20261123/run.log`); el
  job `verify` de CI ahora compila los paquetes (`npm run pack:sdk`) pero **no**
  ejecuta `verify:pack`.
