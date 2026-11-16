import { formatearPrecio, obtenerPreciosProducto, redondear2 } from '../../../shared/utils/formato'

function ItemPedido({ item }){
    const nombreImagen = item.nombre
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, '')

    const imagenUrl = `/images/${nombreImagen}.webp`

    const { precioNormal, enPromocion, descuento, precioVigente } = obtenerPreciosProducto(item)

    return (
        <li className="list-group-item py-2">
            <div className="row align-items-center g-2">
                <div className="col-12 col-md-7 d-flex align-items-center gap-3">
                    <div className="position-relative flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                        <img
                            src={imagenUrl}
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
                        {item.peso && (
                        <p className="mb-1 text-body-secondary small" style={{ fontSize: '0.7rem'}}>
                            {item.peso} · {item.cantidad} unidades
                        </p>
                        )}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            {enPromocion && (
                                <del className="pedido-precio-anterior">
                                    <span className="visually-hidden">Precio anterior: </span>
                                    {formatearPrecio(precioNormal)}
                                </del>
                            )}
                            <span className={`fuente-titulos ${enPromocion ? 'pedido-precio-promo fs-6' : 'text-body-secondary small'}`}>
                                {formatearPrecio(precioVigente)}
                            </span>
                            {enPromocion && (
                                <span className="badge pedido-etiqueta-promo">
                                    -{descuento}%<span className="visually-hidden"> de descuento</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
        
                <div className="col-4 col-md-5 text-end">
                    <span className="text-dark fs-5 fuente-titulos">
                        {formatearPrecio(redondear2(precioVigente * item.cantidad))}
                    </span>
                </div>
            </div>
        </li>
    )
}

export default ItemPedido