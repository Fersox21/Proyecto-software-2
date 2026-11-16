import { useState } from 'react'
import { crearPedido } from '../services/pedidoService'
import { precioVigente } from '../../../shared/utils/formato'
import { COSTO_ENVIO, ENVIO_GRATIS_DESDE } from '../constants'

const DATOS_INICIALES = {
  nombreComercio: '',
  telefono: '',
  personaContacto: '',
  direccion: '',
  descripcionDireccion: '',
  observacionesPedido: ''
}

export function usePedido({ items = [], subtotal = 0, vaciarCarrito }) {
  const [datosPedido, setDatosPedido] = useState(DATOS_INICIALES)
  const [entrega, setEntrega] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [compraConfirmada, setCompraConfirmada] = useState(false)

  const esRetiro = entrega === 'retiro'
  const esEnvio = entrega === 'estandar'
  const envio = esEnvio && subtotal < ENVIO_GRATIS_DESDE ? COSTO_ENVIO : 0
  const total = subtotal + envio
  const faltaParaEnvioGratis = ENVIO_GRATIS_DESDE - subtotal

  function handleChange(e) {
    const { name, value } = e.target
    setDatosPedido((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function handleDireccionChange(direccion) {
    setDatosPedido((prev) => ({
      ...prev,
      direccion
    }))
  }

  function construirPedido() {
    return {
      nombreComercio: datosPedido.nombreComercio,
      telefono: datosPedido.telefono,
      personaContacto: datosPedido.personaContacto,
      metodoEntrega: entrega,
      direccion: datosPedido.direccion,
      descripcionDireccion: datosPedido.descripcionDireccion,
      observacionesPedido: datosPedido.observacionesPedido,
      items: items.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: precioVigente(item)
      })),
      subtotal,
      envio,
      total
    }
  }

  async function handleFinalizarPedido(e) {
    e.preventDefault()

    if (items.length === 0) {
      setError('Tu carrito está vacío. Agregá productos antes de finalizar el pedido.')
      return
    }

    if (!entrega) {
      setError('Elegí un método de entrega para continuar.')
      return
    }

    if (esEnvio && !datosPedido.direccion.trim()) {
      setError('Ingresá la dirección de entrega para continuar.')
      return
    }

    setError(null)
    setEnviando(true)

    try {
      await crearPedido(construirPedido())
      vaciarCarrito()
      setCompraConfirmada(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return {
    datosPedido,
    entrega,
    seleccionarEntrega: setEntrega,
    handleChange,
    handleDireccionChange,
    enviando,
    error,
    compraConfirmada,
    esRetiro,
    esEnvio,
    envio,
    total,
    faltaParaEnvioGratis,
    handleFinalizarPedido
  }
}
