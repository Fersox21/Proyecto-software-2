import { useCallback, useEffect, useState } from 'react'
import {
  actualizarOrdenCompra,
  crearOrdenCompra,
  eliminarOrdenCompra,
  obtenerOrdenesCompra,
} from '../services/ordenesCompraService'

// useFetch no permite recargar después de una mutación, así que el listado se
// maneja acá con un contador de recarga.
export function useOrdenesCompra() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let ignorar = false

    obtenerOrdenesCompra()
      .then((datos) => {
        if (ignorar) return
        setOrdenes(Array.isArray(datos) ? datos : [])
        setError(null)
      })
      .catch((nuevoError) => {
        if (ignorar) return
        setOrdenes([])
        setError(nuevoError)
      })
      .finally(() => {
        if (!ignorar) setCargando(false)
      })

    return () => {
      ignorar = true
    }
  }, [recarga])

  const recargar = useCallback(() => {
    setRecarga((numero) => numero + 1)
  }, [])

  const crear = useCallback(
    async (datos) => {
      const resultado = await crearOrdenCompra(datos)
      recargar()
      return resultado
    },
    [recargar],
  )

  const actualizar = useCallback(
    async (id, datos) => {
      const resultado = await actualizarOrdenCompra(id, datos)
      recargar()
      return resultado
    },
    [recargar],
  )

  const eliminar = useCallback(
    async (id) => {
      await eliminarOrdenCompra(id)
      recargar()
    },
    [recargar],
  )

  return { ordenes, cargando, error, recargar, crear, actualizar, eliminar }
}
