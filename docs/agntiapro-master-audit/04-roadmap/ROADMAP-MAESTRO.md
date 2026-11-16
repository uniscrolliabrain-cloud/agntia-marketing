# Roadmap maestro y dependencias
L0 C00 baseline, pruebas reproducibles y conciliación histórica; L1 C01 autoridad/tenancy/contratos; L2 C02 persistencia y ejecución durable; L3 C03 inteligencia de mercado + C04 creatividad; L4 C05 campañas y proveedores; L5 C06 medición y experimentación; L6 C07 economía; L7 C08 Growth Office; L8 C09 certificación e integración.
Grafo: C00→C01→C02; C02→C03,C04,C05; C03,C04,C05→C06; C05,C06→C07; C03,C04,C05,C06,C07→C08→C09. Los trabajos en paralelo requieren zonas de escritura exclusivas y contratos congelados por versión.
Gates: G0 baseline; G1 seguridad/contratos; G2 dominio; G3 recovery; G4 adaptador mock; G5 integración real aprobada. Todos PENDIENTES, no certificados.
Fases: primero compatibilidad con runtime actual de agente; segundo adaptador V2 propuesto sin asumir que V2 existe; tercero prueba cruzada con SHAs y autorización humana.
