# Actualización del Documento de Arquitectura SQA (Hito 2)

Este texto se agrega a la Parte 1 del Documento de Arquitectura SQA (archivo Hito-Integracion-SQA). Reemplaza lo que decían las secciones 1.4 (fila de localStorage), 1.5 y 1.6, porque esas secciones describían el sitio antes de conectarlo a una base de datos.

## 1.4 Tecnologías (filas nuevas o cambiadas)

| Tecnología | Para qué |
|---|---|
| Supabase (PostgreSQL) | Base de datos real. Guarda las consejeras y el catálogo de productos |
| supabase-js versión 2 | Librería que usa el navegador para consultar la base de datos. Se carga desde cdn.jsdelivr.net en login.html y catalogo.html |
| localStorage | Sigue guardando la sesión, el pedido en curso y el historial de pedidos enviados |

## 1.5 Cómo está organizado

El sitio sigue teniendo tres capas, pero la capa de datos ya no es solo un archivo y el navegador.

La primera capa son las páginas: index.html, login.html, dashboard.html y catalogo.html.

La segunda capa es la lógica en JavaScript. Las reglas RN-01, RN-02 y RN-03 siguen en js/pedido.js y no cambiaron. Los filtros del catálogo están en js/filtros.js.

La tercera capa son los datos, y ahora tiene dos partes:

- Supabase. La conexión se configura una sola vez en js/supabaseClient.js y todos los demás archivos usan ese mismo cliente. login.js busca a la consejera en la tabla consejeras (columnas codigo, clave, nombre y estado) y productos.js trae el catálogo de la tabla productos (columnas sku, nombre, precio, categoria y agotado), ordenado por SKU. Las dos consultas son asíncronas, por eso las funciones buscarConsejera() y obtenerProductos() usan async y await. Si la consulta falla, el login muestra el mismo mensaje de credenciales incorrectas y el catálogo queda vacío.
- localStorage. sesion.js guarda la sesión, el pedido que se está armando y el historial de pedidos enviados. Esta parte todavía no se migró. En la base de datos ya existen las tablas pedidos y lineas_pedido, pero el código del sitio aún no las usa.

El filtro de categorías del catálogo ahora se arma con las categorías que vienen de la base de datos, en vez de estar escritas a mano en el HTML.

## 1.6 Decisión: por qué usamos Supabase

Para el Hito 2 necesitábamos que los datos dejaran de estar escritos en el código. Elegimos Supabase por dos razones.

La primera es que es una base de datos relacional (PostgreSQL). Los datos del portal tienen relaciones claras: una consejera hace pedidos y cada pedido tiene varias líneas con productos. Eso se representa bien con tablas relacionadas.

La segunda es que permite proteger los datos con Row Level Security (RLS) sin que tengamos que programar un servidor propio. El sitio sigue siendo estático y se conecta directo desde el navegador. Las reglas de quién puede leer o escribir cada tabla se definen dentro de la misma base de datos. Así mantuvimos la decisión del Hito 1 de no construir un servidor, que nos habría quitado tiempo para las pruebas.

Las reglas que se aplicaron están en sql/politicas-rls.sql. RLS está activado en las cuatro tablas (consejeras, productos, pedidos y lineas_pedido). En consejeras y productos solo se permite leer. En pedidos y lineas_pedido se permite leer y crear registros, pero no modificarlos ni borrarlos. Como no hay ninguna política de UPDATE ni de DELETE, la base de datos rechaza esas operaciones por defecto.

## 1.7 Por qué no ocultamos la URL ni la llave de Supabase

Cualquier persona que abra js/supabaseClient.js, o la pestaña Network del navegador, puede ver la URL del proyecto de Supabase y la llave. Esto es a propósito y no es un descuido.

El sitio no tiene un servidor propio. Todo el código corre en el navegador de quien lo visita, así que cualquier dato que el navegador necesite para conectarse a la base de datos le tiene que llegar al usuario. Si intentáramos esconder la URL (por ejemplo en otro archivo, codificada o en una variable de entorno de compilación), igual aparecería en las peticiones que hace el navegador. Esconderla solo daría una falsa sensación de seguridad.

Por eso usamos la llave publishable, que Supabase diseñó para estar en el lado del cliente. Esa llave por sí sola no da permisos especiales. Lo que decide qué se puede hacer con ella son las políticas de Row Level Security. La protección del portal está en RLS, no en esconder la URL. La llave secreta (service role), que sí se salta RLS, no se usa en el sitio y nunca debe ponerse en el código.

## 1.8 Seguridad y limitaciones declaradas

Se mantiene lo del Hito 1: se valida lo que escribe el usuario antes de usarlo y, si no hay sesión, no se puede entrar a las páginas internas. A eso se agrega el control de RLS en la base de datos.

Limitación que aceptamos: el login sigue siendo simulado. No usamos Supabase Auth. login.js trae el registro de la consejera desde la tabla consejeras y compara la contraseña en el navegador. Si coincide, guarda la sesión en localStorage. Esto tiene tres consecuencias que dejamos declaradas:

1. La sesión se puede modificar desde las herramientas del navegador, igual que en el Hito 1.
2. La base de datos no sabe qué consejera está conectada. Todas las peticiones llegan con la misma llave publishable, así que las políticas de RLS no pueden distinguir a una consejera de otra. Por eso las políticas de lectura usan using (true) y la de crear pedidos usa with check (true).
3. La contraseña está guardada en texto plano en la tabla consejeras y la política de lectura de esa tabla deja leer todas sus columnas. Con la llave publishable se puede consultar la columna clave de todas las consejeras. RLS evita que se modifiquen o borren datos, pero no protege la confidencialidad de las contraseñas.

Para cerrar estas limitaciones habría que usar Supabase Auth, de modo que cada petición lleve la identidad de la consejera y las políticas puedan filtrar con auth.uid(). Eso queda fuera del alcance de este hito.
