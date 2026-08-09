// pedido.js
// Aqui estan las tres reglas de negocio del proyecto.
// Las separamos en funciones para poder probarlas una por una.

// RN-01: el pedido debe llegar a este monto para poder enviarse
const MONTO_MINIMO = 400;

// RN-02: la cantidad de cada producto debe estar en este rango
const CANTIDAD_MINIMA = 1;
const CANTIDAD_MAXIMA = 99;

// RN-02: revisa si la cantidad que escribio la consejera es valida
function validarCantidad(cantidad) {
  if (cantidad === '' || cantidad === null || cantidad === undefined) {
    return { valido: false, mensaje: 'Escriba una cantidad.' };
  }

  const numero = Number(cantidad);

  if (isNaN(numero)) {
    return { valido: false, mensaje: 'La cantidad debe ser un numero.' };
  }

  if (numero !== Math.floor(numero)) {
    return { valido: false, mensaje: 'La cantidad debe ser un numero entero.' };
  }

  if (numero < CANTIDAD_MINIMA) {
    return { valido: false, mensaje: 'La cantidad minima es 1.' };
  }

  if (numero > CANTIDAD_MAXIMA) {
    return { valido: false, mensaje: 'La cantidad maxima es 99.' };
  }

  return { valido: true, mensaje: '' };
}

// RN-03: revisa si el producto se puede agregar al pedido
function validarDisponible(producto) {
  if (!producto) {
    return { valido: false, mensaje: 'El producto no existe.' };
  }

  if (producto.agotado === true) {
    return { valido: false, mensaje: 'Este producto esta agotado.' };
  }

  return { valido: true, mensaje: '' };
}

// Suma el total del pedido.
// Trabajamos en centavos para que no salgan errores raros con los decimales.
function calcularTotal(lineas) {
  if (!lineas || lineas.length === 0) {
    return 0;
  }

  let centavos = 0;

  for (let i = 0; i < lineas.length; i++) {
    const precioEnCentavos = Math.round(lineas[i].precio * 100);
    centavos = centavos + precioEnCentavos * lineas[i].cantidad;
  }

  return centavos / 100;
}

// RN-01: decide si el pedido se puede enviar.
// Sigue la tabla de decision del Test Plan (seccion 5.3.3).
function puedeEnviarse(pedido) {
  if (!pedido || pedido.sesionActiva !== true) {
    return { permitido: false, mensaje: 'Debe iniciar sesion.' };
  }

  if (!pedido.lineas || pedido.lineas.length === 0) {
    return { permitido: false, mensaje: 'Su pedido esta vacio.' };
  }

  const total = calcularTotal(pedido.lineas);

  if (total < MONTO_MINIMO) {
    const falta = (MONTO_MINIMO - total).toFixed(2);
    return { permitido: false, mensaje: 'Le faltan Q' + falta + ' para el minimo.' };
  }

  return { permitido: true, mensaje: '' };
}

// Genera el numero de pedido que se le muestra a la consejera
function generarNumeroPedido() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const azar = Math.floor(Math.random() * 9000) + 1000;
  return 'PED-' + anio + '-' + azar;
}

// Esta parte solo se usa cuando corremos las pruebas con Node.
// En el navegador no hace nada.
if (typeof module !== 'undefined') {
  module.exports = {
    MONTO_MINIMO,
    validarCantidad,
    validarDisponible,
    calcularTotal,
    puedeEnviarse,
    generarNumeroPedido
  };
}
