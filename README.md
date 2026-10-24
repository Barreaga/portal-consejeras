# Portal de Consejeras

Proyecto académico del curso de calidad de software.

> Todos los datos, productos y precios son inventados.

## Qué es

Un sitio web donde una consejera inicia sesión, revisa el catálogo y arma su pedido del mes.

Está hecho con HTML, CSS, JavaScript y Bootstrap. No tiene servidor propio: se conecta directo a una base de datos en Supabase, que guarda las consejeras, los productos y los pedidos enviados. La sesión y el pedido que se está armando se guardan en el navegador.

## Cómo verlo

Abrir el archivo `index.html` con doble clic. No hay que instalar nada, pero hace falta internet porque el catálogo y el inicio de sesión se leen de Supabase.

## Cómo correr las pruebas

Para esto sí hace falta tener Node.js instalado.

```
npm install
npm test
```

Si todo está bien, aparece que las 32 pruebas pasaron (unitarias y de integración).

Para revisar el código con el linter:

```
npm run lint
```

Para correr las dos cosas juntas (esto es el QA Gate):

```
npm run qa
```

**Antes de subir cambios a GitHub, correr `npm run qa`.** Si falla aquí, también va a fallar allá.

Hay más pruebas que no están en el QA Gate porque necesitan internet y un navegador:

```
npm run test:seguridad   Prueba de RLS contra Supabase (deja un pedido de prueba en la base)
npm run test:e2e         Pruebas de pantalla con Playwright
npm run test:compat      Compatibilidad en Chrome, Firefox y Edge
```

## Pruebas con Robot Framework

Los casos CP-03 y CP-04 del login (antes manuales) también están en Robot Framework, en `tests/robot/`. Hace falta Python.

```
pip install robotframework robotframework-seleniumlibrary
python -m http.server 8000
```

Con el sitio levantado, en otra terminal:

```
robot --outputdir resultados tests/robot
```

El reporte queda en `resultados/report.html` y el detalle paso a paso en `resultados/log.html`.

## Reglas de negocio

| ID | Regla | Dónde está |
|---|---|---|
| RN-01 | El pedido debe llegar a Q400 para enviarse | `js/pedido.js` → `puedeEnviarse()` |
| RN-02 | La cantidad debe ser un entero entre 1 y 99 | `js/pedido.js` → `validarCantidad()` |
| RN-03 | Los productos agotados no se pueden agregar | `js/pedido.js` → `validarDisponible()` |

## Matriz de pruebas ágiles (Hito 3)

Las pruebas están clasificadas por cuadrantes ágiles en `docs/matriz-pruebas-agiles.md`:

- **Q1** — 12 pruebas unitarias de pedido en `tests/pedido.test.js` y 11 del filtro en `tests/filtros.test.js`
- **Q2** — 5 criterios de aceptación en BDD en `tests/aceptacion/pedido.feature`

Los defectos se registran en el tablero Kanban del repositorio (pestaña Proyectos).

## Trazabilidad

Cada prueba tiene el ID del caso de la RTM en su nombre:

```
CP-17 | si deja enviar con Q400.00 exactos
```

Así se puede ir de la matriz al código y del código a la matriz.

## Archivos

```
├── index.html          Landing page (HU-01)
├── login.html          Inicio de sesión (HU-02)
├── dashboard.html      Panel interno (HU-03)
├── catalogo.html       Catálogo y pedido (HU-04 a HU-07)
├── css/estilo.css      Estilos
├── js/
│   ├── pedido.js       Las tres reglas de negocio
│   ├── productos.js    Lectura del catálogo desde Supabase
│   ├── supabaseClient.js  Conexión a Supabase
│   ├── filtros.js      Filtro y orden del catálogo
│   ├── login.js        Inicio de sesión
│   ├── sesion.js       Sesión y registro de pedidos
│   ├── dashboard.js    Resumen del pedido
│   └── catalogo.js     Catálogo, pedido y envío
├── tests/
│   ├── pedido.test.js  Pruebas unitarias (Q1)
│   ├── filtros.test.js Pruebas unitarias del filtro
│   ├── integracion/    Pruebas de integración del pedido
│   ├── seguridad/      Prueba de RLS contra Supabase
│   ├── e2e/            Pruebas con Playwright
│   ├── compat/         Compatibilidad en Chrome, Firefox y Edge
│   ├── robot/          Casos de login en Robot Framework
│   └── aceptacion/     Criterios BDD (Q2)
├── docs/               Matriz de pruebas, RTM, arquitectura y guías
├── sql/                Políticas RLS y función registrar_pedido
├── eslint.config.js    Configuración del linter
└── .github/workflows/  El QA Gate
```

## Dónde quedan registrados los pedidos

Al enviar un pedido se guarda en Supabase, en las tablas `pedidos` y `lineas_pedido`, con la función `registrar_pedido` (ver `sql/registrar-pedido.sql`). Se puede ver en el dashboard, en la sección "Mis pedidos enviados".

El pedido que se está armando (el carrito) sigue en el navegador, en `localStorage`, bajo la clave `pedido`.

## Limitación conocida

El login es simulado. Como no hay servidor, la sesión se guarda en el navegador y se podría modificar desde las herramientas de desarrollador. Está documentado como riesgo aceptado en el Test Plan.

## Cómo trabajamos

1. Crear una rama: `git checkout -b feature/lo-que-voy-a-hacer`
2. Hacer los cambios.
3. Correr `npm run qa`.
4. Subir y abrir un Pull Request.
5. Que otro compañero lo revise. **Nadie aprueba su propio código.**
