# CI del commit `0bae5c1`

Workflow `ci` ([run 44927582513](https://github.com/uniscrolliabrain-cloud/agntia-marketing/actions/runs/44927582513)),
sobre `0bae5c15b1532470a0bb76d8190c78f529937c8f`, empujado a `main` el 2026-11-21.

| Job | Resultado | Inicio → fin |
|---|---|---|
| `verify` (Node 22: `typecheck` + `test`) | success | 16:59:56 → 17:00:11 UTC |
| `database` (`postgres:16`: `db:migrate` + `test`) | success | 16:59:57 → 17:00:32 UTC |

Ambos jobs tienen 1 anotación: el aviso de GitHub sobre la versión de Node de las
actions, no un fallo de la suite. Los dos concluyeron en `success`, así que la
suite de 165 pruebas pasa también en el runner de CI (Node 22 y Postgres 16) y no
sólo en el Postgres 18.7 del sandbox.
