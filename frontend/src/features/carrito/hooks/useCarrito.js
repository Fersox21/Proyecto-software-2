import { useCallback, useEffect, useRef, useState } from 'react'
import { obtenerPreciosProducto, precioVigente, redondear2 } from '../../../shared/utils/formato'
import { obtenerProductos } from '../../catalogo/services/catalogoService'

const CLAVE_STORAGE = 'distribuidora-lafe:carrito'

function leerCarritoGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    const items = guardado ? JSON.parse(guardado) : []

    if (!Array.isArray(items)) return []

    return items.filter(
      (item) => item && typeof item === 'object' && item.id != null && Number.isFinite(item.cantidad),
    )
  } catch {
    return []
  }
}

// Datos del producto que se guardan en el carrito. Se refrescan cada vez que
// el usuario vuelve a agregarlo, para no quedarse con una promo vencida.
function instantaneaProducto(producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    precioCosto: producto.precioCosto,
    precioVenta: producto.precioVenta,
    marca: producto.marca,
    enPromocion: producto.enPromocion,
    precioPromo: producto.precioPromo,
    stock: producto.stock,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    imagen: producto.imagen ?? null,
  }
}

export function useCarrito() {
  const [items, setItems] = useState(leerCarritoGuardado);
  const [avisoProductosRemovidos, setAvisoProductosRemovidos] = useState(false);
  const itemsRef = useRef(items);
  const verificandoRef = useRef(false);

  itemsRef.current = items;

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
  }, [items]);

  const verificarDisponibilidad = useCallback(async () => {
    if (itemsRef.current.length === 0 || verificandoRef.current) return;
    verificandoRef.current = true;

    try {
      const productos = await obtenerProductos();
      const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));

      const hayNoDisponibles = itemsRef.current.some((item) => {
        const productoActual = productosPorId.get(item.id);
        return !productoActual || Number(productoActual.stock) <= 0;
      });

      setItems((prev) => {
        if (prev.length === 0) return prev;
        let huboCambios = false;
        const actualizados = [];

        for (const item of prev) {
          const productoActual = productosPorId.get(item.id);
          if (!productoActual || Number(productoActual.stock) <= 0) {
            huboCambios = true;
            continue;
          }

          if (item.imagen == null && productoActual.imagen != null) {
            huboCambios = true;
            actualizados.push({ ...item, imagen: productoActual.imagen });
          } else {
            actualizados.push(item);
          }
        }

        return huboCambios ? actualizados : prev;
      });

      if (hayNoDisponibles) {
        setAvisoProductosRemovidos(true);
      }
    } catch {
      // Si falla la consulta al catálogo, se conserva el carrito actual.
    } finally {
      verificandoRef.current = false;
    }
  }, []);

  useEffect(() => {
    verificarDisponibilidad();
  }, [verificarDisponibilidad]);

  useEffect(() => {
    if (!avisoProductosRemovidos) return;
    const timer = setTimeout(() => {
      setAvisoProductosRemovidos(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [avisoProductosRemovidos]);

  const cerrarAvisoRemovidos = useCallback(() => {
    setAvisoProductosRemovidos(false);
  }, []);

  function agregarProducto(producto, cantidad = 1) {
    setItems((prev) => {
      const existente = prev.find((item) => item.id === producto.id);

      if (existente) {
        return prev.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                ...instantaneaProducto(producto),
                cantidad: Math.min(item.cantidad + cantidad, producto.stock),
              }
            : item,
        )
      }

      return [
        ...prev,
        {
          ...instantaneaProducto(producto),
          cantidad,
        },
      ]
    })
  }

  function cambiarCantidad(id, cantidad) {
    const numero = Number(cantidad)
    if (!Number.isFinite(numero)) return
    const entera = Math.trunc(numero)
    if (entera < 1) {
      quitarProducto(id)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Number.isFinite(item.stock) ? Math.min(entera, item.stock) : entera }
          : item,
      ),
    )
  }

  function quitarProducto(id) {
    setItems((prev) => prev.filter((item) => !(item.id === id)))
  }

  function vaciarCarrito() {
    setItems([])
  }

  const cantidadTotal = items.reduce((acumulado, item) => acumulado + item.cantidad, 0)
  const subtotalOriginal = redondear2(
    items.reduce((acumulado, item) => {
      const { precioNormal } = obtenerPreciosProducto(item)
      return acumulado + (Number.isFinite(precioNormal) ? precioNormal : 0) * item.cantidad
    }, 0),
  )
  // El subtotal siempre usa el precio vigente (promoción incluida), igual que el backend.
  const subtotal = redondear2(
    items.reduce(
      (acumulado, item) => acumulado + precioVigente(item) * item.cantidad,
      0,
    ),
  )
  const descuentosAplicados = redondear2(Math.max(0, subtotalOriginal - subtotal))

  return {
    items,
    cantidadTotal,
    subtotal,
    subtotalOriginal,
    descuentosAplicados,
    avisoProductosRemovidos,
    cerrarAvisoRemovidos,
    verificarDisponibilidad,
    agregarProducto,
    cambiarCantidad,
    quitarProducto,
    vaciarCarrito,
  }
}
