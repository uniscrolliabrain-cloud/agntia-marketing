# UX, portal y presencia Anam

Diseño, no UI implementada. Portal simple, responsive y accesible para owner, marketer/revisor y colaboradores con scope. Cliente externo no necesita usar paneles de Mautic, listmonk o AgntiaPro. Sus consolas pueden existir para administración interna. Supabase obligatorio y contexto de tenant/proyecto visible siempre.

## Superficies

Inicio: objetivos, campañas, aprobaciones, bloqueos, costes y resultados con cobertura. Workspace de campaña: brief/hipótesis, audiencia y exclusiones, materiales, timeline, calendario, presupuesto y medición. Dashboard: descriptivo/atribuido/estimado claramente etiquetados, fuente y ventana accesibles. Chat/twin en columna derecha de escritorio y panel móvil con foco/control de sesión; permite explicar números y preparar propuestas sin tapar la revisión.

La persona edita textos, assets, enlaces y claims. Cambios invalidan aprobación según materialidad definida. Preview presenta contenido exacto/render, variantes, remitente/receptor tipo, máximo de audiencia, excluidos por permiso, finalidad/canal, coste/ventana y efectos incluidos. No mostrar por defecto una lista completa de emails para justificar un conteo. Ampliar segmento después del preview requiere nueva revisión; bajas reducen sin ampliar alcance.

Botones diferentes para guardar, previsualizar, solicitar revisión y ejecutar lo autorizado. Un botón de «test» puede enviar: la UI debe indicar destinatarios sandbox y efecto real. Doble click/refresco usa misma operationKey. Mostrar accepted, delivered y outcome_unknown distintos; la opción de reconciliar no reenviar. Pausa indica qué se confirmó remoto y qué está en vuelo, sin prometer deshacer correos/anuncios/costes ya aceptados.

## Anam como presencia del agente existente

N01 documenta pipeline y posibilidades de usar componentes propios. Se elige modalidad que preserve identidad/runtime canónicos: el twin razona/ejecuta por contratos del servicio y Anam aporta presencia conversacional. No se atribuye al avatar autoridad de owner o firma. No se ha creado sesión, conectado SDK ni contratado plan.

La sesión nace en backend desde JWT Supabase/ACL/mandato y TwinBinding; API key nunca va al browser. Token breve Anam es distinto de JWT y credenciales de proveedores. Limitar tenant/proyecto/campaña, tools, duración, concurrencia, coste y retención. Cambiar tenant, revocar scope o caducar mandato exige cerrar/recrear contexto; no conservar un retrieval privado abierto en otra sesión.

Una confirmación hablada prepara una propuesta; la aprobación sensible del piloto se confirma en UI autenticada, con step-up si corresponde. No inferir que una voz parecida es el owner. Callbacks usan el mismo PEP, sin tool libre de enviar/compra/publicar. Se explica que es IA, permisos AV y grabación optativa; no emoción/biometría para targeting. Sin saldo/plan/conexión, ofrecer texto y preservar estado honesto.

## Idiomas y accesibilidad

ES/EN/FR en UI y borradores con verificación de números, fechas, unidades y matices legales/claims. Una traducción no valida el motor para ese idioma. Objetivo WCAG2.2 AA, no certificado actual: teclado, foco, contraste, anuncios async, lectores/subtítulos y reduced motion. Móvil permite editar, revisar fuentes y aprobar sin hover. Browser tests futuros con datos sintéticos: cambio de tenant en dos pestañas, baja durante aprobación, token expirado, red lenta, bloqueo de AV y resultado de envío incierto.
