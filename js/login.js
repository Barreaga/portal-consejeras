// login.js
// Maneja el inicio de sesion.
//
// IMPORTANTE: este login es simulado. Como el proyecto no tiene servidor,
// las credenciales estan aqui y la sesion se guarda en el navegador.
// Esto NO es seguridad real y esta declarado como limitacion conocida
// en el Documento SQA (seccion 3.4) y en el Test Plan (seccion 4.3).

const CONSEJERAS = [
  { codigo: 'C001', clave: 'clave123', nombre: 'Ana Lopez', estado: 'activa' },
  { codigo: 'C002', clave: 'clave123', nombre: 'Rosa Perez', estado: 'activa' },
  { codigo: 'C003', clave: 'clave123', nombre: 'Marta Diaz', estado: 'inactiva' }
];

function mostrarMensaje(texto) {
  const caja = document.getElementById('mensaje');
  caja.textContent = texto;
  caja.classList.remove('d-none');
}

function buscarConsejera(codigo) {
  for (let i = 0; i < CONSEJERAS.length; i++) {
    if (CONSEJERAS[i].codigo === codigo) {
      return CONSEJERAS[i];
    }
  }
  return null;
}

function intentarEntrar() {
  const codigo = document.getElementById('codigo').value.trim();
  const clave = document.getElementById('clave').value;

  // CP-04: no dejar pasar con campos vacios
  if (codigo === '' || clave === '') {
    mostrarMensaje('Complete ambos campos.');
    return;
  }

  const consejera = buscarConsejera(codigo);

  // CP-03: mismo mensaje para usuario que no existe y contrasena mala,
  // asi no le decimos a nadie cual de los dos fallo
  if (!consejera || consejera.clave !== clave) {
    mostrarMensaje('Codigo o contrasena incorrectos.');
    return;
  }

  if (consejera.estado !== 'activa') {
    mostrarMensaje('Su cuenta no esta habilitada.');
    return;
  }

  // CP-02: guardar la sesion y pasar al dashboard
  localStorage.setItem('sesion', JSON.stringify({
    codigo: consejera.codigo,
    nombre: consejera.nombre
  }));

  window.location.href = 'dashboard.html';
}

document.getElementById('btn-entrar').addEventListener('click', intentarEntrar);

// La consejera espera poder presionar Enter en vez de hacer clic.
// Detectado como defecto de usabilidad mediante estimacion de errores.
function entrarConEnter(evento) {
  if (evento.key === 'Enter') {
    intentarEntrar();
  }
}

document.getElementById('codigo').addEventListener('keydown', entrarConEnter);
document.getElementById('clave').addEventListener('keydown', entrarConEnter);
