# Protocolo de fábrica de software: Freebuff → Codex → Senior Architect + Founder

**DRAFT v0.1.** No autoriza despliegues, cambios del padre ni gasto.

## Roles
- **Freebuff / implementador**: propietario exclusivo de escritura en rama `feat/mkt-cNN-...`. Lee documentación global, léxico, campaña N−1/N/N+1 y contratos. Produce patchsets, tests, evidencia y handoff.
- **Codex / revisor independiente**: recibe SHA congelado, ejecuta instalación, typecheck, lint, tests y auditorías negativas; no modifica la rama del implementador durante revisión. Si corrige, usa rama propia o devuelve findings reproducibles.
- **ChatGPT / senior architect**: custodia arquitectura, vocabulario, mapa de interfaces, dependencias y resolución de conflictos. Revisa integración transversal, diseño y deuda. No aprueba en nombre del founder.
- **Founder**: prioriza, acepta excepciones, autoriza merge/deploy/cambios sensibles.

## Lectura obligatoria en orden
1. `docs/OPERACION-PIPELINE-3-AGENTES.md`
2. `docs/LEXICO-CANONICO-AGENTE-MARKETING.md`
3. `docs/architecture/05-GUARDRAILS-INTEGRACION-AGENTE.md` (en esta rama; si no existe, BLOCKED)
4. `docs/architecture/01-arquitectura.md`, `03-compatibilidad-agente.md`, `04-runtime-determinista.md`
5. `docs/campaigns/campaign.json` y documento original de la campaña
6. `docs/implementation/NN-*/README.md` y sus tres handoffs
7. Campaña N−1 y N+1: dependencia y contexto, nunca ejecutar N+1 por leerla
8. Estado del padre a SHA fijado, pruebas y ADRs aplicables

## Estados
`NOT_STARTED → READY → IMPLEMENTING → READY_FOR_REVIEW → REVIEWING → CHANGES_REQUESTED | VERIFIED → ARCH_REVIEW → FOUNDER_APPROVAL → MERGED`. Estados `BLOCKED`, `NOT_VERIFIED` y `FAILED` no son PASS.

## Pipeline escalonado
Freebuff puede trabajar N+1 mientras Codex revisa N **solo si** N+1 no depende de cambios no verificados de N. El arquitecto revisa contratos y efectos cruzados antes de merge. Una rama por campaña, un escritor por archivo/superficie. No mezclar dos PRs con migraciones incompatibles. Congelar SHA de cada entrega para revisión; un nuevo commit invalida veredicto previo en rutas afectadas.

## Evidencias mínimas
`BASELINE.md`: SHA padre/Marketing, entorno, versiones, dependencias.
`PATCHSETS.md`: por paso, archivos nuevos/modificados, firma, contrato, migración, tests, rollback.
`EVIDENCE.md`: comando exacto, exit code, tests pass/fail/skip, stdout sanitizado, fecha, commit.
`REVIEW.md`: findings P0–P3, riesgos, regresiones, decisión y pruebas reproducibles.
`DECISION.md`: aprobación del founder o bloqueo explícito.

## Gate y stop
Bloquear ante cross-tenant, autorización/approval incompleta, secreto, doble efecto, retry ciego, gasto no autorizado, pérdida de audit, migración irreversible, tests críticos sin ejecutar o contrato padre no verificado. Nunca declarar verde por tests mock o por documentos. Sin autorización no desplegar ni tocar main. El merge no implica despliegue.

## Política de documentación viva
Toda campaña actualiza léxico si añade semántica; actualiza contrato/ADR si cambia una frontera; actualiza matriz de dependencias si altera un orden. Codex revisa esas actualizaciones y el arquitecto resuelve conflictos antes del gate.
