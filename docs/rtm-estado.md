# Estado de la Matriz de Trazabilidad (RTM)

La RTM está en la Parte 3 del archivo docs/Hito-Integracion-SQA.docx.docx. Ahí ya se actualizó la columna Estado. Este archivo guarda en el repositorio la evidencia de cada estado, porque en un Word no se puede ver qué cambió.

Regla que seguimos: un caso es "Aprobado" o "Fallido" solo si una prueba lo ejecutó de verdad. Si nadie lo probó, queda "No ejecutado". Todo se ejecutó el 12 de octubre de 2026.

## Casos CP-01 a CP-19

| Caso | Qué se prueba | Estado | Evidencia o motivo |
|---|---|---|---|
| CP-01 | Landing page | No ejecutado | Es visual, se revisa a mano |
| CP-02 | Login correcto | No ejecutado | La prueba e2e solo pasó con una respuesta simulada de Supabase. Falta correr la variante con la base real |
| CP-03 | Contraseña incorrecta | Aprobado | tests/e2e/login.spec.js, dos pruebas contra la base real |
| CP-04 | Campos vacíos | Aprobado | tests/e2e/login.spec.js, dos pruebas |
| CP-05 | URL sin sesión manda al login | No ejecutado | La prueba unitaria CP-05 revisa que sin sesión no se pueda enviar un pedido, no la redirección de la página |
| CP-06 | Agotados marcados | No ejecutado | El resultado esperado de la RTM ("8 productos, 2 marcados") ya no corresponde: el catálogo en Supabase tiene 16 productos y 3 agotados. La prueba unitaria CP-06 revisa otra cosa (que un producto disponible se pueda agregar) |
| CP-07 | SKU existente | Aprobado | tests/e2e/busqueda-sku.spec.js, busca 0004 en el catálogo real |
| CP-08 | SKU inexistente | Aprobado | tests/e2e/busqueda-sku.spec.js, busca XYZ999 |
| CP-09 | Cantidad 1 | Aprobado | Prueba unitaria CP-09 (npm test) |
| CP-10 | Cantidad 99 | Aprobado | Prueba unitaria CP-10 |
| CP-11 | Cantidad 0 | Aprobado | Prueba unitaria CP-11 |
| CP-12 | Cantidad 100 | Aprobado | Prueba unitaria CP-12 |
| CP-13 | Cantidad con letras | Aprobado | Prueba unitaria CP-13 |
| CP-14 | Producto agotado | Aprobado | Prueba unitaria CP-14 |
| CP-15 | Eliminar una línea | No ejecutado | La prueba unitaria CP-15 revisa el total con decimales, no eliminar una línea |
| CP-16 | Enviar con Q399.99 | Aprobado | Prueba unitaria CP-16. Revisa que no deje enviar, pero no revisa el texto de cuánto falta |
| CP-17 | Enviar con Q400.00 | Aprobado | Prueba unitaria CP-17. Revisa que sí deje enviar, pero no que se muestre el número de pedido |
| CP-18 | Doble clic en enviar | No ejecutado | Ninguna prueba hace doble clic. INT-03 revisa que un envío deje un solo pedido, pero no el doble clic |
| CP-19 | Botón atrás tras salir | No ejecutado | Se revisa a mano en el navegador |

Las pruebas unitarias (CP-09 a CP-17) revisan la regla de negocio en el código, no lo que se ve en pantalla. Por eso en la RTM se aprobaron como verificación de la regla.

## Casos CP-20 a CP-30 (filtro, HU-09)

Las 11 pruebas unitarias de tests/filtros.test.js pasaron con npm test: 11 de 11 aprobadas. No se agregaron como filas en la tabla del Word porque la RTM no tiene definida su prioridad ni su riesgo, y no queríamos inventarlos. Su estado se anotó en el párrafo debajo de la tabla.

## Resumen

De los 19 casos de la RTM: 12 aprobados, 0 fallidos, 0 bloqueados y 7 no ejecutados. Con CP-20 a CP-30 son 23 aprobados de 30.

## Lo que hay que probar a mano

Esto lo tiene que ejecutar una persona, porque no se corrió en este entorno o porque es visual:

1. CP-01: abrir index.html y revisar que se vea la información del programa.
2. CP-02 con la base real: correr `npm run test:e2e` con las variables E2E_CODIGO y E2E_CLAVE de una consejera activa, o entrar a mano con esas credenciales y confirmar que llega al dashboard.
3. CP-05: sin haber iniciado sesión, escribir la dirección de dashboard.html y de catalogo.html, y confirmar que regresa a login.html.
4. CP-06: abrir el catálogo y confirmar que los 3 productos agotados (0003, 0006 y 0012) aparecen marcados como "Agotado" y sin botón de agregar. Antes hay que actualizar el resultado esperado en la RTM.
5. CP-15: agregar dos productos, quitar uno y confirmar que el total se recalcula.
6. CP-16 y CP-17 en pantalla: confirmar el mensaje de cuánto falta con Q399.99, y que con Q400.00 aparece el número de confirmación.
7. CP-18: dar doble clic rápido en "Enviar pedido" y confirmar que en el dashboard aparece un solo pedido.
8. CP-19: cerrar sesión, presionar el botón atrás del navegador y confirmar que no vuelve a la página interna.
9. Compatibilidad (NFR-06): revisar el sitio en Chrome, Firefox y Edge, en escritorio (1920x1080) y en celular (390x844). Son 6 combinaciones. En el repositorio no hay evidencia guardada de esa revisión.
10. Los 5 criterios BDD (CA-01 a CA-05), siguiendo los pasos de tests/aceptacion/pedido.feature.
