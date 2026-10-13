// dashboard.js
// Muestra el resumen del pedido de la consejera.

// CP-05: primero revisamos que si haya sesion
const sesion = exigirSesion();

if (sesion) {
  mostrarDatos();
}

function mostrarDatos() {
  // El elemento se llama "nombre-consejera": debe mostrar el nombre,
  // no el codigo (estaba mal asignado).
  document.getElementById('nombre-consejera').textContent = sesion.nombre;
  document.getElementById('saludo').textContent = sesion.nombre;

  const lineas = obtenerPedido();
  const total = calcularTotal(lineas);

  document.getElementById('cantidad-lineas').textContent = lineas.length;
  document.getElementById('total-pedido').textContent = 'Q' + total.toFixed(2);

  mostrarAviso(lineas, total);
  mostrarPedidosEnviados();
}

// Mis pedidos enviados (Defecto #1, Hito 3). Desde el Hito 2 (fase 3)
// se leen de Supabase, solo los de la consejera que inicio sesion.
async function mostrarPedidosEnviados() {
  const cuerpoTabla = document.getElementById('lineas-pedidos-enviados');
  const avisoVacio = document.getElementById('sin-pedidos-enviados');

  cuerpoTabla.textContent = '';
  const resultado = await obtenerPedidosEnviados(sesion.codigo);

  if (!resultado.ok) {
    avisoVacio.textContent = resultado.mensaje;
    avisoVacio.classList.remove('d-none');
    return;
  }

  if (resultado.pedidos.length === 0) {
    avisoVacio.classList.remove('d-none');
    return;
  }

  avisoVacio.classList.add('d-none');

  // Vienen ordenados del mas reciente al mas antiguo
  for (let i = 0; i < resultado.pedidos.length; i++) {
    cuerpoTabla.appendChild(crearFilaPedido(resultado.pedidos[i]));
  }
}

// Usamos textContent y no innerHTML: los datos vienen de la base y
// cualquiera con la llave publishable puede crear un pedido, asi que un
// numero de pedido con codigo HTML no debe ejecutarse (NFR-04a).
function crearFilaPedido(pedido) {
  const fila = document.createElement('tr');
  const fecha = new Date(pedido.fecha);

  const textos = [
    pedido.numero,
    fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString(),
    String(pedido.productos),
    'Q' + pedido.total.toFixed(2)
  ];

  for (let i = 0; i < textos.length; i++) {
    const celda = document.createElement('td');
    celda.textContent = textos[i];
    fila.appendChild(celda);
  }

  return fila;
}

// Le avisamos cuanto le falta para llegar al minimo (RN-01)
function mostrarAviso(lineas, total) {
  const aviso = document.getElementById('aviso-minimo');

  if (lineas.length === 0) {
    aviso.textContent = 'Todavia no ha agregado productos a su pedido.';
    aviso.classList.remove('d-none');
    return;
  }

  if (total < MONTO_MINIMO) {
    const falta = (MONTO_MINIMO - total).toFixed(2);
    aviso.textContent = 'Le faltan Q' + falta + ' para poder enviar su pedido.';
    aviso.classList.remove('d-none');
    return;
  }

  aviso.classList.add('d-none');
}

document.getElementById('btn-salir').addEventListener('click', cerrarSesion);
