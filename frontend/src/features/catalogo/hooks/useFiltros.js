import { useState } from 'react'

export function useFiltros(productos) {
  const [categoria, setCategoria] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const lista = productos ?? []
  const categorias = [...new Set(lista.map((p) => p.categoria))]
  const textoBuscado = busqueda.trim().toLowerCase()

  const productosFiltrados = lista.filter(
    (p) =>
      (categoria === 'todas' || p.categoria === categoria) &&
      p.nombre.toLowerCase().includes(textoBuscado),
  )

  const hayFiltrosActivos = categoria !== 'todas' || textoBuscado !== ''

  function limpiarFiltros() {
    setCategoria('todas')
    setBusqueda('')
  }

  return {
    categoria,
    setCategoria,
    busqueda,
    setBusqueda,
    categorias,
    productosFiltrados,
    hayFiltrosActivos,
    limpiarFiltros,
  }
}
