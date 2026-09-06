// filtros.test.js
// Pruebas de la funcion filtrarProductos (HU-09).
// Se corren con: npm test

const test = require('node:test');
const assert = require('node:assert');

const filtros = require('../js/filtros.js');

const PRODUCTOS_PRUEBA = [
  { sku: 'SKU-0001', nombre: 'Crema Hidratante', precio: 133.33, agotado: false, categoria: 'Cuidado de la piel' },
  { sku: 'SKU-0002', nombre: 'Locion Corporal', precio: 100.00, agotado: false, categoria: 'Cuidado de la piel' },
  { sku: 'SKU-0003', nombre: 'Perfume Floral', precio: 275.00, agotado: true, categoria: 'Fragancias' },
  { sku: 'SKU-0007', nombre: 'Base de Maquillaje', precio: 210.00, agotado: false, categoria: 'Maquillaje' }
];

// ─── Filtro por categoria ───

test('CP-20 | filtrar por categoria devuelve solo esa categoria', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, { categoria: 'Maquillaje' });
  assert.strictEqual(resultado.length, 1);
  assert.strictEqual(resultado[0].sku, 'SKU-0007');
});

test('CP-21 | categoria vacia no filtra nada', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, { categoria: '' });
  assert.strictEqual(resultado.length, 4);
});

// ─── Filtro por rango de precio ───

test('CP-22 | precio minimo excluye productos mas baratos', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, { precioMin: 150 });
  assert.strictEqual(resultado.length, 2);
});

test('CP-23 | precio maximo excluye productos mas caros', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, { precioMax: 150 });
  assert.strictEqual(resultado.length, 2);
});

test('CP-24 | rango de precio combinado (min y max)', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, { precioMin: 100, precioMax: 200 });
  assert.strictEqual(resultado.length, 2);
});

// ─── Orden ───

test('CP-25 | orden por precio de menor a mayor', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, { orden: 'precio-asc' });
  assert.strictEqual(resultado[0].sku, 'SKU-0002');
  assert.strictEqual(resultado[3].sku, 'SKU-0003');
});

test('CP-26 | orden por precio de mayor a menor', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, { orden: 'precio-desc' });
  assert.strictEqual(resultado[0].sku, 'SKU-0003');
  assert.strictEqual(resultado[3].sku, 'SKU-0002');
});

test('CP-27 | orden alfabetico por nombre', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, { orden: 'nombre-asc' });
  assert.strictEqual(resultado[0].nombre, 'Base de Maquillaje');
});

// ─── Combinado ───

test('CP-28 | categoria y orden juntos', () => {
  const resultado = filtros.filtrarProductos(PRODUCTOS_PRUEBA, {
    categoria: 'Cuidado de la piel',
    orden: 'precio-asc'
  });
  assert.strictEqual(resultado.length, 2);
  assert.strictEqual(resultado[0].sku, 'SKU-0002');
});

// ─── Casos vacios ───

test('CP-29 | lista vacia no truena', () => {
  const resultado = filtros.filtrarProductos([], { categoria: 'Maquillaje' });
  assert.strictEqual(resultado.length, 0);
});

test('CP-30 | sin productos (null) devuelve lista vacia', () => {
  const resultado = filtros.filtrarProductos(null, {});
  assert.strictEqual(resultado.length, 0);
});
