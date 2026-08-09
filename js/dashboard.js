// dashboard.js
// Muestra el resumen del pedido de la consejera.

// CP-05: primero revisamos que si haya sesion
const sesion = exigirSesion();

if (sesion) {
  mostrarDatos();
}

function mostrarDatos() {
  document.getElementById('nombre-consejera').textContent = sesion.codigo;
  document.getElementById('saludo').textContent = sesion.nombre;

  const lineas = obtenerPedido();
  const total = calcularTotal(lineas);

  document.getElementById('cantidad-lineas').textContent = lineas.length;
  document.getElementById('total-pedido').textContent = 'Q' + total.toFixed(2);

  mostrarAviso(lineas, total);
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
