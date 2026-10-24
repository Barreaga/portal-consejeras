# Sección 5 del Test Plan: matriz de pruebas basada en riesgos (RBT)

Borrador para revisar. Los riesgos R-01 a R-10 ya están en la sección 2.4 del Máster Test Plan. Esta matriz los reúne con seis riesgos nuevos (R-11 a R-16) que aparecieron al conectar el sitio con Supabase.

La exposición es probabilidad por impacto, con una escala de 1 (baja) a 3 (alta). Las valoraciones son un juicio del equipo y se pueden discutir. Prioridad: 7 a 9 Alta, 4 a 6 Media, 1 a 3 Baja.

## Riesgos nuevos por la arquitectura con Supabase

| ID | Riesgo | Prob. | Impacto | Exposición | Prioridad | Cómo se prueba | Estado |
|---|---|---|---|---|---|---|---|
| R-11 | Cualquiera con la llave publishable puede leer las contraseñas en texto plano y los pedidos de todas las consejeras | 3 | 3 | 9 | Alta | RLS no lo cubre. No se probó una lectura de la columna clave | Riesgo aceptado: limitación declarada en docs/arquitectura-actualizacion.md (1.8). Se cerraría con Supabase Auth |
| R-12 | Con la llave publishable se modifican o borran datos reales porque RLS no está activo o está mal configurado | 1 | 3 | 3 | Baja | SEG-04 a SEG-09 (UPDATE y DELETE devuelven 0 filas) e INSERT en productos rechazado con 42501 | Probado: 9 de 9 el 12 de octubre de 2026 |
| R-13 | Se cae la red o Supabase al enviar el pedido y la consejera pierde su carrito | 2 | 3 | 6 | Media | INT-06 y la prueba e2e de falla de red: aparece un aviso y el carrito se conserva | Probado con respuestas simuladas. No se probó con una caída real |
| R-14 | El pedido se registra dos veces si se pierde la respuesta y la consejera reintenta | 2 | 3 | 6 | Media | INT-07 (el reintento no duplica) y CP-18 (doble clic) | Probado: CP-18 también a mano con la base real, un solo registro (PED-2026-8675) |
| R-15 | Las reglas RN-01 a RN-03 del navegador y las de la función registrar_pedido quedan desiguales y la base acepta o rechaza distinto | 1 | 2 | 2 | Baja | INT-09 (la base rechaza por RN-01 y se explica el motivo) y la revisión manual hecha el 12 de octubre de la función con pedido vacío, Q399.99, cantidad 100 y producto agotado | Probado |
| R-16 | El sitio no funciona sin internet o si falla el CDN de supabase-js | 2 | 3 | 6 | Media | No hay prueba | Sin prueba. Se acepta porque el sitio depende por diseño de Supabase |

## Matriz completa ordenada por exposición

| ID | Riesgo | Exposición | Prioridad | Casos que lo cubren | Estado |
|---|---|---|---|---|---|
| R-11 | Lectura de datos con la llave publishable | 9 | Alta | Ninguno | Aceptado |
| R-04 | Entrar al dashboard escribiendo la URL | 9 | Alta | CP-05 | Aprobado |
| R-01 | Enviar sin llegar a Q400 | 6 | Media | CP-16, CP-17 | Aprobado |
| R-03 | Pedido duplicado por doble clic | 6 | Media | CP-18 | Aprobado |
| R-05 | Sesión activa tras cerrar sesión | 6 | Media | CP-19 | Aprobado |
| R-07 | Total mal por decimales | 6 | Media | CP-15 | Aprobado |
| R-13 | Falla de red al enviar | 6 | Media | INT-06 | Probado con simulación |
| R-14 | Pedido duplicado por reintento | 6 | Media | INT-07, CP-18 | Aprobado |
| R-16 | Sitio sin internet o sin CDN | 6 | Media | Ninguno | Sin prueba |
| R-02 | Cantidades inválidas | 6 | Media | CP-09 a CP-13 | Aprobado |
| R-06 | Agregar un producto agotado | 4 | Media | CP-06, CP-14 | Aprobado |
| R-12 | Escritura no autorizada con la llave | 3 | Baja | SEG-01 a SEG-09 | Aprobado |
| R-15 | Reglas distintas entre navegador y base | 2 | Baja | INT-09 | Aprobado |

Las exposiciones de R-01 a R-07 salen de la valoración de la sección 2.4 (Alta = 3, Media = 2) y las de R-08 a R-10, que son riesgos del proyecto y no del producto, no entran en esta matriz.

## Qué cambia en la ejecución por esta matriz

- El riesgo con mayor exposición (R-11) no se puede probar con RLS. Se declara como limitación y se explica en la defensa, en vez de esconderlo.
- R-16 es el único riesgo con exposición media sin ninguna prueba. Si hubiera tiempo, el primer caso a agregar sería abrir el sitio sin conexión y comprobar que se muestra un aviso claro.
- Las pruebas de seguridad y de compatibilidad no corren en el QA Gate, así que R-12 solo se vuelve a comprobar cuando alguien corre `npm run test:seguridad`.
