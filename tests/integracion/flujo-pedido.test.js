// flujo-pedido.test.js
//
// PRUEBAS DE INTEGRACION
// A diferencia de las pruebas unitarias (que prueban una funcion sola),
// estas pruebas combinan varios modulos para verificar que trabajan bien
// juntos: pedido.js (reglas de negocio) + sesion.js (persistencia).
//
// Se enfocan en los componentes de mayor riesgo, segun el registro de
// riesgos del Master Test Plan (seccion 4): R-01, R-03 y R-04.
//
// Se ejecutan igual que las unitarias, con: npm test

const test = require('node:test');
const assert = require('node:assert');

const pedido = require('../../js/pedido.js');

function crearAlmacenFalso() {
  const almacen = {};
  return {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(almacen, k) ? almacen[k] : null),
    setItem: (k, v) => { almacen[k] = v; },
    removeItem: (k) => { delete almacen[k]; }
  };
}

function cargarSesion() {
  global.localStorage = crearAlmacenFalso();
  delete require.cache[require.resolve('../../js/sesion.js')];
  const fs = require('node:fs');
  const codigo = fs.readFileSync(require.resolve('../../js/sesion.js'), 'utf8');
  // eslint-disable-next-line no-eval
  eval(codigo);
  return {
    obtenerPedidosEnviados: eval('obtenerPedidosEnviados'),
    registrarPedidoEnviado: eval('registrarPedidoEnviado')
  };
}

test('INT-01 | un pedido valido se arma, se valida y queda registrado', () => {
  const { obtenerPedidosEnviados, registrarPedidoEnviado } = cargarSesion();

  const producto = { sku: 'SKU-0001', precio: 100.0, agotado: false };
  const cantidadEscrita = '4';

  const disponible = pedido.validarDisponible(producto);
  assert.strictEqual(disponible.valido, true);

  const cantidadValida = pedido.validarCantidad(cantidadEscrita);
  assert.strictEqual(cantidadValida.valido, true);

  const lineas = [{ precio: producto.precio, cantidad: Number(cantidadEscrita) }];
  const total = pedido.calcularTotal(lineas);
  assert.strictEqual(total, 400.0);

  const revision = pedido.puedeEnviarse({ sesionActiva: true, lineas });
  assert.strictEqual(revision.permitido, true);

  const numero = pedido.generarNumeroPedido();
  registrarPedidoEnviado(numero, lineas, total, 'C001');

  const enviados = obtenerPedidosEnviados();
  assert.strictEqual(enviados.length, 1);
  assert.strictEqual(enviados[0].total, 400.0);
});

test('INT-02 | un producto agotado se detiene antes de sumar al total', () => {
  const producto = { sku: 'SKU-0003', precio: 999.0, agotado: true };

  const disponible = pedido.validarDisponible(producto);
  assert.strictEqual(disponible.valido, false);

  const lineas = [];
  const total = pedido.calcularTotal(lineas);
  assert.strictEqual(total, 0);
});

test('INT-03 | despues de enviar, el historial refleja exactamente un pedido', () => {
  const { obtenerPedidosEnviados, registrarPedidoEnviado } = cargarSesion();

  const lineas = [{ precio: 200.0, cantidad: 2 }];
  const total = pedido.calcularTotal(lineas);

  const primeraRevision = pedido.puedeEnviarse({ sesionActiva: true, lineas });
  assert.strictEqual(primeraRevision.permitido, true);

  registrarPedidoEnviado(pedido.generarNumeroPedido(), lineas, total, 'C002');

  const lineasVacias = [];
  const segundaRevision = pedido.puedeEnviarse({ sesionActiva: true, lineas: lineasVacias });

  assert.strictEqual(segundaRevision.permitido, false);
  assert.strictEqual(obtenerPedidosEnviados().length, 1);
});

test('INT-04 | un pedido valido no se envia si la sesion no esta activa', () => {
  const lineas = [{ precio: 500.0, cantidad: 1 }];
  const total = pedido.calcularTotal(lineas);
  assert.strictEqual(total, 500.0);

  const revision = pedido.puedeEnviarse({ sesionActiva: false, lineas });
  assert.strictEqual(revision.permitido, false);
  assert.match(revision.mensaje, /sesion/i);
});

test('INT-05 | el total guardado en el historial coincide con el calculado', () => {
  const { obtenerPedidosEnviados, registrarPedidoEnviado } = cargarSesion();

  const lineas = [
    { precio: 133.33, cantidad: 2 },
    { precio: 89.5, cantidad: 1 }
  ];
  const total = pedido.calcularTotal(lineas);

  registrarPedidoEnviado(pedido.generarNumeroPedido(), lineas, total, 'C001');

  const guardado = obtenerPedidosEnviados()[0];
  assert.strictEqual(guardado.total, total);
  assert.strictEqual(guardado.productos.length, 2);
});
