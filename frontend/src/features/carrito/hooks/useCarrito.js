import { useEffect, useState } from 'react'
import { precioVigente } from '../../../shared/utils/formato'
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

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
  }, [items]);

  useEffect(() => {
    const faltaImagen = items.some((item) => item.imagen == null)
    if (!faltaImagen) return

    let activo = true
    obtenerProductos()
      .then((productos) => {
        if (!activo) return
        const imagenesPorId = new Map(
          productos.map((producto) => [producto.id, producto.imagen ?? null]),
        )
        setItems((prev) => {
          let huboCambios = false
          const actualizados = prev.map((item) => {
            if (item.imagen != null || !imagenesPorId.has(item.id)) return item
            const imagen = imagenesPorId.get(item.id)
            if (imagen == null) return item
            huboCambios = true
            return { ...item, imagen }
          })
          return huboCambios ? actualizados : prev
        })
      })
      .catch(() => {})

    return () => {
      activo = false
    }
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
    if (cantidad < 1) {
      quitarProducto(id)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Number.isFinite(item.stock) ? Math.min(cantidad, item.stock) : cantidad }
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
  // El subtotal siempre usa el precio vigente (promoción incluida), igual que el backend.
  const subtotal = items.reduce(
    (acumulado, item) => acumulado + precioVigente(item) * item.cantidad,
    0,
  )

  return { items, cantidadTotal, subtotal, agregarProducto, cambiarCantidad, quitarProducto, vaciarCarrito }
}
