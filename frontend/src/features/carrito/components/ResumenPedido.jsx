import ItemPedido from './ItemPedido'
import { formatearPrecio } from '../../../shared/utils/formato'
import { Link } from 'react-router'
import { BsShieldCheck } from 'react-icons/bs';

function ResumenPedido({ items, cantidadTotal, subtotal, total, envio, esRetiro, faltaParaEnvioGratis }) {
    return (
        <div className="card rounded-4 p-4 border-0 shadow-sm sticky-top" style={{ top: '2rem' }}>
            <div className="d-flex justify-content-between">
                <h5 className="fw-semibold">Tu pedido</h5>
                <Link to="/carrito" className="text-decoration-none text-dark small">Editar carrito</Link>
            </div>        
            <div>
                <ul className="p-0">
                    {items.map((prod) => (
                        <ItemPedido
                            key={prod.id}
                            item={prod}
                            cantidad={prod.cantidad}
                        />
                    ))}
                </ul>
            </div>
            <hr className="my-2 text-secondary opacity-25" />
            <div>
                <div className="card-body">
                    <dl className="row mb-0 text-start">
                        <dt className="col-7 fw-normal" style={{ fontSize: '0.9rem'}}>Subtotal ({cantidadTotal} productos)</dt>
                        <dd className="col-5 text-end fuente-titulos">{formatearPrecio(subtotal)}</dd>
                        {!esRetiro && (
                            <>
                                <dt className="col-7 fw-normal">Envío</dt>
                                <dd className="col-5 text-end fuente-titulos">{envio === 0 ? 'Gratis' : formatearPrecio(envio)}</dd>
                            </>
                        )}

                        <hr className="my-3 text-secondary opacity-25" />
                                    
                        <div className="d-flex align-items-center pt-2">
                            <dt className="col-7 fw-bold fuente-titulos">Total</dt>
                            <dd className="col-5 text-end h2 fuente-titulos">{formatearPrecio(total)}</dd>
                        </div>
                        {!esRetiro && faltaParaEnvioGratis > 0 && (
                            <p className="small text-body-secondary fuente-titulos m-auto">
                                Te faltan {formatearPrecio(faltaParaEnvioGratis)} para el envío gratis.
                            </p>
                        )}
                    </dl>
                </div>
            </div>
            <div className="d-flex gap-2 m-auto">
                <BsShieldCheck /><p className="small">Tus datos se usan solo para gestionar el pedido</p>
            </div>
        </div>
    )
}

export default ResumenPedido