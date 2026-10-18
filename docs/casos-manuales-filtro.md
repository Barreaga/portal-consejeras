# Casos manuales del filtro del catálogo (HU-09)

Estos casos complementan las pruebas unitarias CP-20 a CP-30 de `tests/filtros.test.js`. Las pruebas unitarias revisan la función `filtrarProductos()` sola, con una lista de productos de prueba. Estos casos revisan el filtro desde la página, con los productos reales que vienen de Supabase y con los botones de catalogo.html.

Filtros disponibles según js/filtros.js y catalogo.html:

- Categoría. Las opciones se llenan con las categorías que existen en la tabla productos. "Todas" no filtra.
- Rango de precio. Campos Min y Max. Los dos límites son inclusivos (precio >= Min y precio <= Max). Si un campo está vacío o no es número, ese límite se ignora.
- Orden. Sin orden, precio de menor a mayor, precio de mayor a menor y nombre de la A a la Z.
- Botón "Aplicar filtros", que además borra lo escrito en la búsqueda por SKU, y botón "Limpiar filtros".

Datos usados: el catálogo de la tabla productos consultado el 12 de octubre de 2026 (16 productos, SKU 0001 a 0016). Si el catálogo cambia, hay que actualizar los resultados esperados antes de ejecutar.

Precondición de los tres casos: haber iniciado sesión con una consejera activa y estar en catalogo.html con el catálogo ya cargado.

## CM-F01 · Filtrar por categoría con orden y luego buscar por SKU

| Campo | Contenido |
|---|---|
| Historia | HU-09 y HU-04 |
| Datos de entrada | Categoría: Maquillaje. Orden: Precio de menor a mayor. Búsqueda por SKU: 0005 |
| Estado | No ejecutado |

Pasos:

1. En Categoría elegir "Maquillaje".
2. En Ordenar por elegir "Precio: menor a mayor".
3. Presionar "Aplicar filtros".
4. Revisar la lista de productos.
5. Escribir 0005 en el campo de búsqueda por SKU y presionar "Buscar".
6. Revisar la lista de productos.

Resultado esperado:

- En el paso 4 se muestran solo 3 productos, en este orden: 0004 Set de Labiales (Q189.50), 0007 Base de Maquillaje (Q210.00) y 0008 Kit de Brochas (Q320.00).
- En el paso 6 se muestra solo el producto 0005 Shampoo Reparador, aunque es de la categoría Cabello. Según catalogo.js, la búsqueda por SKU se hace sobre el catálogo completo y no sobre la lista filtrada.

Observación para revisar al ejecutarlo: después del paso 6, el selector de Categoría sigue diciendo "Maquillaje" aunque en pantalla aparece un producto de otra categoría. Si el equipo decide que eso confunde a la consejera, se registra como defecto de usabilidad.

## CM-F02 · Rango de precio sin resultados

| Campo | Contenido |
|---|---|
| Historia | HU-09 |
| Datos de entrada | Categoría: Todas. Min: 400. Max: 500 |
| Estado | No ejecutado |

Pasos:

1. Dejar Categoría en "Todas".
2. Escribir 400 en Min y 500 en Max.
3. Presionar "Aplicar filtros".
4. Presionar "Limpiar filtros".

Resultado esperado:

- En el paso 3 la lista de productos queda vacía, porque el producto más caro del catálogo cuesta Q320.00 (0008 Kit de Brochas).
- Aparece el mensaje "Ningun producto cumple con los filtros seleccionados."
- En el paso 4 se borran Min y Max, desaparece el mensaje y vuelven a mostrarse los 16 productos.

## CM-F03 · Rango de precio con límites exactos dentro de una categoría

| Campo | Contenido |
|---|---|
| Historia | HU-09 |
| Datos de entrada | Categoría: Cuidado de la piel. Min: 100. Max: 150 |
| Estado | No ejecutado |

Pasos:

1. En Categoría elegir "Cuidado de la piel".
2. Escribir 100 en Min y 150 en Max.
3. Presionar "Aplicar filtros".
4. Revisar la lista de productos.

Resultado esperado:

- Se muestran 3 productos: 0001 Crema Hidratante (Q133.33), 0002 Locion Corporal (Q100.00) y 0006 Mascarilla Facial (Q145.75).
- 0002 aparece aunque cuesta exactamente Q100.00, porque el límite mínimo es inclusivo.
- 0006 aparece con la etiqueta "Agotado" y sin botón de agregar. El filtro no oculta productos agotados; eso lo controla la regla RN-03 al agregar.
- No aparece 0016 Kit de Afeitado (Q150.00) porque es de la categoría Cuidado masculino.
