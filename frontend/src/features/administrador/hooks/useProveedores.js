import { useCallback, useEffect, useState } from 'react'
import {
  actualizarProveedor,
  crearProveedor,
  eliminarProveedor,
  obtenerProveedores,
} from '../services/proveedoresService'

export function useProveedores() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let ignorar = false

    obtenerProveedores()
      .then((datos) => {
        if (ignorar) return
        setProveedores(Array.isArray(datos) ? datos : [])
        setError(null)
      })
      .catch((nuevoError) => {
        if (ignorar) return
        setProveedores([])
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
      const resultado = await crearProveedor(datos)
      recargar()
      return resultado
    },
    [recargar],
  )

  const actualizar = useCallback(
    async (id, datos) => {
      const resultado = await actualizarProveedor(id, datos)
      recargar()
      return resultado
    },
    [recargar],
  )

  const eliminar = useCallback(
    async (id) => {
      await eliminarProveedor(id)
      recargar()
    },
    [recargar],
  )

  return { proveedores, cargando, error, recargar, crear, actualizar, eliminar }
}
