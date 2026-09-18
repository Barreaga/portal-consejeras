-- Tarea 4 (NFR-04): Politicas de Row Level Security (RLS)
-- Este script ya fue ejecutado en el SQL Editor de Supabase.
-- Se deja aqui como documentacion de que reglas de seguridad
-- protegen la base de datos.

-- Activar RLS en las cuatro tablas
alter table consejeras enable row level security;
alter table productos enable row level security;
alter table pedidos enable row level security;
alter table lineas_pedido enable row level security;

-- consejeras: solo lectura (la necesita el login). Sin politica de
-- escritura, quedan bloqueados INSERT, UPDATE y DELETE por defecto.
create policy "Lectura publica de consejeras"
on consejeras for select
using (true);

-- productos: solo lectura (catalogo publico). Igual, sin politica de
-- escritura, nadie puede cambiar precios o stock desde el navegador.
create policy "Lectura publica de productos"
on productos for select
using (true);

-- pedidos: se puede leer y crear, pero no modificar ni borrar un
-- pedido ya enviado.
create policy "Lectura publica de pedidos"
on pedidos for select
using (true);

create policy "Cualquiera puede registrar un pedido"
on pedidos for insert
with check (true);

-- lineas_pedido: mismo criterio que pedidos.
create policy "Lectura publica de lineas de pedido"
on lineas_pedido for select
using (true);

create policy "Cualquiera puede agregar lineas de pedido"
on lineas_pedido for insert
with check (true);
