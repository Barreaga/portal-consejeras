// login.js
// Maneja el inicio de sesion.
//
// Desde esta version, el codigo y la clave se validan contra la tabla
// "consejeras" en Supabase (base de datos real), no contra un arreglo
// fijo en el codigo. La conexion se define en supabaseClient.js, que se
// carga antes que este archivo (ver login.html).
//
// La clave sigue guardada en texto plano dentro de la base de datos.
// Es una limitacion conocida, documentada en el Documento SQA (seccion
// 3.4) y en el Test Plan (seccion 4.3), y se revisa como parte de la
// tarea de reglas de seguridad (NFR-04).

function mostrarMensaje(texto) {
  const caja = document.getElementById('mensaje');
  caja.textContent = texto;
  caja.classList.remove('d-none');
}

// Busca la consejera en Supabase por su codigo.
// Es "async" porque hay que esperar la respuesta de la base de datos,
// a diferencia de antes, que buscaba al instante en un arreglo.
async function buscarConsejera(codigo) {
  const { data, error } = await supabaseClient
    .from('consejeras')
    .select('codigo, clave, nombre, estado')
    .eq('codigo', codigo)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function intentarEntrar() {
  const boton = document.getElementById('btn-entrar');
  const codigo = document.getElementById('codigo').value.trim();
  const clave = document.getElementById('clave').value;

  // CP-04: no dejar pasar con campos vacios
  if (codigo === '' || clave === '') {
    mostrarMensaje('Complete ambos campos.');
    return;
  }

  // Apagamos el boton mientras esperamos la respuesta de Supabase,
  // para que no se pueda dar doble clic y mandar dos consultas.
  boton.disabled = true;

  const consejera = await buscarConsejera(codigo);

  // CP-03: mismo mensaje para usuario que no existe y contrasena mala,
  // asi no le decimos a nadie cual de los dos fallo
  if (!consejera || consejera.clave !== clave) {
    mostrarMensaje('Codigo o contrasena incorrectos.');
    boton.disabled = false;
    return;
  }

  if (consejera.estado !== 'activa') {
    mostrarMensaje('Su cuenta no esta habilitada.');
    boton.disabled = false;
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
