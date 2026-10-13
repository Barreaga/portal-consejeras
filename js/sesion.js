// sesion.js
// Funciones que usan las paginas internas para revisar la sesion.
//
// Recordatorio: la sesion y el pedido en curso (el carrito) se guardan en
// el navegador. No es seguridad real (ver Documento SQA, seccion 3.4).
// Los pedidos ya enviados y el historial se guardan en Supabase.

// Devuelve los datos de la consejera, o null si no hay sesion
function obtenerSesion() {
  const guardado = localStorage.getItem('sesion');

  if (!guardado) {
    return null;
  }

  return JSON.parse(guardado);
}

// CP-05: si alguien escribe la URL sin haber entrado, lo mandamos al login
function exigirSesion() {
  const sesion = obtenerSesion();

  if (!sesion) {
    window.location.replace('login.html');
    return null;
  }

  return sesion;
}

// CP-19: borra la sesion y regresa a la landing.
// Usamos replace para que el boton atras no regrese a la pagina interna.
function cerrarSesion() {
  localStorage.removeItem('sesion');
  localStorage.removeItem('pedido');
  localStorage.removeItem('pedidoPendiente');
  window.location.replace('index.html');
}

// Lee el pedido guardado. Si no hay, devuelve una lista vacia.
function obtenerPedido() {
  const guardado = localStorage.getItem('pedido');

  if (!guardado) {
    return [];
  }

  return JSON.parse(guardado);
}

function guardarPedido(lineas) {
  localStorage.setItem('pedido', JSON.stringify(lineas));
}

// ─── Pedidos enviados en Supabase (Defecto #1, Hito 3; Hito 2 fase 3) ───
// Antes el historial se guardaba en localStorage y se perdia al cambiar de
// navegador. Ahora el pedido enviado y sus lineas se guardan en las tablas
// pedidos y lineas_pedido, con la funcion registrar_pedido de Supabase
// (ver sql/registrar-pedido.sql).
//
// Estas funciones reciben el cliente de Supabase como ultimo parametro.
// En el sitio no se pasa y se usa supabaseClient; en las pruebas se pasa
// un cliente falso, para no depender de internet.

const MENSAJE_SIN_CONEXION = 'No se pudo enviar el pedido. Revise su conexion e intente de nuevo. ' +
  'Su pedido sigue guardado.';

// Convierte el error de Supabase en un mensaje que entienda la consejera.
// La funcion registrar_pedido vuelve a revisar las reglas de negocio y,
// si alguna falla, el mensaje del error empieza con el ID de la regla.
function mensajeDeError(error) {
  const texto = (error && error.message) || '';

  if (texto.indexOf('RN-01') !== -1) {
    return 'El pedido no llega al minimo de Q400.00.';
  }
  if (texto.indexOf('RN-02') !== -1) {
    return 'Hay una cantidad fuera del rango permitido (1 a 99).';
  }
  if (texto.indexOf('RN-03') !== -1) {
    return 'Uno de los productos ya no esta disponible. Revise su pedido.';
  }
  return MENSAJE_SIN_CONEXION;
}

// Busca un pedido por numero. Se usa cuando un reintento choca con un
// numero que ya existe, para saber si es el mismo pedido.
async function buscarPedido(db, numero) {
  const { data, error } = await db
    .from('pedidos')
    .select('numero, codigo_consejera, total')
    .eq('numero', numero)
    .maybeSingle();

  return error ? null : data;
}

// Guarda un pedido enviado. Devuelve { ok, total, mensaje, repetido }.
// Nunca lanza errores: si algo falla, devuelve ok = false con el mensaje,
// para que el catalogo no pierda el pedido.
async function registrarPedidoEnviado(numero, lineas, codigo, cliente) {
  const db = cliente || supabaseClient;
  const detalle = lineas.map(function (linea) {
    return { sku: linea.sku, cantidad: linea.cantidad };
  });

  try {
    const { data, error } = await db.rpc('registrar_pedido', {
      p_numero: numero,
      p_codigo: codigo,
      p_lineas: detalle
    });

    if (!error) {
      return { ok: true, total: Number(data), mensaje: '' };
    }

    // 23505: ya existe un pedido con ese numero. Si es de esta misma
    // consejera, es un reintento cuyo primer intento si se guardo
    // (por ejemplo, se perdio la respuesta). Si no, el numero esta ocupado.
    if (error.code === '23505') {
      const existente = await buscarPedido(db, numero);
      if (existente && existente.codigo_consejera === codigo) {
        return { ok: true, total: Number(existente.total), mensaje: '' };
      }
      return { ok: false, repetido: true, mensaje: MENSAJE_SIN_CONEXION };
    }

    return { ok: false, mensaje: mensajeDeError(error) };
  } catch {
    return { ok: false, mensaje: MENSAJE_SIN_CONEXION };
  }
}

// Devuelve { ok, pedidos, mensaje } con los pedidos de una consejera,
// del mas reciente al mas antiguo. Cada pedido trae cuantas lineas tiene.
async function obtenerPedidosEnviados(codigo, cliente) {
  const db = cliente || supabaseClient;

  try {
    const { data, error } = await db
      .from('pedidos')
      .select('numero, fecha, total, lineas_pedido(id)')
      .eq('codigo_consejera', codigo)
      .order('fecha', { ascending: false });

    if (error) {
      return { ok: false, pedidos: [], mensaje: 'No se pudieron cargar sus pedidos enviados.' };
    }

    const pedidos = data.map(function (fila) {
      return {
        numero: fila.numero,
        fecha: fila.fecha,
        total: Number(fila.total),
        productos: fila.lineas_pedido.length
      };
    });

    return { ok: true, pedidos: pedidos, mensaje: '' };
  } catch {
    return { ok: false, pedidos: [], mensaje: 'No se pudieron cargar sus pedidos enviados.' };
  }
}

// ─── Numero del pedido que se esta enviando ───
// Mientras un pedido no se confirma, se guarda su numero junto con las
// lineas. Si la consejera reintenta con el mismo carrito, se usa el mismo
// numero, asi un reintento nunca crea un pedido duplicado.

function numeroParaEnviar(lineas, generar) {
  const firma = JSON.stringify(lineas);
  const guardado = localStorage.getItem('pedidoPendiente');

  if (guardado) {
    const pendiente = JSON.parse(guardado);
    if (pendiente.firma === firma) {
      return pendiente.numero;
    }
  }

  const numero = generar();
  localStorage.setItem('pedidoPendiente', JSON.stringify({ numero: numero, firma: firma }));
  return numero;
}

function limpiarPedidoPendiente() {
  localStorage.removeItem('pedidoPendiente');
}

// Esta parte solo se usa cuando corremos las pruebas con Node.
// En el navegador no hace nada.
if (typeof module !== 'undefined') {
  module.exports = {
    guardarPedido,
    obtenerPedido,
    registrarPedidoEnviado,
    obtenerPedidosEnviados,
    numeroParaEnviar,
    limpiarPedidoPendiente
  };
}
