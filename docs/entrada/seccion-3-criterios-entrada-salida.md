# Sección 3 del Test Plan: criterios de entrada, salida y suspensión

Borrador para revisar. Parte de lo que ya dice la sección 2.5 del Máster Test Plan (MTP-PC-001) y lo compara con el estado real del repositorio al 18 de octubre de 2026.

## Criterios de entrada (cuándo empezamos a probar)

| Criterio | Cómo se comprueba | Estado |
|---|---|---|
| El sitio abre y se conecta a Supabase | Se abre el sitio publicado, se inicia sesión y el catálogo carga | Cumplido: lo usan las pruebas e2e y la prueba manual del 12 de octubre |
| El QA Gate pasa | Pestaña Actions de GitHub: ESLint sin errores y `npm test` sin fallas | Cumplido en main: 0 errores de ESLint y 32 de 32 pruebas |
| Los casos están escritos | RTM con CP-01 a CP-19 y las pruebas CP-20 a CP-30 del filtro | Cumplido |
| Los datos de prueba existen | Consejera activa 3311 y el catálogo de 16 productos (3 agotados) en Supabase | Cumplido. La consejera inactiva y las contraseñas no están en el repositorio |
| Las políticas RLS están activas | sql/politicas-rls.sql ejecutado y tests/seguridad/rls.test.js | Cumplido: 9 de 9 el 12 de octubre de 2026 |
| La función registrar_pedido existe en Supabase | sql/registrar-pedido.sql ejecutado | Cumplido según docs/rtm-estado.md. Se ejecutó a mano en el panel |

## Criterios de salida (cuándo damos las pruebas por terminadas)

Son los cuatro de la sección 2.5, comparados con lo ejecutado.

| Criterio | Resultado | Evidencia |
|---|---|---|
| Se ejecutaron todos los casos Críticos y Altos | Cumplido | docs/rtm-estado.md: 19 de 19 casos aprobados |
| Se ejecutó al menos el 80% de los casos Medios y Bajos | Cumplido para la RTM | Los 19 casos y los 11 del filtro. Quedan sin ejecutar los 5 criterios BDD y la revisión visual |
| No quedan defectos Críticos abiertos | Cumplido | Los issues #1 y #2 están cerrados. Ninguno era Crítico: el #1 fue Alto y el #2 Medio |
| Todas las historias tienen al menos un caso ejecutado | Cumplido | RTM: HU-01 a HU-08. HU-09 con CP-20 a CP-30 |

Pendiente que no está en los criterios pero debe decirse: los requisitos no funcionales NFR-01 (rendimiento), NFR-02 (usabilidad) y NFR-03 (fiabilidad) no se han medido todavía. Las instrucciones para hacerlo están en docs/guia-pruebas-manuales.md (MAN-05, MAN-07 y MAN-06).

## Criterios de suspensión (cuándo paramos)

- Aparece un defecto Crítico que impide seguir probando.
- Falla más del 40% de los casos en una sesión, lo que indica que el código no estaba listo.
- Supabase no responde. Las pruebas e2e, de seguridad y de compatibilidad necesitan internet, así que se suspenden hasta que vuelva. `npm test` sigue funcionando porque usa un cliente falso en memoria.

## Criterios de reanudación

- El defecto Crítico se corrigió en un PR fusionado y el QA Gate está en verde.
- Se volvió a correr la prueba que encontró el defecto y las pruebas que dependían de ella.

## Diferencias con la versión del Hito 1

- La sección 2.5 del Word habla de 3 consejeras y 8 productos con 2 agotados. El catálogo real en Supabase tiene 16 productos y 3 agotados (0003, 0006 y 0012), y la RTM ya se corrigió así (CP-06).
- El pedido enviado y el historial pasaron de localStorage a Supabase, y las pruebas de integración INT-01, INT-03 e INT-05 se adaptaron con un cliente falso en memoria (docs/evolucion-pruebas.md).
