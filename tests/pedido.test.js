// pedido.test.js
// Cada prueba corresponde a un caso de la RTM.
// El nombre lleva el ID del caso para poder relacionarlos.
// Se corren con: npm test

const test = require('node:test');
const assert = require('node:assert');

const pedido = require('../js/pedido.js');

// ─── RN-02: cantidad entre 1 y 99 ───

test('CP-09 | cantidad 1 se acepta', () => {
  assert.strictEqual(pedido.validarCantidad(1).valido, true);
});

test('CP-10 | cantidad 99 se acepta', () => {
  assert.strictEqual(pedido.validarCantidad(99).valido, true);
});

test('CP-11 | cantidad 0 se rechaza', () => {
  assert.strictEqual(pedido.validarCantidad(0).valido, false);
});

test('CP-12 | cantidad 100 se rechaza', () => {
  assert.strictEqual(pedido.validarCantidad(100).valido, false);
});

test('CP-13 | letras en la cantidad se rechazan', () => {
  assert.strictEqual(pedido.validarCantidad('abc').valido, false);
});

// ─── RN-03: productos agotados ───

test('CP-14 | un producto agotado no se puede agregar', () => {
  const producto = { sku: 'SKU-0003', precio: 120, agotado: true };
  assert.strictEqual(pedido.validarDisponible(producto).valido, false);
});

test('CP-06 | un producto disponible si se puede agregar', () => {
  const producto = { sku: 'SKU-0001', precio: 120, agotado: false };
  assert.strictEqual(pedido.validarDisponible(producto).valido, true);
});

// ─── Total del pedido ───

test('CP-15 | el total se calcula bien con decimales', () => {
  const lineas = [{ precio: 133.33, cantidad: 3 }];
  assert.strictEqual(pedido.calcularTotal(lineas), 399.99);
});

// ─── RN-01: minimo de Q400 ───

test('CP-16 | no deja enviar con Q399.99', () => {
  const p = { sesionActiva: true, lineas: [{ precio: 133.33, cantidad: 3 }] };
  assert.strictEqual(pedido.puedeEnviarse(p).permitido, false);
});

test('CP-17 | si deja enviar con Q400.00 exactos', () => {
  const p = { sesionActiva: true, lineas: [{ precio: 100, cantidad: 4 }] };
  assert.strictEqual(pedido.puedeEnviarse(p).permitido, true);
});

// ─── Tabla de decision ───

test('CP-05 | sin sesion no deja enviar', () => {
  const p = { sesionActiva: false, lineas: [{ precio: 500, cantidad: 1 }] };
  assert.strictEqual(pedido.puedeEnviarse(p).permitido, false);
});

test('Caso 2 | con el pedido vacio no deja enviar', () => {
  const p = { sesionActiva: true, lineas: [] };
  assert.strictEqual(pedido.puedeEnviarse(p).permitido, false);
});
