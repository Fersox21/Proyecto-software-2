import { useCallback, useEffect, useState } from 'react'

export function useHistorial(fetcher, activo = true) {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    if (!activo) return
    let ignorar = false
    setCargando(true)
    setError(null)

    fetcher()
      .then((res) => {
        if (ignorar) return
        setDatos(Array.isArray(res) ? res : [])
      })
      .catch((err) => {
        if (ignorar) return
        setDatos([])
        setError(err)
      })
      .finally(() => {
        if (!ignorar) setCargando(false)
      })

    return () => {
      ignorar = true
    }
  }, [activo, fetcher, recarga])

  const recargar = useCallback(() => {
    setRecarga((n) => n + 1)
  }, [])

  return { datos, cargando, error, recargar }
}
