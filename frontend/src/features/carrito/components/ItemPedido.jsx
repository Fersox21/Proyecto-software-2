import { formatearPrecio } from '../../../shared/utils/formato'

function ItemPedido({ item }){
    return (
        <li className="list-group-item py-2">
            <div className="row align-items-center g-2">
                <div className="col-12 col-md-7 d-flex align-items-center gap-3">
                    <div className="position-relative flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                        <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="border border-dark border-opacity-25 rounded-4 object-fit-cover w-100 h-100"
                        />

                        <span className="badge-cantidad-pedido position-absolute top-0 end-0 bg-dark text-white fw-bold d-flex align-items-center justify-content-center">
                            {item.cantidad}
                        </span>
                    </div>
                    <div className="text-start d-flex flex-column justify-content-center">
                        {item.categoria && (
                        <span
                            className="text-uppercase text-body-secondary fw-semibold mb-1"
                            style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}
                        >
                            {item.categoria}
                        </span>
                        )}
                        <h6 className="mb-1 fs-5 lh-sm fuente-titulos fw-medium">
                        {item.nombre}
                        </h6>
                        {item.descripcion && (
                        <p className="mb-1 text-body-secondary small" style={{ fontSize: '0.7rem'}}>
                            {item.descripcion} · {item.cantidad} x {formatearPrecio(item.precio)}
                        </p>
                        )}
                    </div>
                </div>
        
                <div className="col-4 col-md-5 text-end text-end">
                    <span className="text-dark fs-5 fuente-titulos">
                        {formatearPrecio(item.precio * item.cantidad)}
                    </span>
                </div>
            </div>
        </li>
    )
}

export default ItemPedido