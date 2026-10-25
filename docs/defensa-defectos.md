# Guion para la defensa: registro de defectos

Todo lo que dice este guion se puede comprobar en los issues del repositorio (github.com/Barreaga/portal-consejeras/issues) y en el historial de git.

## 1. Cómo registramos un defecto

Cada defecto se abre como un issue en GitHub con la misma estructura: severidad, historia afectada, pasos para reproducir, resultado esperado, resultado obtenido, causa y corrección. El issue se mueve por el tablero (Por hacer, En progreso, En revisión, Terminado) y la corrección entra a main por un Pull Request. En los dos defectos el QA Gate pasó en el commit de la corrección.

Registramos dos defectos: el issue #1 y el issue #2.

## 2. Defecto del issue #1: los pedidos enviados no se conservan al reiniciar

- Severidad: Alta. Historia afectada: HU-07.
- Cómo se reproduce: iniciar sesión, armar un pedido de más de Q400, enviarlo, cerrar y volver a abrir la aplicación y entrar al dashboard.
- Esperado: el pedido aparece en el historial de la consejera.
- Obtenido: no aparece ningún pedido. El número de confirmación se generaba, pero el pedido no se guardaba.
- Causa: la función de envío generaba el número y vaciaba el pedido, pero no lo guardaba en localStorage.
- Corrección: se agregaron las funciones registrarPedidoEnviado() y obtenerPedidosEnviados() en js/sesion.js, y la sección "Mis pedidos enviados" en el dashboard. Entró con el commit d1ed46a (4 de septiembre), dentro del PR #4, que se fusionó el 6 de septiembre.

Lo que tenemos que reconocer: el issue #1 se cerró el 30 de agosto, pero la corrección llegó al código hasta el commit d1ed46a del 4 de septiembre. La descripción del PR #4 lo dice: el historial "nunca había quedado completo en el código". Además, el commit lo nombra "Defecto #3" y los comentarios del código dicen "Defecto #1". Lo que aprendimos es que un defecto solo se cierra cuando el PR con la corrección ya está fusionado en main, y que en el commit hay que usar el número del issue.

## 3. Defecto del issue #2: la tecla Enter no envía el login

- Severidad: Media. Historia afectada: HU-02.
- Cómo se detectó: con la técnica de estimación de errores (pensar dónde es probable que el sistema falle), no por una prueba automatizada.
- Cómo se reproduce: abrir login.html, escribir el código y la contraseña y presionar Enter.
- Esperado: inicia sesión igual que al presionar el botón.
- Obtenido: no pasa nada, la consejera tiene que usar el ratón.
- Causa: solo estaba registrado el evento click del botón, y los campos no están dentro de un formulario, así que el navegador tampoco envía por su cuenta.
- Corrección: se agregó la función entrarConEnter() con el evento keydown en los dos campos de js/login.js. Entró con el commit 51cfe54, cuyo mensaje dice "corrige #2", dentro del PR #3, fusionado el 30 de agosto. El issue se cerró el 5 de septiembre.

## 4. Cómo se relacionan con los cuadrantes Q1 y Q2

Q1 (pruebas técnicas que apoyan al equipo):

- Defecto #1. Después de la corrección se agregaron pruebas de integración en tests/integracion/flujo-pedido.test.js. INT-01 comprueba que un pedido válido queda registrado, INT-03 que después de enviar el historial tiene exactamente un pedido e INT-05 que el total guardado coincide con el calculado. Corren en el QA Gate con npm test, así que si el defecto vuelve a aparecer, el pipeline falla. Estas pruebas son de integración, no unitarias, por eso no están en la tabla de 23 pruebas unitarias de la matriz.
- Defecto #2. No tiene prueba automatizada. login.js depende de la página y del navegador, y nuestras pruebas con Node solo cubren funciones que no usan el DOM. Es un hueco que reconocemos.

Q2 (pruebas de negocio que apoyan al equipo):

- Defecto #1. El criterio CA-01 de tests/aceptacion/pedido.feature dice que al enviar un pedido de Q400 "el sistema registra el pedido". El defecto es justo un caso en que eso no se cumplía después de reiniciar. Los escenarios BDD todavía no están automatizados (issue #10, ejecutar a mano los 5 criterios BDD, sigue abierto).
- Defecto #2. Ninguno de los criterios CA-01 a CA-05 cubre el uso de la tecla Enter. Se detectó con una técnica exploratoria, que está más cerca de Q3.

## 5. Cierre

Los dos defectos siguieron el mismo camino: issue con pasos para reproducir, corrección en una rama, Pull Request y QA Gate en verde (comprobado en GitHub para los commits 51cfe54 y d1ed46a). El defecto #1 dejó pruebas automáticas que evitan que vuelva a pasar. El defecto #2 quedó corregido, pero solo se puede comprobar a mano.

## 6. Hallazgo posterior: la tecla Enter en el catálogo

Se detectó el 25 de octubre de 2026, al ensayar la presentación, con el sitio publicado. No tiene issue propio: es el mismo problema del issue #2, ahora en otra página.

- Severidad: Media. Historia afectada: HU-04 (buscar por SKU) y HU-09 (filtros).
- Cómo se reproduce: en catalogo.html escribir un SKU en la búsqueda, o un precio en los filtros, y presionar Enter.
- Esperado: hace lo mismo que el botón.
- Obtenido: no pasa nada. Solo funcionaba con el clic en "Buscar" o en "Aplicar filtros".
- Causa: js/catalogo.js solo tenía eventos click en los botones. El login ya tenía el evento keydown desde la corrección del issue #2, pero el catálogo no.
- Corrección: las funciones buscarConEnter() y filtrarConEnter() en js/catalogo.js, con el evento keydown en el campo de búsqueda y en los dos campos de precio.
- Prueba: tests/e2e/enter-catalogo.spec.js, 4 pruebas. Antes del arreglo las 4 fallaban (la lista seguía con los 16 productos) y después pasan. A diferencia del issue #2, este defecto sí quedó con prueba automatizada.

Lo que se aprendió: al corregir un defecto de una página hay que revisar si las demás páginas tienen el mismo problema. El del Enter se corrigió en el login y no se revisó el catálogo.
