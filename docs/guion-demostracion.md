# Guion de la demostración en vivo

Dura unos 10 minutos. Está ajustado a lo que hay en la rama main el 18 de octubre de 2026. Antes de usarlo hay que ejecutar la lista de preparación.

## Preparación (el día anterior y 15 minutos antes)

1. Tener la contraseña de la consejera 3311 a la mano. No está en el repositorio.
2. Abrir el sitio publicado (GitHub Pages) en una ventana limpia, sin sesión iniciada, y con la consola F12 cerrada.
3. Abrir en otras pestañas: el panel de Supabase con las 4 tablas, la pestaña Actions de GitHub con un PR con el QA Gate en verde, y la terminal en la carpeta del proyecto.
4. Correr `npm test` una vez antes para ver que dé 32 de 32. Si algo falla, no improvisar: decirlo.
5. Revisar en la tabla pedidos que no queden pedidos de prueba de ensayos anteriores (por ejemplo los que empiezan con PRUEBA-RLS-) y borrarlos.
6. Tener una segunda forma de mostrar el sitio por si falla internet: capturas de pantalla de cada paso.

Nota sobre la Fase 4: si el PR de feature/hito2-fase4-visual todavía no está fusionado, el sitio publicado no tiene las fotos, el modo oscuro ni el botón para mostrar la contraseña. En ese caso no mencionarlos.

## 1. Arquitectura (1 minuto)

Qué decir: el sitio es estático, con tres capas. Las páginas (index, login, catálogo y dashboard), la lógica en JavaScript (las reglas RN-01, RN-02 y RN-03 están en js/pedido.js) y los datos en Supabase (consejeras, productos, pedidos y lineas_pedido). No hay servidor propio. El carrito y la sesión siguen en localStorage.

Qué mostrar: el panel de Supabase con las 4 tablas.

## 2. Sitio publicado y conexión a la base de datos (3 minutos)

1. Abrir F12, pestaña Network, y recargar login.html.
2. Iniciar sesión con la consejera 3311. Mostrar en Network las llamadas a supabase.co. Decir que el login está simulado a propósito y que es una limitación declarada.
3. En el catálogo mostrar los 16 productos cargados desde Supabase y los agotados con la etiqueta "Agotado" y sin botón (RN-03).
4. Escribir 100 en la cantidad y presionar "Agregar": sale "La cantidad maxima es 99." (RN-02).
5. Agregar 3 unidades del SKU 0001 y presionar "Enviar pedido": sale "Le faltan Q0.01 para el minimo." (RN-01, Q399.99).
6. Quitar la línea del SKU 0001 con el botón "Quitar", agregar 4 unidades del SKU 0002 (4 x Q100.00 = Q400.00 exactos) y presionar "Enviar pedido". Mostrar el número de confirmación.
7. Ir al dashboard y mostrar el pedido en "Mis pedidos enviados". Mostrar la fila nueva en la tabla pedidos de Supabase.

Honestidad: decir que login, catálogo, envío de pedidos e historial usan Supabase. Anotar el número del pedido para borrarlo después.

## 3. Pipeline (1 minuto)

Qué mostrar: un PR con el QA Gate en verde en la pestaña Actions.

Qué decir: el QA Gate corre ESLint y `npm test` en cada PR y bloquea el merge si falla. La anécdota real: con Node 20 los patrones glob de `node --test` fallaron y el primer commit (163ed49) salió en rojo. Se corrigió con a7bc0ab, que subió el flujo a Node 22 (ver docs/evolucion-pruebas.md).

## 4. Pruebas (2 minutos)

1. En la terminal correr `npm test` y mostrar que pasan 32 de 32: 12 unitarias de pedido, 11 del filtro y 9 de integración.
2. Abrir docs/evolucion-pruebas.md y mostrar cómo creció la suite: 12 en el Hito 1, 17 con las de integración, 28 con las del filtro y más con las pruebas de seguridad, e2e y compatibilidad.
3. Mostrar la RTM (Parte 3 del Word y docs/rtm-estado.md): 19 de 19 casos aprobados.
4. Para la automatización de una prueba manual: mostrar CP-17 (enviar con Q400.00). Empezó como caso manual de la RTM y hoy tiene una prueba unitaria (npm test) y una e2e con Playwright en tests/e2e/envio-pedido.spec.js. Si hay tiempo y red, correr `npm run test:e2e` en la terminal.

Qué decir: automatizar sirve porque la prueba corre sola en cada PR y no depende de que una persona se acuerde de hacerla.

## 5. Defecto real (1 minuto)

Mostrar el issue #1 en GitHub: los pedidos enviados no se conservaban al reiniciar la aplicación (severidad alta, HU-07). Explicar la causa, la corrección (registrarPedidoEnviado() y obtenerPedidosEnviados() en el commit d1ed46a, PR #4) y las pruebas que lo cubren desde entonces (INT-01, INT-03 e INT-05). Mencionar lo que se aprendió: el issue se cerró antes de que la corrección llegara a main. Si piden otro defecto, el issue #2 (tecla Enter en el login). Ver docs/defensa-defectos.md.

## 6. Prueba de seguridad en la consola (1 minuto)

Con la sesión iniciada, abrir F12, pestaña Console, y pegar estas líneas (están también en docs/guia-pruebas-manuales.md, MAN-03):

```js
await supabaseClient.from('productos').insert({ sku: '9999', nombre: 'Prueba', precio: 1, categoria: 'Prueba', agotado: false })
```

Esperado: error 42501, "new row violates row-level security policy".

```js
await supabaseClient.from('productos').update({ precio: 133.33 }).eq('sku', '0001').select()
```

Esperado: `data` es `[]`. El valor es el mismo que ya tiene el producto, así que no daña nada si algo saliera mal.

Qué decir: "No ocultamos la URL porque no tenemos backend propio. La URL y la llave publishable son visibles a propósito. Lo que protege los datos es Row Level Security, y esta prueba lo demuestra." Mostrar también el resultado de `npm run test:seguridad` (9 de 9 el 12 de octubre de 2026) si hay red, sabiendo que deja un pedido de prueba que hay que borrar.

El proyecto no usa Angular. Si lo preguntan, decirlo directamente.

## 7. Limitaciones declaradas (30 segundos)

- El login es simulado: compara la contraseña en el navegador y no usa Supabase Auth.
- La contraseña está en texto plano en la tabla consejeras y la llave publishable puede leerla. RLS protege la integridad de los datos, no la confidencialidad.
- Cualquiera con la llave publishable puede leer los pedidos de todas las consejeras y crear un pedido a nombre de otra.
- No hay pruebas de carga ni de volumen.
- Las pruebas e2e, de seguridad y de compatibilidad no corren en el QA Gate, porque necesitan internet y navegador.
- Los 5 criterios BDD y la revisión visual se hacen a mano.

## Al terminar

Borrar de Supabase los pedidos creados durante la demostración y anotar cuáles fueron.
