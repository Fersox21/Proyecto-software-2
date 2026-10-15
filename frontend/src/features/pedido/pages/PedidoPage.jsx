
import { useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { FaRegClock } from 'react-icons/fa'
import { Bs1CircleFill, Bs2CircleFill, Bs3CircleFill, BsCheckLg } from 'react-icons/bs'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import iconoEntregaLocal from '../../../assets/Items/iconoEntregaLocal.svg'
import iconoEntregaDomicilio from '../../../assets/Items/iconoEntregaDomicilio.svg'
import ItemTarjeta from '../../../shared/components/ItemTarjeta'
import EscogerUbicacion from '../../carrito/components/EscogerUbicacion'
import ResumenPedido from '../componets/ResumenPedido'
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
    const [datosPedido, setDatosPedido] = useState({
        nombreComercio: '',
        telefono: '',
        personaContacto: '',
        metodoEntrega: null,
        direccion: '',
        descripcionDireccion: '',
        observacionesPedido: ''
    })

    async function handleFinalizarPedido(e) {
        e.preventDefault(); // Evita que recargue la página por defecto

        // Construimos el DTO que espera el backend
        const pedidoCompleto = {
            nombreComercio: datosPedido.nombreComercio,
            telefono: datosPedido.telefono,
            personaContacto: datosPedido.personaContacto,
            metodoEntrega: entrega,
            direccion: datosPedido.direccion, 
            descripcionDireccion: datosPedido.descripcionDireccion,
            observacionesPedido: datosPedido.observacionesPedido,
            items: items.map(item => ({
                productoId: item.id,
                cantidad: item.cantidad,
                precioUnitario: item.precio
            })),
            subtotal: subtotal,
            envio: envio,
            total: total
        };

        try {
            const response = await fetch('http://localhost:8081/api/pedidos', { // Ajusta tu URL base
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedidoCompleto)
            });

            if (!response.ok) {
                throw new Error('Error al registrar el pedido en el servidor');
            }

            const resultado = await response.json();
            console.log("Pedido guardado con éxito:", resultado);

            // Si todo sale bien, vaciamos el carrito y mostramos el mensaje de éxito
            vaciarCarrito();
            setCompraConfirmada(true);

        }catch (error) {
            console.error("Hubo un problema con la conexión:", error);
            alert("No se pudo procesar tu pedido. Intenta nuevamente.");
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setDatosPedido((prev) => ({
            ...prev,
            [name]: value
        }));
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
                <div className="d-flex align-items-center gap-2 small user-select-none">
                    
                    <div className="d-flex align-items-center gap-2">
                        <span 
                        className="rounded-circle d-inline-flex align-items-center justify-content-center fw-semibold flex-shrink-0 bg-dark text-white" 
                        style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}
                        >
                        <BsCheckLg size={14} />
                        </span>
                        <span className="text-secondary">Carrito</span>
                    </div>

                    <span 
                        className="d-inline-block border-bottom border-dark border-opacity-50" 
                        style={{ width: '40px' }}
                    />

                    <div className="d-flex align-items-center gap-2">
                        <span 
                        className="rounded-circle d-inline-flex align-items-center justify-content-center fw-semibold flex-shrink-0 text-white"
                        style={{ width: '28px', height: '28px', fontSize: '0.85rem', backgroundColor: '#c59b27' }}
                        >
                        2
                        </span>
                        <span className="fw-semibold text-dark">Datos y entrega</span>
                    </div>

                    <span 
                        className="d-inline-block border-bottom border-dark border-opacity-50" 
                        style={{ width: '40px' }}
                    />

                    <div className="d-flex align-items-center gap-2">
                        <span 
                        className="rounded-circle d-inline-flex align-items-center justify-content-center fw-semibold flex-shrink-0 bg-dark bg-white text-secondary border border-secondary border-opacity-25" 
                        style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}
                        >
                        3
                        </span>
                        <span className="text-secondary">Confirmación</span>
                    </div>

                    </div>
            </header>

            <hr className="text-secondary opacity-25" style={{width: '100%'}}></hr>

            <form onSubmit={handleFinalizarPedido}>
                <div className="row g-4">
                    <div className="col-12 col-lg-7 d-flex flex-column gap-4">
                        {/* DATOS DEL COMERCIO */}
                            <div className="card rounded-5 p-4 border-0 shadow-sm">
                                <div className="d-flex gap-2">
                                    <Bs1CircleFill size={33} className="text-dark mb-2"/>
                                    <div>
                                        <h5 className="fw-bold">Datos del comercio</h5>
                                        <p className="small">Usaremos estos datos para identificar tu pedido.</p>
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-12 col-md-12">
                                        <label className="form-label small fw-semibold">Nombre del comercio</label>
                                        <input
                                        type="text"
                                        name="nombreComercio"
                                        className="form-control input-form rounded-5"
                                        required
                                        value={datosPedido.nombreComercio}
                                        onChange={handleChange}
                                        />
                                        <p className="small">Ej. Panaderia La Espiga</p>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Teléfono</label>
                                        <input
                                        type="tel"
                                        name="telefono"
                                        className="form-control input-form rounded-5"
                                        required
                                        value={datosPedido.telefono}
                                        onChange={handleChange}
                                        />
                                        <p className="small">Ej. 2664123456</p>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Persona de contacto</label>
                                        <input
                                        type="text"
                                        name="personaContacto"
                                        className="form-control input-form rounded-5"
                                        required
                                        value={datosPedido.personaContacto}
                                        onChange={handleChange}
                                        />
                                        <p className="small">Ej. Pedro Álvarez</p>
                                    </div>
                                </div>
                            </div>

                        {/* METODO DE ENTREGA */}
                        <div className="card rounded-5 p-4 border-0 shadow-sm">
                            <div className="card-entrega">
                                <div className="d-flex gap-2">
                                    <Bs2CircleFill size={33} className="text-dark mb-2"/>
                                    <div>
                                        <h5 className="fw-bold">Método de entrega</h5>
                                        <p className="small">Elegí si retirás por la distribuidora o te lo enviamos.</p>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col-12 col-md-6">
                                        <ItemTarjeta
                                        titulo="Retiro en distribuidora"
                                        icono={iconoEntregaLocal}
                                        texto="Av. Juan Gilberto Funes 460"
                                        descripcion="Listo en 2 horas"
                                        seleccionado={entrega === 'retiro'}
                                        onSelect={() => setEntrega('retiro')}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <ItemTarjeta
                                        titulo="Envío estándar"
                                        icono={iconoEntregaDomicilio}
                                        texto="Entrega a domicilio"
                                        descripcion="Se entregará en 1-2 días hábiles"
                                        seleccionado={entrega === 'estandar'}
                                        onSelect={() => setEntrega('estandar')}
                                        />
                                    </div>
                                </div>                                
                            </div>

                            {esRetiro && (
                                <div className="bg-secondary-subtle rounded-4 px-4 py-2 m-auto">
                                    <FaRegClock/><p className="m-2 d-inline">Horario</p>
                                    <p className="small my-2">Lunes a Viernes 8:00-16:00 · Sábado 9:00-13:00</p>
                                </div>
                            )}

                            {esEnvio && (
                                <>
                                    <EscogerUbicacion />
                                    <div className="mt-2">
                                        <label className="form-label small fw-semibold">Información adicional para llegar a la ubicación</label>
                                        <textarea 
                                        name="descripcionDireccion"
                                        rows={3}
                                        className="form-control input-form"
                                        value={datosPedido.descripcionDireccion}
                                        style={{ resize: 'none' }}
                                        onChange={handleChange}
                                        />
                                        <p className="small">Ej. Es sobre el pasaje Sarmiento</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* INDICACIONES ADICIONALES */}
                        <div className="card rounded-5 p-4 border-0 shadow-sm">
                            <div className="d-flex gap-2">
                                <Bs3CircleFill size={33} className="text-dark mb-2"/>
                                <div>
                                    <h5 className="fw-bold">Indicaciones adicionales</h5>
                                    <p className="small text-body-secondary mb-3">Contanos cualquier detalle útil para preparar o entregar tu pedido.</p>
                                </div>
                            </div>
                            <textarea
                            name="observacionesPedido"
                            rows={3}
                            className="form-control"
                            value={datosPedido.observacionesPedido}
                            style={{ resize: 'none' }}
                            onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* RESUMEN DEL PEDIDO */}
                    <div className="col-12 col-lg-5 align-self-stretch">
                        <ResumenPedido
                            items={items}
                            cantidadTotal={cantidadTotal}
                            subtotal={subtotal}
                            total={total}
                            envio={envio}
                            esRetiro={esRetiro}
                            esEnvio={esEnvio}
                            faltaParaEnvioGratis={faltaParaEnvioGratis}
                        />
                    </div>
                </div>
            </form>
        </div>
    </>);
}

export default FormularioPedido;