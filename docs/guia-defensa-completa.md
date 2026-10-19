# Guía de defensa completa

Todo lo que dice esta guía se puede comprobar en el repositorio. Lo que no se pudo comprobar está marcado como "No verificado". Los números salen de docs/evolucion-pruebas.md, docs/rtm-estado.md y de la ejecución de `npm test` y `npx eslint` sobre main el 18 de octubre de 2026.

## 1. La aplicación y su arquitectura

Qué es: un sitio donde una consejera inicia sesión, revisa el catálogo de 16 productos y arma su pedido del mes. Es estático (HTML, CSS, JavaScript y Bootstrap) y no tiene servidor propio.

Tres capas:

- Las páginas: index.html, login.html, catalogo.html y dashboard.html.
- La lógica en JavaScript. Las tres reglas de negocio están en js/pedido.js: RN-01 (el pedido mínimo es Q400.00), RN-02 (la cantidad es un entero de 1 a 99) y RN-03 (no se agregan productos agotados).
- Los datos en Supabase (cuatro tablas: consejeras, productos, pedidos y lineas_pedido). La sesión y el carrito siguen en localStorage.

Analogía: el sitio es una tienda con mostrador, y Supabase es la bodega. El mostrador (el navegador) atiende, pero lo que está en la bodega no se toca sin pasar por las reglas.

Hasta dónde llega la conexión a la base de datos: el login, el catálogo, el envío del pedido y el historial usan Supabase. Solo el carrito en curso y la sesión quedan en el navegador. Fuente: docs/arquitectura-actualizacion.md y js/sesion.js.

## 2. Seguridad: Row Level Security (RLS) y la llave publishable

Qué es RLS: reglas dentro de la base de datos que deciden qué puede hacer cada petición. Analogía: un guardia en la puerta de la bodega. Aunque tengas la dirección y la llave de visitante, solo te deja mirar y dejar pedidos.

Qué es la llave publishable: una llave pensada para estar en el navegador. Por sí sola no da permisos especiales. Sin RLS no protegería nada; con RLS es segura. La llave secreta (service role) se salta RLS y no está en el código.

Qué dice sql/politicas-rls.sql: RLS activado en las cuatro tablas. Solo lectura en consejeras y productos. Lectura y creación en pedidos y lineas_pedido. Sin políticas de UPDATE ni DELETE, así que la base de datos los rechaza.

Cómo se probó: tests/seguridad/rls.test.js, 9 pruebas (SEG-01 a SEG-09), con 9 de 9 aprobadas el 12 de octubre de 2026. Los UPDATE y DELETE responden 200 con lista vacía (0 filas) y la prueba vuelve a leer para confirmar que nada cambió. Se comprobó a mano que un INSERT en productos da el error 42501.

Por qué no se oculta la URL: sin backend propio, todo dato que el navegador necesita para conectarse le llega al usuario. Esconder la URL solo daría falsa seguridad.

Limitaciones que hay que decir antes de que las pregunten:

- El login es simulado: compara la contraseña en el navegador y no usa Supabase Auth.
- La base de datos no sabe qué consejera está conectada, así que cualquiera con la llave puede leer los pedidos de todas y crear un pedido a nombre de otra.
- La contraseña está en texto plano en la tabla consejeras y se puede leer con la llave publishable.

Además, la validación de entradas contra XSS (NFR-04a): el historial de pedidos tiene una prueba e2e que muestra un texto con una etiqueta `<img onerror>` como texto. Las demás entradas (búsqueda, cantidad, filtros y login) no se han probado a mano. No verificado.

## 3. Pruebas y su evolución

Tres niveles (pirámide de pruebas de Mike Cohn). Analogía de un carro: probar una pieza sola es una prueba unitaria; probar que el motor y la caja trabajan juntos es una de integración; manejar el carro completo es una prueba de extremo a extremo (E2E). Conviene tener muchas de las primeras, algunas de las segundas y pocas de las últimas, porque las de arriba son más lentas y frágiles.

| Grupo | Archivo | Cantidad | En el QA Gate |
|---|---|---|---|
| Unitarias de pedido | tests/pedido.test.js | 12 | Sí |
| Unitarias del filtro (CP-20 a CP-30) | tests/filtros.test.js | 11 | Sí |
| Integración | tests/integracion/flujo-pedido.test.js | 9 | Sí |
| Seguridad RLS | tests/seguridad/rls.test.js | 9 | No |
| E2E con Playwright | tests/e2e | 19 en main | No |
| Compatibilidad (NFR-06) | tests/compat | 4 pruebas en 6 combinaciones | No |

Resultado de `npm test` en main: 32 pruebas, 32 aprobadas, 0 fallidas. ESLint: 0 errores y 3 avisos de variables sin usar (exigirSesion y cerrarSesion en js/sesion.js, y supabaseClient en js/supabaseClient.js), que son funciones o variables que usan los archivos HTML.

Patrón AAA: cada prueba prepara los datos (Arrange), ejecuta (Act) y verifica (Assert).

Valores límite y partición de equivalencia: las reglas con números se prueban en los bordes. Para RN-01: Q399.99 no deja enviar y Q400.00 sí. Para RN-02: 0 y 100 se rechazan, 1 y 99 se aceptan. Analogía: si el cupo de un salón es 30, se prueba con 29, 30 y 31 personas, no con 5.

Por qué las pruebas e2e, de seguridad y de compatibilidad no están en el QA Gate: necesitan internet y un navegador. Si estuvieran, una caída de la red bloquearía un PR aunque el código estuviera bien. Esta decisión está en docs/evolucion-pruebas.md.

La evolución con números: 12 unitarias en el Hito 1, 17 al agregar las de integración, 28 con las del filtro, 32 en `npm test` al pasar los pedidos a Supabase, y 84 en total contando seguridad, E2E y compatibilidad (docs/evolucion-pruebas.md).

Trazabilidad: la RTM (matriz de trazabilidad de requisitos) tiene 19 casos y el nombre de cada prueba lleva el ID del caso (por ejemplo "CP-17 | sí deja enviar con Q400.00 exactos"). Según docs/rtm-estado.md los 19 están aprobados, más los 11 del filtro. Se aplicó la regla de que un caso solo se marca como aprobado si una prueba lo ejecutó de verdad.

Cuadrantes ágiles: Q1 (técnico, apoya al equipo) son las pruebas unitarias; Q2 (negocio, apoya al equipo) son los 5 criterios BDD en tests/aceptacion/pedido.feature, que se ejecutan a mano. Q3 y Q4 (exploratorias, rendimiento y seguridad) quedaron fuera del Hito 3, y el rendimiento sigue sin ejecutarse.

Qué quedó sin ejecutar: los 5 criterios BDD, la revisión visual del diseño y los NFR-01 (rendimiento), NFR-02 (usabilidad) y NFR-03 (fiabilidad). Ver docs/guia-pruebas-manuales.md. No verificado: el resultado de estas pruebas manuales.

## 4. Automatización de una prueba manual

Ejemplo para mostrar: CP-17 (enviar con Q400.00 exactos). Empezó como caso manual en la RTM. Hoy tiene una prueba unitaria (npm test) y una prueba e2e en tests/e2e/envio-pedido.spec.js que abre el sitio en un servidor local, arma el carrito, presiona "Enviar pedido" y revisa el número de confirmación. Esa prueba e2e simula la respuesta de Supabase con page.route, así que no escribe en la base real. La versión contra la base real se hizo a mano: el pedido PED-2026-8675 de Q400.00 quedó registrado.

Otros casos automatizados: CP-02, CP-03, CP-04, CP-07, CP-08 (login y búsqueda), CP-01, CP-05, CP-06, CP-15, CP-16 y CP-19 (casos-rtm.spec.js) y CP-18 (doble clic).

Por qué automatizar: la prueba corre sola cada vez, sin depender de una persona, y deja evidencia repetible. Por qué no todo: hay cosas que solo una persona puede juzgar, como si el diseño se ve bien.

## 5. Reporte de defectos

Defecto del issue #1, "Los pedidos enviados no se conservan al reiniciar la aplicación". Severidad alta, historia HU-07. Se generaba el número de confirmación y se vaciaba el pedido, pero no se guardaba. Corregido en el commit d1ed46a (PR #4) con registrarPedidoEnviado() y obtenerPedidosEnviados(). Cubierto desde entonces por INT-01, INT-03 e INT-05. Lo que se aprendió: el issue se cerró el 30 de agosto, antes de que la corrección llegara al código el 4 de septiembre; un defecto solo se cierra cuando el PR con la corrección ya está fusionado.

Defecto del issue #2, la tecla Enter no enviaba el login (severidad media, HU-02). Corregido en 51cfe54 (PR #3, "corrige #2"). Sin prueba automatizada. Detalles y fechas en docs/defensa-defectos.md.

Comprobar los issues en github.com/Barreaga/portal-consejeras/issues antes de la defensa: no pude abrir GitHub desde aquí, así que el estado de los issues es lo que dicen los documentos del repositorio. No verificado.

## 6. Pipeline: el QA Gate

Qué es: una revisión automática (GitHub Actions) que corre en cada PR y bloquea el merge si falla. Analogía: la revisión de seguridad de un aeropuerto, a la que nadie se salta.

Qué revisa (.github/workflows/qa-gate.yml): ESLint con `--max-warnings 10` y `npm test`. Usa Node 22. La rama main está protegida: PR, una aprobación y QA Gate en verde (según el traspaso del proyecto; la configuración de la protección está en GitHub y no la verifiqué).

Anécdota: con Node 20 los patrones glob de `node --test` fallaron y el primer commit (163ed49) tuvo el QA Gate en rojo. El commit a7bc0ab lo corrigió subiendo a Node 22.

## 7. Trabajo en equipo

Hecho: los PRs se revisan y aprueban por otra persona (regla del README: nadie aprueba su propio código). El Hito 2 lo ejecutó Brandon Arreaga casi completo; Juan Carlos Vásquez y Juan Francisco Arriola revisaron y aprobaron los PRs. Decirlo tal cual y no afirmar más.

## 8. Cinco preguntas probables

1. ¿Por qué no usaron un backend?
   Para dedicar el tiempo a las pruebas. Supabase permite proteger los datos con RLS sin programar un servidor.

2. ¿El login es seguro?
   No. Es simulado y está declarado como limitación. RLS impide que alguien modifique o borre datos, pero la contraseña está en texto plano y se puede leer con la llave publishable. Para cerrarlo se necesita Supabase Auth.

3. ¿Qué pruebas automatizaron?
   32 pruebas unitarias y de integración en `npm test` (corren en el QA Gate), 9 de seguridad RLS, 19 E2E con Playwright y 24 de compatibilidad (4 pruebas en 6 combinaciones). Las tres últimas corren con comandos aparte.

4. ¿Qué no probaron?
   Carga y volumen, por falta de infraestructura. Y lo que sigue sin ejecutarse: los 5 criterios BDD, la revisión visual, y los NFR-01, NFR-02 y NFR-03.

5. ¿Si la llave está visible, no pueden borrarles los datos?
   No con esa llave. Intentar borrar o modificar productos, consejeras o pedidos devuelve 0 filas afectadas, y se probó (9 de 9). Lo que sí puede hacer cualquiera con la llave es leer todo y crear pedidos falsos: es una limitación declarada.

## 9. Conceptos para explicar con sus propias palabras

- ISO/IEC 25010: lista de características de calidad. Los 6 NFR se clasifican en eficiencia, usabilidad, fiabilidad, seguridad, mantenibilidad y compatibilidad.
- BDD (Dado, Cuando, Entonces): escenarios en lenguaje de negocio que cualquiera puede leer.
- RACI: quién es Responsable, quién Aprueba, a quién se Consulta y a quién se Informa. Solo una A por actividad.
- Trazabilidad: poder ir de un requisito a su caso de prueba y de ahí al código.
