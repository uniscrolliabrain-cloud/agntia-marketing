# Decisiones y acciones del fundador
P0: aprobar frontera de autoridad Marketing/Clientes/Redes/Branding/Ventas/Finanzas y política de aprobación de campañas, destinatarios y presupuesto. Bloquea G1/G5; mocks permiten continuar.
P0: decidir entorno Supabase/Postgres y custodio de secretos, roles RLS, políticas de retención y jurisdicción UE. Bloquea pruebas reales DB; fixtures locales permiten G0.
P1: seleccionar primer proveedor sandbox de correo y cuentas de prueba con destinatarios allowlisted; jamás usar lista de clientes en tests.
P1: seleccionar Matomo/GA4/Search Console y acceso read-only; sin ellos medir solo fixtures.
P1: aprobar contratos interrepo con responsables de agente y repos hermanos; hasta entonces adaptadores versionados provisionales.
P2: aprobar costes y licencias de Mautic/listmonk/GrowthBook/Meridian/Robyn si se incorporan. No instalar todas por defecto.
P2: decidir voz/Anam y presupuesto de sesiones, separado de aprobación de efectos.
Ninguna API key o token debe almacenarse en Markdown. Las decisiones pendientes no impiden investigación, contratos mock ni tests locales.
