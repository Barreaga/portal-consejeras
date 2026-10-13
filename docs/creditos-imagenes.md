# Créditos de imágenes

## Ilustraciones de los productos

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

## Fotos de las páginas

Las fotos de la página de inicio, del login, del dashboard y del catálogo están en `img/fotos/`. Todas son de StockSnap (stocksnap.io) con licencia CC0 1.0 (dominio público): se pueden usar, modificar y publicar sin pedir permiso y sin obligación de dar crédito. Igual dejamos el autor y el enlace de cada una. Se descargaron en la versión de 960 píxeles de ancho que ofrece el sitio y se guardaron como JPG optimizado. Se descartaron las fotos donde se veía una marca real (por ejemplo, perfumes y labiales con logotipo).

| Archivo | Dónde se usa | Autor | Enlace |
|---|---|---|---|
| img/fotos/inicio-banner.jpg | Banner de la página de inicio | Authentic Stock | https://stocksnap.io/photo/woman-skin-HIZNJOUVSY |
| img/fotos/login-modelo.jpg | Foto del login (solo en pantallas grandes) | Authentic Stock | https://stocksnap.io/photo/beauty-skincare-U5MEPX1OVV |
| img/fotos/dashboard-campana.jpg | Banner "Campana del mes" del dashboard | Authentic Stock | https://stocksnap.io/photo/woman-skin-JF6DZWDDO3 |
| img/fotos/catalogo-banner.jpg | Banner del catálogo | Alexandre Vanier | https://stocksnap.io/photo/beauty-makeup-34MSYVUYS0 |
| img/fotos/categoria-piel.jpg | Categoría Cuidado de la piel | Authentic Stock | https://stocksnap.io/photo/beauty-skincare-CC9TYE8VJY |
| img/fotos/categoria-maquillaje.jpg | Categoría Maquillaje | Beauty and Fashion | https://stocksnap.io/photo/beauty-makeup-MKGGIJ360Q |
| img/fotos/categoria-fragancias.jpg | Categoría Fragancias | Ahmed Aqtai | https://stocksnap.io/photo/bottle-perfume-CV6AI5T3K5 |
| img/fotos/categoria-cabello.jpg | Categoría Cabello | Alex Suprun | https://stocksnap.io/photo/woman-girl-4BG0M37XLV |
| img/fotos/categoria-limpieza.jpg | Categoría Limpieza | Burst | https://stocksnap.io/photo/simple-home-UQOXY4POK8 |
| img/fotos/categoria-masculino.jpg | Categoría Cuidado masculino | Direct Media | https://stocksnap.io/photo/man-shaving-BFASQPNDEK |
| img/fotos/vende-con-nosotros.jpg | Sección "Vende con nosotros" del inicio | Bruce Mars | https://stocksnap.io/photo/woman-mobile-Q93BUD2Z3Z |

Los testimonios de la página de inicio son ficticios, igual que los productos y los precios. Usan iniciales en lugar de fotos de personas, y el pie de página lo aclara.

## Cómo cambiar las ilustraciones de los productos por fotos

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
