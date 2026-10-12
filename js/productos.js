// productos.js
// Antes el catalogo era un arreglo escrito a mano. Desde esta version se
// trae de la tabla "productos" en Supabase (base de datos real).
// Requiere que supabaseClient.js se cargue antes que este archivo.

// Trae el catalogo completo desde Supabase, ordenado por SKU.
// Es "async" por la misma razon que buscarConsejera() en login.js:
// hay que esperar la respuesta de la base de datos.
async function obtenerProductos() {
  const { data, error } = await supabaseClient
    .from('productos')
    .select('sku, nombre, precio, categoria, agotado')
    .order('sku');

  if (error) {
    return [];
  }

  return data;
}

// Esta parte solo se usa cuando corremos las pruebas con Node.
// En el navegador no hace nada.
if (typeof module !== 'undefined') {
  module.exports = { obtenerProductos };
}
