import { useState, useEffect, useCallback } from 'react'
import {
  obtenerPedidos,
  obtenerPedidoPorId,
  aceptarPedido as apiAceptarPedido,
  cancelarPedido as apiCancelarPedido
} from '../services/pedidosService'

export function usePedidosAdmin() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [pedidoDetalle, setPedidoDetalle] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState(null)

  const [procesandoAccion, setProcesandoAccion] = useState(false)

  const cargarPedidos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await obtenerPedidos()
      setPedidos(Array.isArray(data) ? data : (data?.pedidos || []))
    } catch (err) {
      setError(err)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarPedidos()
  }, [cargarPedidos])

  const cargarDetallePedido = useCallback(async (id) => {
    setCargandoDetalle(true)
    setErrorDetalle(null)
    try {
      const data = await obtenerPedidoPorId(id)
      setPedidoDetalle(data)
      return data
    } catch (err) {
      setErrorDetalle(err.message || 'Error al obtener detalle del pedido')
      throw err
    } finally {
      setCargandoDetalle(false)
    }
  }, [])

  const cerrarDetalle = useCallback(() => {
    setPedidoDetalle(null)
    setErrorDetalle(null)
  }, [])

  const aceptarPedido = useCallback(async (id) => {
    setProcesandoAccion(true)
    try {
      await apiAceptarPedido(id)
      await cargarPedidos()
      if (pedidoDetalle?.id === id) {
        await cargarDetallePedido(id)
      }
    } finally {
      setProcesandoAccion(false)
    }
  }, [cargarPedidos, pedidoDetalle, cargarDetallePedido])

  const cancelarPedido = useCallback(async (id, motivoRechazo) => {
    setProcesandoAccion(true)
    try {
      await apiCancelarPedido(id, motivoRechazo)
      await cargarPedidos()
      if (pedidoDetalle?.id === id) {
        await cargarDetallePedido(id)
      }
    } finally {
      setProcesandoAccion(false)
    }
  }, [cargarPedidos, pedidoDetalle, cargarDetallePedido])

  return {
    pedidos,
    cargando,
    error,
    pedidoDetalle,
    cargandoDetalle,
    errorDetalle,
    procesandoAccion,
    cargarPedidos,
    cargarDetallePedido,
    cerrarDetalle,
    aceptarPedido,
    cancelarPedido
  }
}
