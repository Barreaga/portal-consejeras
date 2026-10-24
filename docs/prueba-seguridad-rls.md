# Prueba de seguridad: Row Level Security (NFR-04b)

Esta prueba verifica el NFR-04b: con la llave publishable, que es la que usa el sitio, solo se puede leer y crear pedidos. No se puede modificar ni borrar nada.

## Qué se probó

La prueba está en `tests/seguridad/rls.test.js` y se corre con `npm run test:seguridad`. Usa node --test y llama directo a la API REST de Supabase con la misma URL y la misma llave publishable de `js/supabaseClient.js`. La prueba las lee de ese archivo para no copiar la llave en otro lado. Es lo mismo que puede hacer cualquier persona que abra el sitio y copie la llave desde el navegador.

| Caso | Operación | Resultado esperado |
|---|---|---|
| SEG-01 | SELECT en productos (SKU 0001) | Devuelve el producto |
| SEG-02 | SELECT en consejeras (código 3311, sin la columna clave) | Devuelve la consejera |
| SEG-03 | INSERT en pedidos de un pedido de prueba | Se crea el pedido |
| SEG-04 | UPDATE del precio del producto 0001 a Q1 | 0 filas afectadas y el producto queda igual |
| SEG-05 | UPDATE del estado de la consejera 3311 a inactiva | 0 filas afectadas y la consejera queda igual |
| SEG-06 | UPDATE del total del pedido de prueba a 999 | 0 filas afectadas y el total sigue en 0 |
| SEG-07 | DELETE del producto 0001 | 0 filas afectadas y el producto sigue existiendo |
| SEG-08 | DELETE de la consejera 3311 | 0 filas afectadas y la consejera sigue existiendo |
| SEG-09 | DELETE del pedido de prueba | 0 filas afectadas y el pedido sigue existiendo |

En cada UPDATE y DELETE la prueba vuelve a leer la fila después, para confirmar que no cambió. Esto es necesario porque, con RLS, Supabase no responde con error a un UPDATE o DELETE bloqueado: responde 200 con una lista vacía, o sea, 0 filas afectadas.

Cómo cuidamos los datos reales:

- El único registro que crea la prueba es un pedido cuyo número empieza con PRUEBA-RLS- seguido de la fecha en milisegundos. Ese pedido queda en la tabla y se borra a mano desde el panel de Supabase.
- Los UPDATE y DELETE sobre productos y consejeras se mandan con la cabecera `Prefer: handling=strict, max-affected=0`. Si RLS fallara y la operación tocara alguna fila, PostgREST deshace el cambio y devuelve el error PGRST124. La prueba lo detecta y falla sin dañar los datos reales. Antes de usarla comprobamos que el servidor aplica esta cabecera, porque aparece en la respuesta como `preference-applied`.

## Resultado real

Ejecutada el 12 de octubre de 2026 (13 de octubre en hora UTC) desde la computadora de Brandon Arreaga. Resultado: 9 de 9 casos aprobados, 0 fallidos.

- SEG-01 y SEG-02: la lectura funciona.
- SEG-03: se creó el pedido de prueba PRUEBA-RLS-1791860157752 (consejera 3311, total 0.00). Hay que borrarlo desde el panel de Supabase.
- SEG-04 a SEG-09: todos los UPDATE y DELETE respondieron 200 con una lista vacía, y al volver a leer los datos estaban igual. El producto 0001 sigue en Q133.33 y la consejera 3311 sigue activa.

Además comprobamos a mano, con la misma llave, que un INSERT en productos se rechaza con código 401 y el mensaje de Postgres "new row violates row-level security policy for table productos" (error 42501). Esto confirma que RLS está activado en la base de datos real, no solo escrito en `sql/politicas-rls.sql`.

La prueba no corre en `npm test` ni en el QA Gate, porque necesita internet y cada ejecución deja un pedido de prueba en la base. El script `test` de package.json ahora nombra las carpetas de las pruebas unitarias y de integración para que esta prueba quede fuera.

## Lo que esta prueba no cubre

- La confidencialidad. La política de lectura de consejeras deja leer todas las columnas, incluida la clave en texto plano. La prueba no lee esa columna, pero cualquiera con la llave podría hacerlo.
- La identidad de quien crea un pedido. La política de INSERT en pedidos acepta cualquier fila, así que se puede crear un pedido a nombre de cualquier consejera. Esto viene de que el login es simulado y no usa Supabase Auth.
- La tabla lineas_pedido. Tiene las mismas políticas que pedidos según `sql/politicas-rls.sql`, pero no se probó por separado.

## Por qué no ocultamos la URL ni la llave

El sitio no tiene un servidor propio. Todo el JavaScript corre en el navegador de quien visita la página, así que la URL de Supabase y la llave le tienen que llegar a ese navegador para que el sitio funcione. Aunque las escondiéramos en otro archivo o las codificáramos, igual se verían en la pestaña Network del navegador. Esconderlas no protege nada.

Por eso la URL y la llave publishable están visibles a propósito en `js/supabaseClient.js`. Supabase diseñó la llave publishable para usarse en el navegador, y esa llave sola no da permisos especiales. La protección está en Row Level Security: la base de datos decide qué se puede hacer con esa llave, y esta prueba muestra que con ella no se puede modificar ni borrar nada. La llave secreta, que sí se salta RLS, no está en el código y no se usó en esta prueba.

## Ampliación: pruebas nuevas

Se agregaron pruebas después de la ejecución del 12 de octubre de 2026. El 22 de octubre de 2026 se corrió `npm run test:seguridad` completo desde la computadora de Brandon Arreaga: 14 de 14 casos aprobados, 0 fallidos y 0 omitidos.

| Caso | Qué prueba | Estado |
|---|---|---|
| SEG-10 | INSERT en productos se rechaza con el código 42501 y no queda ninguna fila | Aprobado el 22 de octubre de 2026 |
| SEG-11 | INSERT en consejeras se rechaza con el código 42501 y no queda ninguna fila | Aprobado el 22 de octubre de 2026 |
| SEG-12 | UPDATE en lineas_pedido no modifica nada (cubre el hueco que decía esta página) | Aprobado el 22 de octubre de 2026 |
| SEG-13 | DELETE en lineas_pedido no borra nada | Aprobado el 22 de octubre de 2026 |
| SEG-14 | Limitación conocida: la columna clave se puede leer con la llave publishable. La prueba no imprime la clave | Aprobado el 22 de octubre de 2026 |

SEG-12 y SEG-13 se omiten solos si la tabla lineas_pedido está vacía, porque en ese caso no demostrarían nada. En esta ejecución no se omitieron, así que la tabla tenía líneas y las pruebas sí comprobaron algo.

Después de la ejecución se consultó la base en modo lectura. SEG-10 y SEG-11 no dejaron ningún producto ni consejera de prueba. La única fila que quedó es el pedido PRUEBA-RLS-1792730618049 (consejera 3311, total 0.00), creado por SEG-03, que hay que borrar a mano desde el panel de Supabase.

SEG-14 pasa porque la limitación existe. Si algún día se usa Supabase Auth y la clave deja de ser legible, esa prueba va a fallar, y habrá que actualizar la documentación.

### Inyección de código (NFR-04a)

tests/e2e/xss.spec.js tiene 8 pruebas: dos textos de ataque (una etiqueta img con onerror y una etiqueta script) escritos en cuatro lugares: la búsqueda por SKU, la cantidad de un producto, los filtros de precio y el login (código y contraseña). En cada una se revisa que no se ejecute el código (window.xss queda sin definir), que no salga ninguna alerta y que la etiqueta no se cree en la página.

Resultado el 22 de octubre de 2026 con `npx playwright test tests/e2e/xss.spec.js`: 8 de 8 aprobadas. Antes de confiar en ellas se comprobó que la detección funciona: inyectando el mismo texto con innerHTML a propósito, window.xss sí vale 1 y la etiqueta sí aparece. Ninguno de los archivos de js/ usa innerHTML.

Lo que estas pruebas no demuestran: los mensajes de error de esos campos son textos fijos, no repiten lo escrito. Por eso el riesgo ya era bajo, y la prueba sirve para detectar si alguien cambia eso en el futuro. Corren con `npm run test:e2e`, no están en el QA Gate.
