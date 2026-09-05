// productos.js
// Lista de productos de prueba. Todos los datos son inventados.
// Sirve como "base de datos" del proyecto.
//
// HU-09: se agrego el campo "categoria" para poder filtrar el catalogo
// por categoria, rango de precio y orden.

const PRODUCTOS = [
  { sku: 'SKU-0001', nombre: 'Crema Hidratante', precio: 133.33, agotado: false, categoria: 'Cuidado de la piel' },
  { sku: 'SKU-0002', nombre: 'Locion Corporal', precio: 100.00, agotado: false, categoria: 'Cuidado de la piel' },
  { sku: 'SKU-0003', nombre: 'Perfume Floral', precio: 275.00, agotado: true, categoria: 'Fragancias' },
  { sku: 'SKU-0004', nombre: 'Set de Labiales', precio: 189.50, agotado: false, categoria: 'Maquillaje' },
  { sku: 'SKU-0005', nombre: 'Shampoo Reparador', precio: 85.00, agotado: false, categoria: 'Cabello' },
  { sku: 'SKU-0006', nombre: 'Mascarilla Facial', precio: 145.75, agotado: true, categoria: 'Cuidado de la piel' },
  { sku: 'SKU-0007', nombre: 'Base de Maquillaje', precio: 210.00, agotado: false, categoria: 'Maquillaje' },
  { sku: 'SKU-0008', nombre: 'Kit de Brochas', precio: 320.00, agotado: false, categoria: 'Maquillaje' }
];

if (typeof module !== 'undefined') {
  module.exports = { PRODUCTOS };
}
