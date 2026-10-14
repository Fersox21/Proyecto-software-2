import { useEffect, useState } from 'react'

const CLAVE_STORAGE = 'distribuidora-lafe:carrito'

function leerCarritoGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    return guardado ? JSON.parse(guardado) : []
  } catch {
    return []
  }
}

export function useCarrito() {
  const [items, setItems] = useState(leerCarritoGuardado);

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
  }, [items]);

  function agregarProducto(producto, cantidad = 1) {
    setItems((prev) => {
      const existente = prev.find((item) => item.id === producto.id);

      if (existente) {
        return prev.map((item) =>
          item === existente
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, item.stock) }
            : item,
        )
      }

      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          preciocosto: producto.preciocosto,
          precioventa: producto.precioventa,
          marca: producto.marca,
          enPromocion: producto.enPromocion,
          precioPromo: producto.precioPromo,
          stock: producto.stock,
          peso: producto.peso,
          categoria: producto.categoria,
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
      prev.map((item) => (item.id === id ? { ...item, cantidad } : item)),
    )
  }

  function quitarProducto(id) {
    setItems((prev) => prev.filter((item) => !(item.id === id)))
  }

  function vaciarCarrito() {
    setItems([])
  }

  const cantidadTotal = items.reduce((acumulado, item) => acumulado + item.cantidad, 0)
  const subtotal = items.reduce((acumulado, item) => acumulado + item.precioventa * item.cantidad, 0)

  return { items, cantidadTotal, subtotal, agregarProducto, cambiarCantidad, quitarProducto, vaciarCarrito }
}
