import { useState, useEffect, useCallback } from 'react'
import {
  obtenerPedidos,
  obtenerPedidoPorId,
  modificarTotalPedido as apiModificarTotalPedido,
  aceptarPedido as apiAceptarPedido,
  cancelarPedido as apiCancelarPedido
} from '../services/pedidosService'

const ESTADOS_PENDIENTES = ['pendiente', 'nuevo']

const esPedidoPendiente = (pedido) =>
  ESTADOS_PENDIENTES.includes(String(pedido?.estado || '').toLowerCase())

export function usePedidosAdmin() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [pedidoDetalle, setPedidoDetalle] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState(null)

  const [procesandoAccion, setProcesandoAccion] = useState(false)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let ignorar = false

    obtenerPedidos()
      .then((data) => {
        if (ignorar) return
        const lista = Array.isArray(data) ? data : (data?.pedidos || [])
        setPedidos(lista.filter(esPedidoPendiente))
        setError(null)
      })
      .catch((err) => {
        if (ignorar) return
        setError(err)
      })
      .finally(() => {
        if (!ignorar) setCargando(false)
      })

    return () => {
      ignorar = true
    }
  }, [recarga])

  const cargarPedidos = useCallback(async () => {
    setCargando(true)
    setError(null)
    setRecarga((n) => n + 1)
  }, [])

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

  const modificarTotalPedido = useCallback(async (id, datosModificacion) => {
    setProcesandoAccion(true)
    try {
      await apiModificarTotalPedido(id, datosModificacion)
      await cargarPedidos()
      if (pedidoDetalle?.id === id) {
        await cargarDetallePedido(id)
      }
    } finally {
      setProcesandoAccion(false)
    }
  }, [cargarPedidos, pedidoDetalle, cargarDetallePedido])

  const aceptarPedido = useCallback(async (id, datosModificacion = null, asignacionesLotes = null) => {
    setProcesandoAccion(true)
    try {
      await apiAceptarPedido(id, datosModificacion, asignacionesLotes)
      setPedidos((prev) => prev.filter((p) => p.id !== id))
      if (pedidoDetalle?.id === id) {
        cerrarDetalle()
      }
    } finally {
      setProcesandoAccion(false)
    }
  }, [pedidoDetalle, cerrarDetalle])

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
    modificarTotalPedido,
    aceptarPedido,
    cancelarPedido
  }
}
