# Registro de evolución de pruebas

Este registro muestra cómo fue creciendo la suite de pruebas del Portal de Consejeras. Los números salen de contar las pruebas en la carpeta tests/ de cada commit (git log) y de lo que reporta npm test. No son estimaciones.

## Resumen por etapa

| Etapa | Fecha y commit | Qué se agregó | Automatizadas | Manuales o sin ejecutar |
|---|---|---|---|---|
| Hito 1 | 8 ago 2026, 163ed49 (primer commit) | tests/pedido.test.js con 12 pruebas unitarias de RN-01, RN-02 y RN-03. RTM con 19 casos (CP-01 a CP-19) | 12 | 19 casos de la RTM, todos "No ejecutado" |
| Hito 3, matriz ágil | 30 ago 2026, 51cfe54 (PR #3) | tests/aceptacion/pedido.feature con 5 criterios BDD (CA-01 a CA-05) | 12 | 5 escenarios BDD, sin automatizar |
| Hito de Integración | 4 sep 2026, d1ed46a (PR #4, fusionado el 6 sep) | tests/integracion/flujo-pedido.test.js con 5 pruebas de integración (INT-01 a INT-05) | 17 (12 unitarias y 5 de integración) | Igual que antes |
| Filtro del catálogo (HU-09) | 4 sep 2026, d1ed46a (mismo commit) | tests/filtros.test.js con 11 pruebas unitarias (CP-20 a CP-30) | 28 | Igual que antes |
| Conexión a Supabase | 12 oct 2026, 2818ea8 (PR #28) | No se agregaron pruebas. Las 28 siguieron pasando | 28 | Igual que antes |
| Esta rama (feature/hito2-fase2-pruebas) | 12 oct 2026, a8ca083 y d884726 | 9 pruebas de seguridad RLS (SEG-01 a SEG-09) y 8 pruebas de extremo a extremo con Playwright para CP-02, CP-03, CP-04, CP-07 y CP-08 | 45 (28 en npm test, 9 de seguridad y 8 e2e) | 5 escenarios BDD y los casos de la RTM sin prueba de interfaz |

Las pruebas de integración y las 11 del filtro entraron en el mismo commit (d1ed46a), junto con la corrección del defecto de pedidos. En el documento del Hito de Integración aparecen como dos partes distintas, pero en git llegaron juntas.

## Cómo se corre cada grupo

| Grupo | Archivo | Cantidad | Comando | En el QA Gate |
|---|---|---|---|---|
| Unitarias de pedido | tests/pedido.test.js | 12 | npm test | Sí |
| Unitarias del filtro | tests/filtros.test.js | 11 | npm test | Sí |
| Integración | tests/integracion/flujo-pedido.test.js | 5 | npm test | Sí |
| Seguridad RLS | tests/seguridad/rls.test.js | 9 | npm run test:seguridad | No |
| Extremo a extremo | tests/e2e/login.spec.js y tests/e2e/busqueda-sku.spec.js | 8 | npm run test:e2e | No |
| Criterios BDD | tests/aceptacion/pedido.feature | 5 | Manual | No |

Las pruebas de seguridad y las e2e no están en el QA Gate a propósito. Necesitan internet (Supabase y el CDN de supabase-js) y, en el caso de las e2e, un navegador. Si estuvieran en el QA Gate, una caída de la red bloquearía la integración aunque el código estuviera bien. La prueba de seguridad además deja un pedido de prueba en la base cada vez que se corre.

## Resultados de la última ejecución

Todas se corrieron el 12 de octubre de 2026 en la computadora de Brandon Arreaga.

- npm test: 28 pruebas, 28 aprobadas, 0 fallidas.
- npm run test:seguridad: 9 pruebas, 9 aprobadas, 0 fallidas. Se creó el pedido de prueba PRUEBA-RLS-1791860157752. El detalle está en docs/prueba-seguridad-rls.md.
- npm run test:e2e: 8 pruebas, 7 aprobadas, 0 fallidas y 1 omitida. La omitida es la variante de CP-02 contra la base real, que solo corre si se le dan un código y una contraseña reales con las variables E2E_CODIGO y E2E_CLAVE. La otra variante de CP-02 sí corrió, pero con la respuesta de Supabase simulada por una consejera ficticia.
- Las primeras 28 pruebas también corren en el QA Gate de GitHub. El primer commit (163ed49) tuvo el QA Gate en rojo y se corrigió con a7bc0ab, que cambió la versión de Node. Desde ahí, los commits de main que revisamos (a7bc0ab, 51cfe54, d1ed46a y 2818ea8) tienen el QA Gate en verde.

## Casos que pasaron de manuales a automatizados

Antes de esta rama, estos casos de la RTM solo se podían probar a mano en el navegador. Ahora tienen una prueba con Playwright que abre el sitio en un servidor local, llena los campos y revisa lo que aparece en pantalla.

| Caso | Qué se prueba | Prueba automatizada | Observación |
|---|---|---|---|
| CP-02 | Login correcto | login.spec.js, dos variantes | La variante simulada corrió y pasó. La variante con la base real no se ha corrido |
| CP-03 | Contraseña incorrecta | login.spec.js, dos pruebas | Contra la base real: código 3311 con clave equivocada, y un código que no existe |
| CP-04 | Campos vacíos | login.spec.js, dos pruebas | Los dos vacíos, y solo el código lleno |
| CP-07 | SKU existente | busqueda-sku.spec.js | Busca 0004 en el catálogo real |
| CP-08 | SKU inexistente | busqueda-sku.spec.js | Busca XYZ999 y revisa el aviso |

También pasó de manual a automatizado el NFR-04b. En docs/nfr-04-actualizacion.md decía "manual, pendiente de ejecutar" y ahora se comprueba con tests/seguridad/rls.test.js.

Los casos CP-05, CP-06 y CP-09 a CP-17 tienen una prueba unitaria con su número desde el primer commit. Esas pruebas revisan las funciones de las reglas de negocio, no la pantalla. En dos casos la prueba no revisa lo mismo que dice la RTM. La prueba CP-06 revisa que un producto disponible se pueda agregar, pero la RTM dice que se vean 8 productos con 2 agotados marcados. La prueba CP-15 revisa el total con decimales, pero la RTM dice eliminar una línea y recalcular. Los casos CP-01, CP-18 y CP-19, la parte de pantalla de CP-06 y CP-15, y los 5 criterios BDD siguen siendo manuales.

## El defecto real y su resolución

Issue #1, "Los pedidos enviados no se conservan al reiniciar la aplicación". Severidad alta, historia HU-07.

- Qué pasaba: al enviar un pedido se generaba el número de confirmación y se vaciaba el pedido, pero no se guardaba en ningún lado. Al cerrar y volver a abrir la aplicación, el dashboard no mostraba ningún pedido.
- Corrección: commit d1ed46a del 4 de septiembre, dentro del PR #4, fusionado el 6 de septiembre. Se agregaron registrarPedidoEnviado() y obtenerPedidosEnviados() en js/sesion.js y la sección "Mis pedidos enviados" en el dashboard. El QA Gate pasó en ese commit.
- Pruebas que lo cubren desde entonces: INT-01, INT-03 e INT-05 en tests/integracion/flujo-pedido.test.js. Comprueban que el pedido queda registrado, que el historial tiene exactamente un pedido después de enviar y que el total guardado coincide con el calculado. Si el defecto vuelve, npm test y el QA Gate fallan.
- Lo que aprendimos: el issue se cerró el 30 de agosto, antes de que la corrección llegara al código. Un issue se debe cerrar solo cuando el PR con la corrección ya está fusionado.

El otro defecto registrado (issue #2, la tecla Enter en el login) se corrigió en el commit 51cfe54 (PR #3). Todavía no tiene prueba automatizada. Las nuevas pruebas de login con Playwright hacen clic en el botón, no prueban la tecla Enter.
