// supabaseClient.js
// Aqui se configura la conexion a la base de datos real (Supabase).
// Todos los demas archivos que necesiten leer o guardar datos usan este
// mismo cliente, en vez de que cada uno configure su propia conexion.
//
// La "publishable key" esta pensada para ser publica: es la misma llave
// que le llega al navegador de cualquier persona que visite el sitio, no
// es un secreto. Lo que protege los datos de verdad no es ocultar esta
// llave, sino las reglas de seguridad (Row Level Security) que se
// configuran en la tarea de NFR-04.
//
// Requiere que la libreria de Supabase (supabase-js) se cargue antes que
// este archivo. Eso ya esta resuelto en el <script> de cada pagina HTML.

const SUPABASE_URL = 'https://zklusbjjwfbpkxyxngbb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGzo8UpSKkCl25Gpn4gwYg_6JRF_NDQ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
