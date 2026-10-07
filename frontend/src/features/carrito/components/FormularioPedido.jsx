
import { useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { FaRegClock } from 'react-icons/fa'
import { formatearPrecio } from '../../../shared/utils/formato'
import iconoEntregaLocal from '../../../assets/Items/iconoEntregaLocal.svg'
import iconoEntregaDomicilio from '../../../assets/Items/iconoEntregaDomicilio.svg'
import ItemTarjeta from '../../../shared/components/ItemTarjeta'
import EscogerUbicacion from './EscogerUbicacion'
import ResumenPedido from './ResumenPedido'
import '../../../styles/formulario.css'

const ENVIO_GRATIS_DESDE = 60000
const COSTO_ENVIO = 1800

function FormularioPedido(){
    const { items, cantidadTotal, subtotal, vaciarCarrito } = useOutletContext();
    const [entrega, setEntrega] = useState(null)
    const esRetiro = entrega === 'retiro'
    const esEnvio = entrega === 'estandar'
    const envio = subtotal >= ENVIO_GRATIS_DESDE || !esEnvio ? 0 : COSTO_ENVIO
    const faltaParaEnvioGratis = ENVIO_GRATIS_DESDE - subtotal
    const total = subtotal + envio
    const [compraConfirmada, setCompraConfirmada] = useState(false);

    function handleFinalizar() {
        vaciarCarrito();
        setCompraConfirmada(true);
    }

    if (compraConfirmada) {
        return (
        <MensajeVacio titulo="¡Gracias por tu compra!" texto="Te enviamos un email con el detalle del pedido.">
            <Link to="/catalogo" className="btn btn-dark">
            Seguir comprando
            </Link>
        </MensajeVacio>
        )
    }

    return (
    <>
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
                <div className="d-flex align-items-center gap-3">
                    Carrito ------ Datos y Entrega ------ Confirmacion
                </div>
            </header>

            <hr className="text-secondary opacity-25" style={{width: '100%'}}></hr>

            <div className="row g-4">
                <div className="col-12 col-lg-7 d-flex flex-column gap-4">
                    <div className="card rounded-4 p-4 border-0 shadow-sm">
                        <h5 className="fw-bold">Datos del comercio</h5>
                    </div>

                    <div className="card rounded-4 p-4 border-0 shadow-sm">
                        <div className="card-entrega">
                            <h5 className="fw-bold">Método de entrega</h5>
                            <p className="small">Elegí si retirás por la distribuidora o te lo enviamos.</p>
                            <ItemTarjeta
                            titulo="Retiro en distribuidora"
                            icono={iconoEntregaLocal}
                            texto="Av. Juan Gilberto Funes 460"
                            descripcion="Listo en 2 horas"
                            seleccionado={entrega === 'retiro'}
                            onSelect={() => setEntrega('retiro')}
                            />
                            <ItemTarjeta
                            titulo="Envío estándar"
                            icono={iconoEntregaDomicilio}
                            texto="Entrega a domicilio"
                            descripcion="Se entregará en 1-2 días hábiles"
                            seleccionado={entrega === 'estandar'}
                            onSelect={() => setEntrega('estandar')}
                            />
                        </div>

                        {esRetiro && (
                            <div className="bg-secondary-subtle rounded-4 px-4 py-2 m-auto">
                                <FaRegClock/><p className="m-2 d-inline">Horario</p>
                                <p className="small my-2">Lun a Vie 8:00-16:00 · Sáb 9:00-13:00</p>
                            </div>
                        )}

                        {esEnvio && (
                            <>
                                <EscogerUbicacion />
                                <div className="bg-secondary-subtle rounded-4 px-4 py-2 mt-3 m-auto">
                                    <FaRegClock/><p className="m-2 d-inline">Horario</p>
                                    <p className="small my-2">Lun a Vie 8:00-16:00 · Sáb 9:00-13:00</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="card rounded-4 p-4 border-0 shadow-sm">
                        <h5 className="fw-bold">Indicaciones adicionales</h5>
                        <p className="small">Contanos cualquier detalle útil para preparar o entregar tu pedido.</p>
                    </div>
                </div>

                <div className="col-12 col-lg-5 align-self-stretch">
                    <ResumenPedido
                        items={items}
                        cantidadTotal={cantidadTotal}
                        subtotal={subtotal}
                        total={total}
                        envio={envio}
                        esRetiro={esRetiro}
                        faltaParaEnvioGratis={faltaParaEnvioGratis}
                    />
                </div>
            </div>
        </div>
    </>);
}

export default FormularioPedido;