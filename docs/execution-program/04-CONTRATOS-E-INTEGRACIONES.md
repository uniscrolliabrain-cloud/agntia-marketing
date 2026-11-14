# Contratos de Marketing

Fuentes: `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/architecture/03-compatibilidad-agente.md`, `docs/architecture/04-runtime-determinista.md`.

JWT Supabase+membresía+scope; twin/mandato firmado con originTenant/targetTenant distintos; consentimientos, bases legales, supresiones, opt-out, frecuencia, presupuesto y claims/rights comprobados. AuthorityMap por campaña/canal/campo; evitar doble gasto y doble envío con hermanos. PayloadHash+revisión+aprobación, outbox y receipts; incertidumbre de envío no se reintenta a ciegas. Métricas con propiedad/identidad autorizadas, minimización y retención. Experimentación con criterios explícitos; no confundir atribución con efecto causal. No ads de producción sin aprobación; no usar proveedor sin capabilities verificadas.
