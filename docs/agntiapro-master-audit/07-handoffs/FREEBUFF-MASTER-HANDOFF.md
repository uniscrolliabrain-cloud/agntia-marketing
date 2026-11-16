# Handoff ejecutable para Freebuff
## Fuente de verdad
Clonar `https://github.com/uniscrolliabrain-cloud/agntia-marketing.git`; leer `handoff_chat_gpt.md`, `docs/concept-master/CONCEPT-MASTER.md`, `docs/campaigns/README.md`, `docs/campaigns/campaign.json`, `FreeBuff/HANDOFF-RECONCILIADO-42-CAMPANAS.md`, este master audit y todas las campañas constructivas. Base documental `docs/master-audit-campaigns-20261116`; nunca escribir código en main directamente.
## Preflight
```sh
git fetch --all --prune
git status --porcelain
git rev-parse HEAD
git branch -a
npm install --ignore-scripts
npm run typecheck
npm test
```
Instalar solo en entorno aislado y registrar versión de Node/npm, exit code, duración, tests omitidos y cambios de lockfile. Si el lockfile requiere otro gestor, corregir el comando según evidencia; no forzar instalación. No ejecutar migraciones de producción.
## Protocolo
Crear `feat/marketing-Cxx-<slug>` desde baseline aprobado; para cada PS: leer archivos reales y contrato, implementar un cambio atómico, tests negativos y de fallo, commit, reporte y evidencia, actualizar matriz de Mxx. Ejecutar orden topológico C00→C09; paralelo solo cuando no haya conflictos de escritura. Si el código ya existe, auditar/reforzar y escribir regresiones en vez de duplicar.
No habilitar proveedores, envíos, ads, gasto, publicación, scraping o despliegue real sin consentimiento y aprobación explícita. Los efectos desconocidos requieren reconciliación antes de reintento. Las aprobaciones se vinculan a hash de payload, audiencia máxima, canal, presupuesto, vigencia y finalidad.
Cada wave produce `EXECUTION-REPORT.md` con baseline/final SHA, diff, archivos, comandos, PASS/FAIL/SKIP, evidencia, errores, rollback y siguiente patchset. Una campaña bloqueada no bloquea otra independiente. No hacer merge ni modificar `agente`.
## Cierre
Gates G0–G4 solo con pruebas reales. G5 exige SHAs concretos de ambos repos, cuentas sandbox y aprobación del fundador. Escalar decisiones de credenciales, contratos autoritativos, licencias incompatibles y cambios irreversibles.
