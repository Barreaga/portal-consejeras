// login.js
// Maneja el inicio de sesion.


const CONSEJERAS = [
  { codigo: 'C001', clave: 'clave123', nombre: 'Brandon Arreaga', estado: 'activa' },
  { codigo: 'C002', clave: 'clave123', nombre: 'Juan Arriola', estado: 'activa' },
  { codigo: 'C003', clave: 'clave123', nombre: 'Juan Romero', estado: 'inactiva' }
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
