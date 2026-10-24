# Estado de la Matriz de Trazabilidad (RTM)

La RTM está en la Parte 3 del archivo docs/Hito-Integracion-SQA.docx.docx. Ahí ya se actualizó la columna Estado. Este archivo guarda en el repositorio la evidencia de cada estado, porque en un Word no se puede ver qué cambió.

Regla que seguimos: un caso es "Aprobado" o "Fallido" solo si una prueba lo ejecutó de verdad. Si nadie lo probó, o solo se probó con una respuesta simulada de la base de datos en la parte que el caso necesita, queda "No ejecutado". Todo se ejecutó el 12 de octubre de 2026.

Antes de la prueba manual de envío se ejecutó sql/registrar-pedido.sql en Supabase y se borró el pedido de prueba de la prueba RLS. Se comprobó que la función rechaza un pedido vacío y uno de Q399.99 (RN-01), una cantidad de 100 (RN-02) y un producto agotado (RN-03), sin guardar nada.

## Casos CP-01 a CP-19

| Caso | Qué se prueba | Estado | Evidencia o motivo |
|---|---|---|---|
| CP-01 | Landing page | Aprobado | tests/e2e/casos-rtm.spec.js: título, los 3 pasos, el mínimo de Q400 y el enlace al portal |
| CP-02 | Login correcto | Aprobado | Prueba manual con la base real: Brandon Arreaga inició sesión con una consejera activa y llegó al dashboard. La prueba e2e también pasa con una respuesta simulada |
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
| CP-17 | Enviar con Q400.00 | Aprobado | Prueba unitaria CP-17, prueba e2e con respuesta simulada y prueba manual con la base real: el pedido PED-2026-8675 de Q400.00 exactos quedó registrado y se mostró el número |
| CP-18 | Doble clic en enviar | Aprobado | Prueba manual con la base real: doble clic en "Enviar pedido" y en la tabla pedidos quedó un solo registro (PED-2026-8675, con 1 línea). También pasa tests/e2e/envio-pedido.spec.js con respuesta simulada |
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

De los 19 casos de la RTM: 19 aprobados, 0 fallidos, 0 bloqueados y 0 no ejecutados. Con CP-20 a CP-30 son 30 aprobados de 30.

## Pruebas manuales ejecutadas el 24 de octubre de 2026

Las hizo Brandon Arreaga en el sitio publicado (barreaga.github.io/portal-consejeras), con la consejera 3311. Las capturas quedaron guardadas fuera del repositorio.

| Caso | Resultado | Evidencia |
|---|---|---|
| CA-01 (CP-17) | Aprobado | Se envió un pedido de Q400.00 y se creó el pedido PED-2026-5017. Después se borró de Supabase: primero sus líneas en lineas_pedido y luego el pedido |
| CA-02 (CP-16) | Aprobado | Con 3 unidades del SKU 0001 (Q399.99) apareció "Le faltan Q0.01 para el minimo." |
| CA-03 (CP-12) | Aprobado | Con cantidad 100 apareció "La cantidad maxima es 99." |
| CA-04 (CP-14) | Aprobado | El producto 0012 apareció con la etiqueta "Agotado" y sin botón de agregar |
| CA-05 (CP-05) | Aprobado | Sin sesión, al escribir la dirección de dashboard.html el sitio llevó a login.html |

Con esto los 5 criterios BDD de tests/aceptacion/pedido.feature quedaron ejecutados a mano.

Otras comprobaciones del mismo día:

- Despliegue (MAN-09): la última ejecución de "pages build and deployment" en Actions estaba en verde. En el sitio publicado, la pestaña Network mostró una petición GET con estado 200 a la dirección de Supabase del proyecto (rest/v1/pedidos, filtrada por la consejera 3311).
- Robot Framework: los 4 casos de tests/robot (CP-03 y CP-04 del login) pasaron, 4 de 4, con `robot --outputdir resultados tests/robot`.
- Seguridad: `npm run test:seguridad` dio 14 de 14 aprobadas en la computadora de Brandon Arreaga. La fila de prueba que deja SEG-03 se borró a mano.
- Estado de la base después de las pruebas: la única fila en pedidos es PED-2026-8675, la de la prueba manual del 12 de octubre.

## Lo que todavía hay que hacer a mano

1. Revisión visual del diseño en los 3 navegadores y 2 tamaños (MAN-04 de docs/guia-pruebas-manuales.md).
2. Rendimiento (NFR-01), usabilidad con una persona externa (NFR-02) y 20 envíos seguidos (NFR-03).
3. La tecla Enter en el login (MAN-08) y la prueba de RLS desde la consola del navegador (MAN-03). La seguridad de RLS sí está cubierta por la prueba automática.
