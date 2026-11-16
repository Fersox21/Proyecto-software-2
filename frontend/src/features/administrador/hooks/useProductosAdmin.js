import { useState, useEffect, useCallback } from 'react'
import {
  obtenerProductos,
  crearProducto as apiCrearProducto,
  actualizarProducto as apiActualizarProducto,
  eliminarProducto as apiEliminarProducto
} from '../services/productosServices'

export function useProductosAdmin() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [procesandoAccion, setProcesandoAccion] = useState(false)

  const cargarProductos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await obtenerProductos()
      setProductos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  const crearProducto = useCallback(async (datos) => {
    setProcesandoAccion(true)
    try {
      const nuevo = await apiCrearProducto(datos)
      await cargarProductos()
      return nuevo
    } finally {
      setProcesandoAccion(false)
    }
  }, [cargarProductos])

  const actualizarProducto = useCallback(async (id, datos) => {
    setProcesandoAccion(true)
    try {
      const actualizado = await apiActualizarProducto(id, datos)
      await cargarProductos()
      return actualizado
    } finally {
      setProcesandoAccion(false)
    }
  }, [cargarProductos])

  const eliminarProducto = useCallback(async (id) => {
    setProcesandoAccion(true)
    try {
      await apiEliminarProducto(id)
      await cargarProductos()
    } finally {
      setProcesandoAccion(false)
    }
  }, [cargarProductos])

  return {
    productos,
    cargando,
    error,
    procesandoAccion,
    cargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
  }
}
