import { useCallback, useEffect, useState } from 'react'
import {
  actualizarLote,
  crearLote,
  eliminarLote,
  obtenerLotes,
} from '../services/lotesService'

// useFetch no permite recargar después de una mutación, así que el listado se
// maneja con un contador de recarga, igual que useOrdenesCompra.
export function useLotes() {
  const [lotes, setLotes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let ignorar = false

    obtenerLotes()
      .then((datos) => {
        if (ignorar) return
        setLotes(Array.isArray(datos) ? datos : [])
        setError(null)
      })
      .catch((nuevoError) => {
        if (ignorar) return
        setLotes([])
        setError(nuevoError)
      })
      .finally(() => {
        if (!ignorar) setCargando(false)
      })

    return () => {
      ignorar = true
    }
  }, [recarga])

  // Reintento manual: vuelve a mostrar el spinner.
  const recargar = useCallback(() => {
    setCargando(true)
    setError(null)
    setRecarga((numero) => numero + 1)
  }, [])

  // Refresco posterior a una mutación: no reemplaza la tabla por el spinner.
  const refrescar = useCallback(() => {
    setRecarga((numero) => numero + 1)
  }, [])

  const crear = useCallback(
    async (datos) => {
      const resultado = await crearLote(datos)
      refrescar()
      return resultado
    },
    [refrescar],
  )

  const actualizar = useCallback(
    async (id, datos) => {
      const resultado = await actualizarLote(id, datos)
      refrescar()
      return resultado
    },
    [refrescar],
  )

  const eliminar = useCallback(
    async (id) => {
      await eliminarLote(id)
      refrescar()
    },
    [refrescar],
  )

  return { lotes, cargando, error, recargar, crear, actualizar, eliminar }
}
