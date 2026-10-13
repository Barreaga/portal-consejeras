# Actualización del NFR-04 (Seguridad)

Este texto reemplaza la ficha del NFR-04 en la sección 2.2 de la Especificación de Requisitos No Funcionales (archivo Hito-Integracion-SQA). La versión anterior decía "dentro del alcance sin servidor" y solo cubría XSS. Ahora el sitio lee datos de una base de datos real en Supabase, así que el requisito se divide en dos partes: NFR-04a para XSS, que se mantiene, y NFR-04b para el control de autorización con Row Level Security (RLS), que es nuevo.

## NFR-04 · Seguridad (sitio estático con base de datos Supabase)

Característica ISO/IEC 25010: Seguridad. Subcaracterísticas: integridad (NFR-04a y NFR-04b) y confidencialidad (ver limitaciones).

### NFR-04a · Protección contra inyección de código (XSS)

| Campo | Contenido |
|---|---|
| Requisito | Todo campo de texto debe rechazar o neutralizar intentos de inyección de código (XSS) sin que se ejecute ningún script. Esto incluye los textos que ahora vienen de la base de datos (nombre de la consejera, nombre, SKU y categoría de los productos), que se muestran en pantalla. |
| Campos cubiertos | login.html: codigo y clave. catalogo.html: buscar-sku, cantidad de cada producto, filtro-precio-min y filtro-precio-max. |
| Cómo se mide | Escribir en cada campo textos con etiquetas de script y atributos de evento (por ejemplo una etiqueta img con onerror) y verificar que se muestren como texto plano o se rechacen, sin ejecutarse. Revisar también que los datos traídos de Supabase se pinten con textContent y no con innerHTML. |
| Umbral de aceptación | 100% de los intentos probados quedan neutralizados. |
| Método de verificación | Manual, con entradas maliciosas en el navegador. Pendiente de ejecutar. |

### NFR-04b · Control de autorización en la base de datos (RLS)

| Campo | Contenido |
|---|---|
| Requisito | Con la llave publishable, que es la única que usa el sitio, nadie debe poder crear, modificar ni borrar consejeras o productos, ni modificar o borrar pedidos y líneas de pedido ya registrados. Solo se permite leer las cuatro tablas y crear pedidos y líneas de pedido nuevos. |
| Dónde está el control | sql/politicas-rls.sql. Activa RLS en consejeras, productos, pedidos y lineas_pedido. Tiene políticas de SELECT en las cuatro tablas y de INSERT solo en pedidos y lineas_pedido. No hay políticas de UPDATE ni de DELETE. |
| Cómo se mide | Desde la consola del navegador, usando el mismo cliente de js/supabaseClient.js, intentar un INSERT en consejeras y productos, y un UPDATE y un DELETE en cada una de las cuatro tablas. Después volver a consultar las tablas para confirmar que los datos no cambiaron. También se puede revisar en el panel de Supabase (Authentication, Policies) que RLS aparezca activado en las cuatro tablas. |
| Umbral de aceptación | 100% de los intentos de escritura no permitidos son bloqueados. Los INSERT deben devolver error de permisos. Los UPDATE y DELETE deben afectar 0 filas (con RLS, Supabase no siempre devuelve error en estos casos, por eso se confirma volviendo a consultar). La lectura del catálogo y el login deben seguir funcionando. |
| Método de verificación | Manual, desde la consola del navegador y el panel de Supabase. Pendiente de ejecutar. |

### Limitaciones declaradas

- No cubre autenticación real. El login sigue siendo simulado y no usa Supabase Auth (ver Documento de Arquitectura SQA, sección 1.8). La sesión se guarda en localStorage y se puede modificar desde el navegador.
- Como la base de datos no sabe qué consejera está conectada, RLS no puede limitar los datos por consejera. Las políticas de lectura usan using (true), así que cualquiera con la llave publishable puede leer todos los pedidos. La política de INSERT en pedidos usa with check (true), así que se podría registrar un pedido a nombre de otra consejera.
- La política de lectura de consejeras deja leer todas las columnas, incluida clave, que está en texto plano. NFR-04b protege la integridad de los datos, no la confidencialidad de las contraseñas.
- Desde el Hito 2 (fase 3) los pedidos enviados se guardan en Supabase con la función registrar_pedido. La función corre con los permisos de quien la llama (security invoker), así que solo puede hacer los INSERT que permiten las políticas; no cambia ninguna política. El historial se filtra por consejera en la consulta, pero eso no es un control de seguridad: con la llave publishable se pueden leer los pedidos de todas.

### Fila para la tabla 2.3 (Resumen de trazabilidad)

| NFR | Característica ISO 25010 | Verificado por |
|---|---|---|
| NFR-04a | Seguridad (integridad) | Prueba manual con entradas maliciosas (pendiente de ejecutar) |
| NFR-04b | Seguridad (integridad) | Prueba manual de escritura con la llave publishable y revisión de políticas en Supabase (pendiente de ejecutar) |
