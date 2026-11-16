| ID | Objetivo | Dependencia | Capacidades | Estado de ejecución |
|---|---|---|---|---|
| C00 | baseline reproducible | — | todas, verificación | PASS · [reporte](C00-baseline-y-reconciliacion/EXECUTION-REPORT.md) |
| C01 | identidad, contratos y autoridad | C00 | M64–M65 | PASS · [reporte](C01-autoridad-contratos/EXECUTION-REPORT.md) |
| C02 | persistencia, outbox, recuperación | C01 | M67–M68 | VERIFICADO · [reporte](C02-persistencia-y-outbox/EXECUTION-REPORT.md) |
| C03 | inteligencia de mercado | C02 | M01–M10 | PASS · [reporte](C03-inteligencia-de-mercado/EXECUTION-REPORT.md) |
| C04 | claims, assets y creatividad | C02 | M11–M20 | DOCUMENTADO · pendiente |
| C05 | campañas, journeys, canales | C02,C04 | M21–M32 | DOCUMENTADO · pendiente |
| C06 | métricas y experimentos | C03,C05 | M33–M44 | DOCUMENTADO · pendiente |
| C07 | economía y escenarios | C06 | M45–M52 | DOCUMENTADO · pendiente |
| C08 | Growth Office y UX | C03–C07 | M53–M63 | DOCUMENTADO · pendiente |
| C09 | proveedores, privacidad, certificación | C08 | M66,M69–M72 | DOCUMENTADO · pendiente |

Cada campaña exige reporte por wave, evidence IDs y resultado PASS/FAIL/BLOCKED. Nunca atribuir tests históricos a esta ejecución.

C00–C03 se ejecutaron el 2026-11-16 en la rama `impl/c00-c03-market-authority-20261116`; ver el `EXECUTION-REPORT.md` de cada paquete y la [matriz M01–M72](../06-certificacion/MATRIZ-M01-M72.md). Queda pendiente publicar C04–C09 completas (generadas en local) y ejecutar sus patchsets.
