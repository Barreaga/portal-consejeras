# Guía de pruebas manuales

Esta guía lista lo que las pruebas automatizadas no cubren y que hay que revisar a mano en el sitio publicado. Cada prueba tiene los pasos, los datos, el resultado esperado y espacio para anotar lo que pasó. El estado de cada una empieza en "No ejecutado" y solo se cambia después de hacerla de verdad.

## Datos de prueba

Todo sale del repositorio (tests/, js/ y docs/rtm-estado.md). Lo que no está en el repositorio se dice aquí y hay que completarlo antes de empezar.

| Dato | Valor | De dónde sale |
|---|---|---|
| Consejera activa | Código 3311 | tests/e2e/login.spec.js y docs/prueba-seguridad-rls.md |
| Contraseña de la 3311 | No está en el repositorio. Anotarla aquí a mano: __________ | Tabla consejeras en Supabase |
| Consejera inactiva | No está en el repositorio. Código: __________ | Tabla consejeras en Supabase (columna estado) |
| Productos agotados | 0003, 0006 y 0012 | docs/rtm-estado.md (CP-06) |
| Producto de Q100.00 | SKU 0002, Loción Corporal | docs/casos-manuales-filtro.md |
| Producto de Q133.33 | SKU 0001, Crema Hidratante | docs/prueba-seguridad-rls.md |
| Pedido de Q399.99 | 3 unidades del SKU 0001 (3 x 133.33) | Cuenta hecha con los precios de arriba |
| Pedido de Q400.00 | 4 unidades del SKU 0002 (4 x 100.00) | docs/rtm-estado.md (CP-17) |

Cuidado: enviar un pedido de verdad crea un registro en las tablas pedidos y lineas_pedido de Supabase. Cada pedido que se envíe en estas pruebas hay que anotarlo (número PED-...) y borrarlo después desde el panel de Supabase.

Dónde guardar las capturas: carpeta evidencias/ fuera del repositorio, con el nombre de la prueba (por ejemplo MAN-03-captura.png). Anotar en cada prueba el nombre del archivo.

## MAN-01 · Criterios de aceptación BDD (CA-01 a CA-05)

Los escenarios están en tests/aceptacion/pedido.feature y no están automatizados. Se ejecutan a mano en el sitio publicado, iniciando sesión con la consejera 3311.

| Caso | Pasos | Resultado esperado | Estado | Captura |
|---|---|---|---|---|
| CA-01 (CP-17) | Agregar 4 unidades del SKU 0002. Presionar "Enviar pedido" | Mensaje "Pedido enviado. Su numero de confirmacion es PED-..." y el pedido aparece en "Mis pedidos enviados" del dashboard | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |
| CA-02 (CP-16) | Agregar 3 unidades del SKU 0001 (Q399.99). Presionar "Enviar pedido" | Mensaje "Le faltan Q0.01 para el minimo." y no se crea ningún pedido | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |
| CA-03 (CP-12) | Escribir 100 en la cantidad de cualquier producto disponible y presionar "Agregar" | Mensaje "La cantidad maxima es 99." y el producto no se agrega | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |
| CA-04 (CP-14) | Buscar un producto agotado (0003, 0006 o 0012) | Tiene la etiqueta "Agotado", no tiene botón de agregar y el total no cambia | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |
| CA-05 (CP-05) | Sin sesión, escribir la dirección de dashboard.html en el navegador | Redirige a login.html y no muestra datos del portal | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |

Pedidos creados en esta prueba (para borrarlos después): __________

## MAN-02 · Seguridad XSS (NFR-04a)

Datos de entrada: `<script>alert(1)</script>` y `<img src=x onerror=alert(1)>`.

| Campo | Pasos | Resultado esperado | Estado | Captura |
|---|---|---|---|---|
| Búsqueda por SKU (catalogo.html) | Escribir el texto y presionar "Buscar" | Se rechaza o se muestra como texto. No aparece ninguna alerta | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |
| Cantidad de un producto | Escribir el texto en la cantidad y presionar "Agregar" | Mensaje de que la cantidad debe ser un número. No aparece ninguna alerta | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |
| Filtro de precio Min y Max | Escribir el texto y presionar "Aplicar filtros" | El límite se ignora. No aparece ninguna alerta | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |
| Código y contraseña (login.html) | Escribir el texto en los dos campos y presionar "Entrar" | Mensaje "Codigo o contrasena incorrectos." sin ninguna alerta | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |

El historial de pedidos ya tiene una prueba automatizada contra XSS en tests/e2e/envio-pedido.spec.js, pero los campos de arriba no.

## MAN-03 · Seguridad RLS desde la consola (NFR-04b)

La prueba automatizada es tests/seguridad/rls.test.js (9 de 9 aprobadas el 12 de octubre de 2026). Esta prueba manual sirve para mostrarlo en vivo. Abrir el sitio publicado, iniciar sesión, abrir F12, pestaña Console, y pegar cada línea por separado. Funciona porque `supabaseClient` es una variable global de js/supabaseClient.js.

Se usa el mismo valor en el UPDATE para que, si RLS fallara, el dato real no cambie.

```js
await supabaseClient.from('productos').insert({ sku: '9999', nombre: 'Prueba', precio: 1, categoria: 'Prueba', agotado: false })
```

Esperado: `error` con código 42501 y el texto "new row violates row-level security policy for table productos".

```js
await supabaseClient.from('productos').update({ precio: 133.33 }).eq('sku', '0001').select()
```

Esperado: `data` es una lista vacía `[]`. Si devolviera la fila, RLS no estaría protegiendo y hay que avisar de inmediato.

| Intento | Estado | Captura |
|---|---|---|
| INSERT en productos | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |
| UPDATE en productos | ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado | |

No se propone un DELETE en vivo sobre productos o consejeras: si RLS fallara, se borraría un dato real. El DELETE ya está cubierto por SEG-07, SEG-08 y SEG-09, que usan una cabecera que deshace el cambio si llegara a tocar una fila.

## MAN-04 · Revisión visual y compatibilidad (NFR-06)

La prueba automatizada (tests/compat/compatibilidad.spec.js, 24 de 24) revisa que no haya errores de JavaScript, que la página no se salga de la pantalla y que se vean los elementos principales. No revisa si el diseño se ve bien.

Revisar index.html, login.html, catalogo.html y dashboard.html en cada combinación. Marcar en cada casilla Aprobado (A), Fallido (F) o No ejecutado (N).

| Navegador | 1920x1080 | 390x844 | Captura |
|---|---|---|---|
| Chrome | | | |
| Firefox | | | |
| Edge | | | |

Qué mirar: texto cortado, botones encimados, tablas que se salen de la pantalla, imágenes deformadas y que se pueda leer todo sin acercar.

## MAN-05 · Rendimiento (NFR-01)

Pasos: abrir F12, pestaña Network, marcar "Disable cache", cargar catalogo.html y mirar el tiempo hasta que aparecen los 16 productos.

Esperado: 2000 ms o menos. Tiempo medido: __________ ms.

Estado: ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado. Captura: __________

## MAN-06 · Fiabilidad (NFR-03)

Pasos: enviar 20 pedidos seguidos de Q400.00 (4 unidades del SKU 0002), anotando el número de cada uno. Al final contar los registros en la tabla pedidos.

Esperado: 20 pedidos, ninguno perdido ni repetido. Pedidos anotados: __________. Registros contados: __________.

Estado: ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado. Hay que borrar los 20 pedidos al terminar.

## MAN-07 · Usabilidad (NFR-02)

Pasos: pedir a una persona que no conozca el sitio que inicie sesión, agregue un producto y envíe un pedido de Q400.00, sin ayuda. Medir el tiempo y contar sus errores.

Esperado: 5 minutos o menos y máximo 1 error. Tiempo: __________. Errores: __________. Nombre de la persona: __________.

Estado: ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado

## MAN-08 · Tecla Enter en el login (defecto #2)

El defecto #2 no tiene prueba automatizada (ver docs/defensa-defectos.md).

Pasos: abrir login.html, escribir el código 3311 y su contraseña y presionar Enter, sin usar el ratón.

Esperado: inicia sesión y llega al dashboard.

Estado: ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado. Captura: __________

## MAN-09 · Despliegue y conexión a Supabase

1. En GitHub, pestaña Actions, abrir la última ejecución de "pages build and deployment" y comprobar que esté en verde. Captura: __________
2. En el sitio publicado abrir F12, pestaña Network, iniciar sesión y comprobar que aparecen llamadas a supabase.co. Captura: __________

Estado: ☐ Aprobado ☐ Fallido ☐ Bloqueado ☐ No ejecutado

## Pruebas de la mejora visual (Fase 4)

Estas pruebas solo aplican cuando la rama feature/hito2-fase4-visual esté fusionada en main. Esa rama agrega modo oscuro, una leyenda de ayuda y un botón para mostrar la contraseña en el login (js/tema.js y js/ver-clave.js), y tiene pruebas con Playwright en tests/e2e/tema.spec.js y login-ayuda.spec.js.

| Prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|
| Modo oscuro | Activar el modo oscuro en cada página y recargar | El modo se conserva y todo el texto se puede leer | ☐ Aprobado ☐ Fallido ☐ No ejecutado |
| Mostrar contraseña | En el login, escribir una contraseña y usar el botón de mostrar | Se ve el texto y el botón la vuelve a ocultar | ☐ Aprobado ☐ Fallido ☐ No ejecutado |
| Fotos del catálogo | Abrir el catálogo en escritorio y en celular | Los 16 productos tienen foto y las tarjetas tienen el mismo tamaño | ☐ Aprobado ☐ Fallido ☐ No ejecutado |
