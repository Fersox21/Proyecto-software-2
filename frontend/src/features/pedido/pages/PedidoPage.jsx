import { Link, useOutletContext } from 'react-router'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import ProgresoCompra from '../components/ProgresoCompra'
import DatosComercioForm from '../components/DatosComercioForm'
import MetodoEntregaForm from '../components/MetodoEntregaForm'
import ObservacionesForm from '../components/ObservacionesForm'
import ResumenPedido from '../components/ResumenPedido'
import { usePedido } from '../hooks/usePedido'
import '../../../styles/formulario.css'

function PedidoPage() {
  const { items, cantidadTotal, subtotal, subtotalOriginal, descuentosAplicados, vaciarCarrito } = useOutletContext()

  const {
    datosPedido,
    entrega,
    seleccionarEntrega,
    handleChange,
    handleDireccionChange,
    enviando,
    error,
    compraConfirmada,
    esRetiro,
    esEnvio,
    subtotalOriginal: subtotalSinDescuento,
    descuentosAplicados: descuentosPedido,
    envio,
    total,
    faltaParaEnvioGratis,
    handleFinalizarPedido
  } = usePedido({ items, subtotal, subtotalOriginal, descuentosAplicados, vaciarCarrito })

  if (compraConfirmada) {
    return (
      <MensajeVacio
        titulo="¡Gracias por tu pedido!"
        texto="Registramos tu solicitud. Nos vamos a contactar por teléfono para confirmar y coordinar la entrega."
      >
        <Link to="/catalogo" className="btn btn-dark">
          Seguir comprando
        </Link>
      </MensajeVacio>
    )
  }

  if (items.length === 0) {
    return (
      <MensajeVacio
        titulo="Tu carrito está vacío"
        texto="Agregá productos desde el catálogo antes de finalizar tu pedido."
      >
        <Link to="/catalogo" className="btn btn-dark">
          Ir al catálogo
        </Link>
      </MensajeVacio>
    )
  }

  return (
    <div className="container my-5">
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
        <div>
          <Link to="/carrito" className="text-decoration-none small text-body-secondary mb-2 d-inline-block">
            ← Volver al carrito
          </Link>
          <h1 className="h1 mb-1 text-start fw-bold">Finalizar compra</h1>
          <p className="text-body-secondary mb-0">
            Completá los datos de tu comercio y elegí cómo querés recibir el pedido.
          </p>
        </div>
        <ProgresoCompra />
      </header>

      <hr className="text-secondary opacity-25" style={{ width: '100%' }} />

      <form onSubmit={handleFinalizarPedido}>
        <div className="row g-4">
          <div className="col-12 col-lg-7 d-flex flex-column gap-4">
            <DatosComercioForm datosPedido={datosPedido} onChange={handleChange} />

            <MetodoEntregaForm
              entrega={entrega}
              onSeleccionarEntrega={seleccionarEntrega}
              datosPedido={datosPedido}
              onChange={handleChange}
              onDireccionChange={handleDireccionChange}
              esRetiro={esRetiro}
              esEnvio={esEnvio}
            />

            <ObservacionesForm datosPedido={datosPedido} onChange={handleChange} />
          </div>

          <div className="col-12 col-lg-5 align-self-stretch">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <ResumenPedido
              items={items}
              cantidadTotal={cantidadTotal}
              subtotal={subtotal}
              subtotalOriginal={subtotalSinDescuento}
              descuentosAplicados={descuentosPedido}
              total={total}
              envio={envio}
              esEnvio={esEnvio}
              faltaParaEnvioGratis={faltaParaEnvioGratis}
              enviando={enviando}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default PedidoPage
