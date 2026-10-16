-- Hito 2, fase 3: registrar un pedido enviado en Supabase.
-- PENDIENTE DE EJECUTAR en el SQL Editor de Supabase (lo ejecuta el PO).
--
-- Por que una funcion y no dos INSERT desde el navegador:
-- el pedido y sus lineas se guardan en una sola transaccion. Si algo
-- falla a la mitad (por ejemplo se cae la red), no queda un pedido sin
-- lineas. Ademas aqui se vuelven a revisar RN-01, RN-02 y RN-03, y el
-- total se calcula con los precios de la tabla productos, no con lo que
-- mande el navegador.
--
-- No cambia ninguna politica de RLS: la funcion es "security invoker",
-- o sea que corre con los mismos permisos de quien la llama (la llave
-- publishable), y por eso solo puede hacer los INSERT que ya permite
-- politicas-rls.sql.
--
-- Antes de ejecutarla, confirmar que lineas_pedido.cantidad es entero y
-- que pedidos.total es numerico.

create or replace function registrar_pedido(p_numero text, p_codigo text, p_lineas jsonb)
returns numeric
language plpgsql
security invoker
as $$
declare
  v_total numeric := 0;
  l jsonb;
  v_precio numeric;
  v_agotado boolean;
begin
  if p_lineas is null or jsonb_array_length(p_lineas) = 0 then
    raise exception 'RN-01: el pedido esta vacio';
  end if;

  for l in select * from jsonb_array_elements(p_lineas) loop
    -- RN-02: cantidad entera entre 1 y 99
    if (l->>'cantidad')::int not between 1 and 99 then
      raise exception 'RN-02: cantidad fuera de rango';
    end if;

    select precio, agotado into v_precio, v_agotado
    from productos where sku = l->>'sku';

    -- RN-03: el producto debe existir y no estar agotado
    if v_precio is null or v_agotado then
      raise exception 'RN-03: producto no disponible';
    end if;

    v_total := v_total + v_precio * (l->>'cantidad')::int;
  end loop;

  -- RN-01: minimo de Q400
  if v_total < 400 then
    raise exception 'RN-01: el pedido no llega al minimo';
  end if;

  -- Si el numero ya existe, este INSERT falla con el error 23505.
  -- El navegador lo usa para saber si un reintento ya se habia guardado.
  insert into pedidos (numero, codigo_consejera, total)
  values (p_numero, p_codigo, v_total);

  insert into lineas_pedido (numero_pedido, sku_producto, cantidad, precio_unitario)
  select p_numero, x->>'sku', (x->>'cantidad')::int, pr.precio
  from jsonb_array_elements(p_lineas) x
  join productos pr on pr.sku = x->>'sku';

  return v_total;
end;
$$;

grant execute on function registrar_pedido(text, text, jsonb) to anon;
