import { useCallback, useEffect, useState } from 'react'
import { actualizarFechaVencimiento, obtenerLotes } from '../services/vencimientosService'

// El listado se maneja con un contador de recarga, igual que useOrdenesCompra:
// useFetch no permite volver a pedir datos después de una mutación.
export function useVencimientos() {
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

  // Reintento manual: muestra el spinner mientras vuelve a cargar.
  const recargar = useCallback(() => {
    setCargando(true)
    setError(null)
    setRecarga((numero) => numero + 1)
  }, [])

  // Refresco posterior a una edición: no reemplaza la tabla por el spinner.
  const refrescar = useCallback(() => {
    setRecarga((numero) => numero + 1)
  }, [])

  const cambiarVencimiento = useCallback(
    async (idLote, fechaVencimiento) => {
      const resultado = await actualizarFechaVencimiento(idLote, fechaVencimiento)
      refrescar()
      return resultado
    },
    [refrescar],
  )

  return { lotes, cargando, error, recargar, refrescar, cambiarVencimiento }
}
