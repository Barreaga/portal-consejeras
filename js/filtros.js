// filtros.js
// HU-09: filtrar el catalogo por categoria, rango de precio y ordenarlo.
// Se separa del DOM (igual que pedido.js) para poder probarlo sin navegador.

// Filtra la lista de productos segun categoria y rango de precio,
// y la ordena si se pidio un orden.
// "opciones" puede traer: categoria, precioMin, precioMax, orden
function filtrarProductos(productos, opciones) {
  if (!productos) {
    return [];
  }

  const filtros = opciones || {};
  let resultado = productos.slice();

  // Filtro por categoria
  if (filtros.categoria) {
    resultado = resultado.filter(function (producto) {
      return producto.categoria === filtros.categoria;
    });
  }

  // Filtro por precio minimo
  if (filtros.precioMin !== undefined && filtros.precioMin !== null && filtros.precioMin !== '') {
    const min = Number(filtros.precioMin);
    if (!isNaN(min)) {
      resultado = resultado.filter(function (producto) {
        return producto.precio >= min;
      });
    }
  }

  // Filtro por precio maximo
  if (filtros.precioMax !== undefined && filtros.precioMax !== null && filtros.precioMax !== '') {
    const max = Number(filtros.precioMax);
    if (!isNaN(max)) {
      resultado = resultado.filter(function (producto) {
        return producto.precio <= max;
      });
    }
  }

  // Orden
  if (filtros.orden === 'precio-asc') {
    resultado.sort(function (a, b) { return a.precio - b.precio; });
  } else if (filtros.orden === 'precio-desc') {
    resultado.sort(function (a, b) { return b.precio - a.precio; });
  } else if (filtros.orden === 'nombre-asc') {
    resultado.sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
  }

  return resultado;
}

// Esta parte solo se usa cuando corremos las pruebas con Node.
// En el navegador no hace nada.
if (typeof module !== 'undefined') {
  module.exports = { filtrarProductos };
}
