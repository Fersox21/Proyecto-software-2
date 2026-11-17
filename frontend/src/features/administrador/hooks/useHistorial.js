import { useCallback, useEffect, useState } from 'react'

export function useHistorial(fetcher, activo = true) {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(Boolean(activo))
  const [error, setError] = useState(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    if (!activo) return
    let ignorar = false

    fetcher()
      .then((res) => {
        if (ignorar) return
        setDatos(Array.isArray(res) ? res : [])
        setError(null)
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
    setCargando(true)
    setError(null)
    setRecarga((n) => n + 1)
  }, [])

  return { datos, cargando, error, recargar }
}
