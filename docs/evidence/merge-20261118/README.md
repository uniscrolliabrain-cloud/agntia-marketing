# Merge de `9cf035b` en `main` y estado de CI

Fecha: 2026-11-18. Registra el aterrizaje del hardening de la capa SQL en `main`
y el resultado comprobado de CI, para que la evidencia de
`docs/evidence/db-hardening-20261118/` no quede describiendo un commit «local sin
empujar».

## Qué se hizo

| Paso | Resultado |
|---|---|
| `fetch` del remoto | `main` = `eb421fa`; la rama iba 1 commit por delante; fast-forward posible, sin divergencia |
| `push` de `feat/marketing-42-campaigns` | rama nueva en el remoto |
| `git merge --ff-only` en `main` | `eb421fa..9cf035b`, 17 ficheros, +1604/−16, **sin commit de merge** |
| `push` de `main` | `eb421fa..9cf035b  HEAD -> main` |

## Cómo se comprobó (no basta el recibo del push)

- `FETCH_HEAD` tras el push: `9cf035b735ea10133e0a86c825f07539418bf454`.
- `origin/main` local re-apuntado a ese SHA; `rev-list --left-right --count
  origin/main...main` → `0 0`; árbol limpio.
- Lectura independiente por la API de GitHub: el commit más reciente de `main` es
  `9cf035b`, con padre `eb421fa` y el mismo mensaje.
- GitHub Actions sobre `9cf035b`: `verify` y `database` en **success** en las dos
  ejecuciones del workflow (`44331473031` y `44331506957`). El job `database`
  levanta `postgres:16` como servicio, aplica la cadena de migraciones y corre la
  suite con `DATABASE_URL`, así que la capa SQL también quedó verificada fuera de
  este entorno.

## Qué no se afirma

- No se promovió ningún gate a `PASS` con este merge.
- El API y el worker siguen usando `MemoryStore`: la persistencia de producto no
  está implementada (`FreeBuff/HANDOFF-PERSISTENCIA-Y-SCHEDULER.md`).
- No se ejecutó ningún proveedor externo, ni se envió ningún mensaje, ni se gastó
  dinero.

## Ficheros

- `ci.json`: commit, padre, tipo de merge, verificación local previa, comprobación
  del remoto y las cuatro comprobaciones de Actions con sus `job_id`.
