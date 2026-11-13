# C01 — Handoff a Freebuff (implementador)

Estado: **READY FOR DOCUMENTARY BASELINE ONLY**, no cambios de runtime. Leer protocolo, léxico, guardrails, campaña original C01 y C02, SHA de ambos repos.

## Objetivo
Producir baseline reproducible del padre y Marketing, inventario de contratos, árbol de ficheros y entorno. No editar el padre, no crear integraciones ni instalar proveedores.

## Patchsets propuestos
- **P01**: crear `docs/baseline.md` con SHA, fecha, estructura, scripts, versión de Node/pnpm y estado de dependencias; registrar observaciones vs inferencias.
- **P02**: crear `docs/parent-diff.md` con mapa de Actor, JWT, Tenant, Task, SOP, Events, Approval y archivos/símbolos verificables; enlazar blobs/SHAs.
- **P03**: crear `docs/evidence/c01/README.md` con entorno, comandos ejecutados, exit codes, tests pass/fail/skip, riesgos y fuentes; no afirmar tests si no corren.
- **P04**: verificar coherencia del mapa y que no se tocaron `/agente`, secretos ni `main`.

## Pruebas/gates
G01: cambio de SHA padre obliga a revisar mapeo. G02: prohibir campaña real o efectos externos para baseline. Tests documentales: links, JSON, SHA y diffs. Registrar bloqueos si faltan permisos o checkout.

## Entrega
Commit SHA, diff, rutas creadas, evidencia y dudas. No solicitar merge sin revisión independiente.
