# Estado de la Matriz de Trazabilidad (RTM)

La RTM está en la Parte 3 del archivo docs/Hito-Integracion-SQA.docx.docx. Ahí ya se actualizó la columna Estado. Este archivo guarda en el repositorio la evidencia de cada estado, porque en un Word no se puede ver qué cambió.

Regla que seguimos: un caso es "Aprobado" o "Fallido" solo si una prueba lo ejecutó de verdad. Si nadie lo probó, o solo se probó con una respuesta simulada de la base de datos en la parte que el caso necesita, queda "No ejecutado". Todo se ejecutó el 12 de octubre de 2026.

## Casos CP-01 a CP-19

| Caso | Qué se prueba | Estado | Evidencia o motivo |
|---|---|---|---|
| CP-01 | Landing page | Aprobado | tests/e2e/casos-rtm.spec.js: título, los 3 pasos, el mínimo de Q400 y el enlace al portal |
| CP-02 | Login correcto | No ejecutado | La prueba e2e solo pasó con una respuesta simulada de Supabase. Falta correr la variante con la base real |
| CP-03 | Contraseña incorrecta | Aprobado | tests/e2e/login.spec.js, dos pruebas contra la base real |
| CP-04 | Campos vacíos | Aprobado | tests/e2e/login.spec.js, dos pruebas |
| CP-05 | URL sin sesión manda al login | Aprobado | tests/e2e/casos-rtm.spec.js: dashboard.html y catalogo.html sin sesión regresan a login.html |
| CP-06 | Agotados marcados | Aprobado | tests/e2e/casos-rtm.spec.js con el catálogo real: 16 productos y 3 agotados (0003, 0006 y 0012) con la etiqueta "Agotado" y sin botón. Se corrigió el resultado esperado en la RTM, que decía "8 productos, 2 marcados" |
| CP-07 | SKU existente | Aprobado | tests/e2e/busqueda-sku.spec.js, busca 0004 en el catálogo real |
| CP-08 | SKU inexistente | Aprobado | tests/e2e/busqueda-sku.spec.js, busca XYZ999 |
| CP-09 | Cantidad 1 | Aprobado | Prueba unitaria CP-09 (npm test) |
| CP-10 | Cantidad 99 | Aprobado | Prueba unitaria CP-10 |
| CP-11 | Cantidad 0 | Aprobado | Prueba unitaria CP-11 |
| CP-12 | Cantidad 100 | Aprobado | Prueba unitaria CP-12 |
| CP-13 | Cantidad con letras | Aprobado | Prueba unitaria CP-13 |
| CP-14 | Producto agotado | Aprobado | Prueba unitaria CP-14 |
| CP-15 | Eliminar una línea | Aprobado | tests/e2e/casos-rtm.spec.js: con dos productos (Q285.00), al quitar uno el total pasa a Q85.00 |
| CP-16 | Enviar con Q399.99 | Aprobado | Prueba unitaria CP-16 y tests/e2e/casos-rtm.spec.js: muestra "Le faltan Q0.01 para el minimo." y no llama a la base |
| CP-17 | Enviar con Q400.00 | Aprobado | Prueba unitaria CP-17 (la regla permite enviar). La prueba e2e del envío completo usa una respuesta simulada; falta probarlo una vez con la base real |
| CP-18 | Doble clic en enviar | No ejecutado | tests/e2e/envio-pedido.spec.js pasa, pero con la respuesta de Supabase simulada. Falta probarlo con la base real después de ejecutar sql/registrar-pedido.sql |
| CP-19 | Botón atrás tras salir | Aprobado | tests/e2e/casos-rtm.spec.js: después de cerrar sesión, el botón atrás lleva a login.html y la sesión ya no existe |

## Casos CP-20 a CP-30 (filtro, HU-09)

Las 11 pruebas unitarias de tests/filtros.test.js pasaron con npm test: 11 de 11 aprobadas. No se agregaron como filas en la tabla del Word porque la RTM no tiene definida su prioridad ni su riesgo, y no queríamos inventarlos. Su estado se anotó en el párrafo debajo de la tabla.

## Compatibilidad (NFR-06)

tests/compat/compatibilidad.spec.js se corrió con `npm run test:compat` en las 6 combinaciones del NFR-06. En cada una abre index.html, login.html, catalogo.html y dashboard.html y revisa tres cosas: que no haya errores de JavaScript, que la página no sea más ancha que la pantalla y que se vean los elementos principales. Resultado: 24 de 24 aprobadas.

| Navegador | Versión | Escritorio 1920x1080 | Celular 390x844 |
|---|---|---|---|
| Chromium (el que trae Playwright) | 156.0 | Aprobado | Aprobado |
| Firefox (instalado en Windows) | 156.0 | Aprobado | Aprobado |
| Microsoft Edge (instalado en Windows) | 155.0 | Aprobado | Aprobado |

La prueba no revisa si el diseño se ve bien. Eso sigue siendo inspección visual.

## Resumen

De los 19 casos de la RTM: 17 aprobados, 0 fallidos, 0 bloqueados y 2 no ejecutados (CP-02 y CP-18). Con CP-20 a CP-30 son 28 aprobados de 30.

## Lo que todavía hay que hacer a mano

1. Ejecutar sql/registrar-pedido.sql en Supabase y borrar el pedido de prueba PRUEBA-RLS-1791860157752.
2. CP-02 con la base real: correr `npm run test:e2e` con las variables E2E_CODIGO y E2E_CLAVE de una consejera activa, o entrar a mano y confirmar que llega al dashboard.
3. CP-17 y CP-18 con la base real: enviar un pedido de Q400 o más, dar doble clic en "Enviar pedido" y confirmar que en "Mis pedidos enviados" aparece uno solo.
4. Revisión visual del diseño en los 3 navegadores y 2 tamaños.
5. Los 5 criterios BDD (CA-01 a CA-05), siguiendo tests/aceptacion/pedido.feature.
