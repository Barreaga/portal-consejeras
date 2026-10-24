// ver-clave.js
// Boton "Mostrar / Ocultar" junto a la contrasena del login.
// Solo cambia como se ve el campo; no toca la logica de login.js.

function alternarClave() {
  const campo = document.getElementById('clave');
  const boton = document.getElementById('btn-ver-clave');
  const mostrar = campo.type === 'password';

  campo.type = mostrar ? 'text' : 'password';
  boton.textContent = mostrar ? 'Ocultar' : 'Mostrar';
  boton.setAttribute('aria-pressed', mostrar ? 'true' : 'false');
  campo.focus();
}

document.getElementById('btn-ver-clave').addEventListener('click', alternarClave);
