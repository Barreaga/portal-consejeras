# Créditos de imágenes

## Imágenes actuales

Las imágenes de los productos son ilustraciones en formato SVG creadas para este proyecto. Están en `img/productos/` y su nombre es el SKU del producto (por ejemplo `0004.svg` es el Set de Labiales). No se usó ninguna imagen de terceros ni enlaces a imágenes de otros sitios, así que no hay derechos reservados de por medio.

`img/productos/sin-imagen.svg` es la imagen que aparece si un producto nuevo de la base de datos todavía no tiene imagen.

| SKU | Producto | Archivo | Origen |
|---|---|---|---|
| 0001 | Crema Hidratante | img/productos/0001.svg | Ilustración creada para el proyecto |
| 0002 | Locion Corporal | img/productos/0002.svg | Ilustración creada para el proyecto |
| 0003 | Perfume Floral | img/productos/0003.svg | Ilustración creada para el proyecto |
| 0004 | Set de Labiales | img/productos/0004.svg | Ilustración creada para el proyecto |
| 0005 | Shampoo Reparador | img/productos/0005.svg | Ilustración creada para el proyecto |
| 0006 | Mascarilla Facial | img/productos/0006.svg | Ilustración creada para el proyecto |
| 0007 | Base de Maquillaje | img/productos/0007.svg | Ilustración creada para el proyecto |
| 0008 | Kit de Brochas | img/productos/0008.svg | Ilustración creada para el proyecto |
| 0009 | Desinfectante Multiusos | img/productos/0009.svg | Ilustración creada para el proyecto |
| 0010 | Cloro Concentrado | img/productos/0010.svg | Ilustración creada para el proyecto |
| 0011 | Jabon Liquido para Trastes | img/productos/0011.svg | Ilustración creada para el proyecto |
| 0012 | Aromatizante de Ambiente | img/productos/0012.svg | Ilustración creada para el proyecto |
| 0013 | Locion 212 Hombre | img/productos/0013.svg | Ilustración creada para el proyecto |
| 0014 | Gel para Cabello | img/productos/0014.svg | Ilustración creada para el proyecto |
| 0015 | Desodorante en Barra | img/productos/0015.svg | Ilustración creada para el proyecto |
| 0016 | Kit de Afeitado | img/productos/0016.svg | Ilustración creada para el proyecto |

## Cómo cambiarlas por fotos reales

1. Buscar las fotos en un banco con licencia libre: Unsplash (unsplash.com/license) o Pexels (pexels.com/license). Las dos permiten usarlas gratis sin pedir permiso. No usar fotos de marcas reales ni de tiendas en línea.
2. Recortarlas en proporción 5:4 (por ejemplo 500 x 400 píxeles) y guardarlas en `img/productos/` como `.jpg` con el SKU como nombre: `0001.jpg`, `0002.jpg`, etc.
3. En `js/catalogo.js`, cambiar la constante `FORMATO_IMAGEN` de `'.svg'` a `'.jpg'`. Si falta alguna foto, el catálogo muestra `sin-imagen.svg` en su lugar.
4. Llenar esta tabla con el autor y el enlace de cada foto:

| SKU | Autor | Enlace a la foto | Licencia |
|---|---|---|---|
| 0001 | | | |
| 0002 | | | |
| 0003 | | | |
| 0004 | | | |
| 0005 | | | |
| 0006 | | | |
| 0007 | | | |
| 0008 | | | |
| 0009 | | | |
| 0010 | | | |
| 0011 | | | |
| 0012 | | | |
| 0013 | | | |
| 0014 | | | |
| 0015 | | | |
| 0016 | | | |
