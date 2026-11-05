import { useCallback, useEffect, useState } from 'react'
import {
  leerTema,
  leerFuente,
  guardarTema,
  guardarFuente,
  aplicarPreferencias,
} from '../utils/preferencias'

// Hook de preferencias de interfaz: tema (claro/oscuro/sistema) y tamaño de fuente.
// Mantiene el estado en sincronía con los atributos de <html> que lee el CSS.
export function usePreferencias() {
  const [tema, setTema] = useState(leerTema)
  const [fuente, setFuente] = useState(leerFuente)

  // Aplica los cambios en los atributos de <html>.
  useEffect(() => {
    aplicarPreferencias(tema, fuente)
  }, [tema, fuente])

  // Si el tema es "sistema", reacciona a cambios del sistema operativo en vivo.
  useEffect(() => {
    if (tema !== 'sistema') return

    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    const manejarCambio = () => aplicarPreferencias(tema, fuente)

    consulta.addEventListener('change', manejarCambio)
    return () => consulta.removeEventListener('change', manejarCambio)
  }, [tema, fuente])

  const cambiarTema = useCallback((nuevoTema) => {
    guardarTema(nuevoTema)
    setTema(nuevoTema)
  }, [])

  const cambiarFuente = useCallback((nuevaFuente) => {
    guardarFuente(nuevaFuente)
    setFuente(nuevaFuente)
  }, [])

  const restablecer = useCallback(() => {
    guardarTema('sistema')
    guardarFuente('normal')
    setTema('sistema')
    setFuente('normal')
  }, [])

  return { tema, fuente, cambiarTema, cambiarFuente, restablecer }
}
