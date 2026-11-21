# CI del commit `1b93d17`

Workflow `ci`, run **44920989505**, evento `push` a `main`, `head_sha`
`1b93d17c256754879c6ad75864e0930dfa3341f1` (el commit de esta etapa).

| Job | Resultado | Terminó | Qué corrió |
|---|---|---|---|
| `verify` | success | 15:47:06Z | `npm ci`, `npm run typecheck`, `npm test` (sin base) |
| `database` | success | 15:47:29Z | servicio `postgres:16`, `npm run db:migrate`, `npm test` con `DATABASE_URL` |

Y el del commit que añade la prueba de concurrencia:

Workflow `ci`, run **44921234404**, `head_sha`
`f30d6b51dcb5678a59ba3c729012efe07cda93bb`, conclusión **success** (15:50:21Z).
Ahí corre por primera vez en el runner el caso de dos escritores concurrentes
sobre el mismo tenant.

Ambos runs se consultaron por la API de GitHub el 2026-11-21 con la cuenta
`github_wint-glynn`. El resultado confirma que la migración `0007` y las pruebas
de estado durable pasan en el runner, no sólo en el sandbox.

No es un despliegue: no se publicó nada ni se conectó ningún proveedor real.

El CI del propio commit de documentación que registra esto no se anota aquí
porque se dispara después de escribir el archivo; queda visible en el historial
de Actions del repositorio.
