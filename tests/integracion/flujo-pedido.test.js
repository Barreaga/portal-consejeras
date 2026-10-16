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
// Desde el Hito 2 (fase 3) los pedidos enviados se guardan en Supabase.
// Para no depender de internet, aqui se usa un cliente falso que guarda
// todo en memoria y se comporta como la funcion registrar_pedido
// (sql/registrar-pedido.sql): revisa RN-01, RN-02 y RN-03, calcula el
// total con sus propios precios y rechaza numeros de pedido repetidos.
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

// Precios del catalogo falso (en la base real salen de la tabla productos)
const CATALOGO = {
  'SKU-0001': { precio: 133.33, agotado: false },
  'SKU-0002': { precio: 100.0, agotado: false },
  'SKU-0003': { precio: 275.0, agotado: true },
  'SKU-0004': { precio: 89.5, agotado: false },
  'SKU-0005': { precio: 200.0, agotado: false }
};

// Imita una consulta de supabase-js: select, eq, order y maybeSingle,
// y se puede esperar con await.
function crearConsulta(obtenerFilas) {
  const filtros = [];
  let unico = false;
  const consulta = {
    select: () => consulta,
    order: () => consulta,
    eq: (columna, valor) => { filtros.push([columna, valor]); return consulta; },
    maybeSingle: () => { unico = true; return consulta; },
    then: (resolver, rechazar) => {
      const filas = obtenerFilas().filter((fila) => filtros.every(([c, v]) => fila[c] === v));
      return Promise.resolve({ data: unico ? (filas[0] || null) : filas, error: null }).then(resolver, rechazar);
    }
  };
  return consulta;
}

// opciones.fallaRed: el envio falla sin guardar nada.
// opciones.pierdeRespuesta: el primer envio si se guarda, pero la respuesta
// no llega (como cuando se cae la red justo despues de guardar).
function crearClienteFalso(opciones) {
  const config = opciones || {};
  const pedidos = [];
  const lineas = [];
  let respuestasPerdidas = 0;

  function error(mensaje, codigo) {
    return { data: null, error: { message: mensaje, code: codigo || 'P0001' } };
  }

  return {
    pedidos,
    lineas,
    rpc: async (nombre, args) => {
      if (config.fallaRed) {
        return error('TypeError: Failed to fetch', '');
      }

      let centavos = 0;
      for (const linea of args.p_lineas) {
        const producto = CATALOGO[linea.sku];
        if (!Number.isInteger(linea.cantidad) || linea.cantidad < 1 || linea.cantidad > 99) {
          return error('RN-02: cantidad fuera de rango');
        }
        if (!producto || producto.agotado) {
          return error('RN-03: producto no disponible');
        }
        centavos += Math.round(producto.precio * 100) * linea.cantidad;
      }
      if (args.p_lineas.length === 0 || centavos < 40000) {
        return error('RN-01: el pedido no llega al minimo');
      }
      if (pedidos.some((p) => p.numero === args.p_numero)) {
        return error('duplicate key value violates unique constraint', '23505');
      }

      pedidos.push({ numero: args.p_numero, codigo_consejera: args.p_codigo, total: centavos / 100, fecha: new Date().toISOString() });
      for (const linea of args.p_lineas) {
        lineas.push({ id: lineas.length + 1, numero_pedido: args.p_numero, sku_producto: linea.sku, cantidad: linea.cantidad });
      }

      if (config.pierdeRespuesta && respuestasPerdidas === 0) {
        respuestasPerdidas++;
        return error('TypeError: Failed to fetch', '');
      }
      return { data: centavos / 100, error: null };
    },
    from: () => crearConsulta(() => pedidos.map((p) => ({
      ...p,
      lineas_pedido: lineas.filter((l) => l.numero_pedido === p.numero).map((l) => ({ id: l.id }))
    })))
  };
}

function cargarSesion() {
  global.localStorage = crearAlmacenFalso();
  delete require.cache[require.resolve('../../js/sesion.js')];
  return require('../../js/sesion.js');
}

test('INT-01 | un pedido valido se arma, se valida y queda registrado', async () => {
  const { obtenerPedidosEnviados, registrarPedidoEnviado } = cargarSesion();
  const cliente = crearClienteFalso();

  const producto = { sku: 'SKU-0002', precio: 100.0, agotado: false };
  const cantidadEscrita = '4';

  const disponible = pedido.validarDisponible(producto);
  assert.strictEqual(disponible.valido, true);

  const cantidadValida = pedido.validarCantidad(cantidadEscrita);
  assert.strictEqual(cantidadValida.valido, true);

  const lineas = [{ sku: producto.sku, precio: producto.precio, cantidad: Number(cantidadEscrita) }];
  const total = pedido.calcularTotal(lineas);
  assert.strictEqual(total, 400.0);

  const revision = pedido.puedeEnviarse({ sesionActiva: true, lineas });
  assert.strictEqual(revision.permitido, true);

  const numero = pedido.generarNumeroPedido();
  const resultado = await registrarPedidoEnviado(numero, lineas, '3311', cliente);
  assert.strictEqual(resultado.ok, true);

  const historial = await obtenerPedidosEnviados('3311', cliente);
  assert.strictEqual(historial.pedidos.length, 1);
  assert.strictEqual(historial.pedidos[0].numero, numero);
  assert.strictEqual(historial.pedidos[0].total, 400.0);
});

test('INT-02 | un producto agotado se detiene antes de sumar al total', () => {
  const producto = { sku: 'SKU-0003', precio: 999.0, agotado: true };

  const disponible = pedido.validarDisponible(producto);
  assert.strictEqual(disponible.valido, false);

  const lineas = [];
  const total = pedido.calcularTotal(lineas);
  assert.strictEqual(total, 0);
});

test('INT-03 | despues de enviar, el historial refleja exactamente un pedido', async () => {
  const { obtenerPedidosEnviados, registrarPedidoEnviado } = cargarSesion();
  const cliente = crearClienteFalso();

  const lineas = [{ sku: 'SKU-0005', precio: 200.0, cantidad: 2 }];

  const primeraRevision = pedido.puedeEnviarse({ sesionActiva: true, lineas });
  assert.strictEqual(primeraRevision.permitido, true);

  await registrarPedidoEnviado(pedido.generarNumeroPedido(), lineas, '4422', cliente);

  const lineasVacias = [];
  const segundaRevision = pedido.puedeEnviarse({ sesionActiva: true, lineas: lineasVacias });

  assert.strictEqual(segundaRevision.permitido, false);
  const historial = await obtenerPedidosEnviados('4422', cliente);
  assert.strictEqual(historial.pedidos.length, 1);
});

test('INT-04 | un pedido valido no se envia si la sesion no esta activa', () => {
  const lineas = [{ precio: 500.0, cantidad: 1 }];
  const total = pedido.calcularTotal(lineas);
  assert.strictEqual(total, 500.0);

  const revision = pedido.puedeEnviarse({ sesionActiva: false, lineas });
  assert.strictEqual(revision.permitido, false);
  assert.match(revision.mensaje, /sesion/i);
});

test('INT-05 | el total guardado en el historial coincide con el calculado', async () => {
  const { obtenerPedidosEnviados, registrarPedidoEnviado } = cargarSesion();
  const cliente = crearClienteFalso();

  // Se subio a 3 unidades de SKU-0001 para pasar el minimo de RN-01,
  // que ahora tambien se revisa en la base de datos.
  const lineas = [
    { sku: 'SKU-0001', precio: 133.33, cantidad: 3 },
    { sku: 'SKU-0004', precio: 89.5, cantidad: 1 }
  ];
  const total = pedido.calcularTotal(lineas);

  const resultado = await registrarPedidoEnviado(pedido.generarNumeroPedido(), lineas, '3311', cliente);
  assert.strictEqual(resultado.total, total);

  const guardado = (await obtenerPedidosEnviados('3311', cliente)).pedidos[0];
  assert.strictEqual(guardado.total, total);
  assert.strictEqual(guardado.productos, 2);
});

test('INT-06 | si falla la red, se avisa y el carrito no se pierde', async () => {
  const { guardarPedido, obtenerPedido, registrarPedidoEnviado } = cargarSesion();
  const cliente = crearClienteFalso({ fallaRed: true });

  const lineas = [{ sku: 'SKU-0002', precio: 100.0, cantidad: 4 }];
  guardarPedido(lineas);

  const resultado = await registrarPedidoEnviado('PED-2026-1111', lineas, '3311', cliente);

  assert.strictEqual(resultado.ok, false);
  assert.match(resultado.mensaje, /conexion/);
  assert.deepStrictEqual(obtenerPedido(), lineas);
  assert.strictEqual(cliente.pedidos.length, 0);
});

test('INT-07 | reintentar despues de perder la respuesta no duplica el pedido', async () => {
  const { registrarPedidoEnviado, numeroParaEnviar } = cargarSesion();
  const cliente = crearClienteFalso({ pierdeRespuesta: true });
  const lineas = [{ sku: 'SKU-0002', precio: 100.0, cantidad: 4 }];

  // El primer intento si se guarda, pero la respuesta no llega
  const numero = numeroParaEnviar(lineas, pedido.generarNumeroPedido);
  const primero = await registrarPedidoEnviado(numero, lineas, '3311', cliente);
  assert.strictEqual(primero.ok, false);

  // Con el mismo carrito se reutiliza el mismo numero
  const numeroReintento = numeroParaEnviar(lineas, pedido.generarNumeroPedido);
  assert.strictEqual(numeroReintento, numero);

  const segundo = await registrarPedidoEnviado(numeroReintento, lineas, '3311', cliente);
  assert.strictEqual(segundo.ok, true);
  assert.strictEqual(cliente.pedidos.length, 1);
});

test('INT-08 | el historial solo trae los pedidos de la consejera', async () => {
  const { obtenerPedidosEnviados, registrarPedidoEnviado } = cargarSesion();
  const cliente = crearClienteFalso();
  const lineas = [{ sku: 'SKU-0005', precio: 200.0, cantidad: 2 }];

  await registrarPedidoEnviado('PED-2026-2001', lineas, '3311', cliente);
  await registrarPedidoEnviado('PED-2026-2002', lineas, '4422', cliente);

  const historial = await obtenerPedidosEnviados('3311', cliente);
  assert.strictEqual(historial.pedidos.length, 1);
  assert.strictEqual(historial.pedidos[0].numero, 'PED-2026-2001');
});

test('INT-09 | si la base rechaza el pedido por RN-01, se explica el motivo', async () => {
  const { registrarPedidoEnviado } = cargarSesion();
  const cliente = crearClienteFalso();

  // RN-01: Q399.99 no llega al minimo (la base lo vuelve a revisar)
  const lineas = [{ sku: 'SKU-0001', precio: 133.33, cantidad: 3 }];
  const resultado = await registrarPedidoEnviado('PED-2026-3001', lineas, '3311', cliente);

  assert.strictEqual(resultado.ok, false);
  assert.match(resultado.mensaje, /minimo/);
  assert.strictEqual(cliente.pedidos.length, 0);
});
