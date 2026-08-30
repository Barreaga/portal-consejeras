# Portal de Consejeras

Proyecto académico del curso de calidad de software.

> Todos los datos, productos y precios son inventados.

## Qué es

Un sitio web donde una consejera inicia sesión, revisa el catálogo y arma su pedido del mes.

Está hecho solo con HTML, CSS y JavaScript. No tiene servidor ni base de datos: los productos están en un archivo y la sesión se guarda en el navegador.

## Cómo verlo

Abrir el archivo `index.html` con doble clic. No hay que instalar nada.

## Cómo correr las pruebas

Para esto sí hace falta tener Node.js instalado.

```
npm install
npm test
```

Si todo está bien, aparece que las 12 pruebas pasaron.

Para revisar el código con el linter:

```
npm run lint
```

Para correr las dos cosas juntas (esto es el QA Gate):

```
npm run qa
```

**Antes de subir cambios a GitHub, correr `npm run qa`.** Si falla aquí, también va a fallar allá.

## Reglas de negocio

| ID | Regla | Dónde está |
|---|---|---|
| RN-01 | El pedido debe llegar a Q400 para enviarse | `js/pedido.js` → `puedeEnviarse()` |
| RN-02 | La cantidad debe ser un entero entre 1 y 99 | `js/pedido.js` → `validarCantidad()` |
| RN-03 | Los productos agotados no se pueden agregar | `js/pedido.js` → `validarDisponible()` |

## Matriz de pruebas ágiles (Hito 3)

Las pruebas están clasificadas por cuadrantes ágiles en `docs/matriz-pruebas-agiles.md`:

- **Q1** — 12 pruebas unitarias automatizadas en `tests/pedido.test.js`
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
│   ├── productos.js    Lista de productos de prueba
│   ├── login.js        Inicio de sesión
│   ├── sesion.js       Sesión y registro de pedidos
│   ├── dashboard.js    Resumen del pedido
│   └── catalogo.js     Catálogo, pedido y envío
├── tests/
│   ├── pedido.test.js  Pruebas unitarias (Q1)
│   └── aceptacion/     Criterios BDD (Q2)
├── docs/
│   └── matriz-pruebas-agiles.md
├── eslint.config.js    Configuración del linter
└── .github/workflows/  El QA Gate
```

## Dónde quedan registrados los pedidos

Al enviar un pedido queda guardado en el navegador, en `localStorage`, bajo la clave `pedidos-enviados`.

Se puede ver de dos formas:

1. **En el dashboard**, en la sección "Mis pedidos enviados".
2. **En el navegador:** F12 → pestaña *Application* → *Local Storage* → el sitio → clave `pedidos-enviados`.

Cada registro guarda el número de pedido, la consejera, la fecha, los productos y el total.

## Limitación conocida

El login es simulado. Como no hay servidor, la sesión se guarda en el navegador y se podría modificar desde las herramientas de desarrollador. Está documentado como riesgo aceptado en el Test Plan.

## Cómo trabajamos

1. Crear una rama: `git checkout -b feature/lo-que-voy-a-hacer`
2. Hacer los cambios.
3. Correr `npm run qa`.
4. Subir y abrir un Pull Request.
5. Que otro compañero lo revise. **Nadie aprueba su propio código.**
