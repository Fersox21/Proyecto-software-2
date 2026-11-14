import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import { textoDias } from '../../utils/vencimientos'

function Dato({ etiqueta, children }) {
  return (
    <div className="venc-dato">
      <dt>{etiqueta}</dt>
      <dd>{children ?? '—'}</dd>
    </div>
  )
}

function DetalleLote({ lote }) {
  const producto = lote.producto ?? {}
  const proveedor = lote.ordenCompra?.proveedor ?? {}
  const ordenCompra = lote.ordenCompra ?? {}

  return (
    <div className="venc-detalle">
      <section className="venc-detalle-bloque" aria-labelledby={`venc-lote-${lote.id}`}>
        <h3 className="venc-detalle-titulo" id={`venc-lote-${lote.id}`}>
          Lote #{lote.id}
        </h3>
        <dl className="venc-detalle-datos">
          <Dato etiqueta="Cantidad">{lote.cantidad ?? '—'}</Dato>
          <Dato etiqueta="Fecha de arribo">{formatearFecha(lote.fechaArribo)}</Dato>
          <Dato etiqueta="Fecha de vencimiento">{formatearFecha(lote.fechaVencimiento)}</Dato>
          <Dato etiqueta="Situación">
            {lote.estado?.etiqueta} · {textoDias(lote.dias)}
          </Dato>
        </dl>
      </section>

      <section className="venc-detalle-bloque" aria-labelledby={`venc-producto-${lote.id}`}>
        <h3 className="venc-detalle-titulo" id={`venc-producto-${lote.id}`}>
          Producto
        </h3>
        <dl className="venc-detalle-datos">
          <Dato etiqueta="Nombre">{producto.nombre}</Dato>
          <Dato etiqueta="Marca">{producto.marca}</Dato>
          <Dato etiqueta="Categoría">{producto.categoria}</Dato>
          <Dato etiqueta="Presentación">{producto.peso}</Dato>
          <Dato etiqueta="Stock actual">{producto.stock ?? '—'}</Dato>
        </dl>
      </section>

      <section className="venc-detalle-bloque" aria-labelledby={`venc-proveedor-${lote.id}`}>
        <h3 className="venc-detalle-titulo" id={`venc-proveedor-${lote.id}`}>
          Proveedor
        </h3>
        <dl className="venc-detalle-datos">
          <Dato etiqueta="Razón social">{proveedor.nombre}</Dato>
          <Dato etiqueta="Teléfono">{proveedor.telefono}</Dato>
        </dl>
      </section>

      <section className="venc-detalle-bloque" aria-labelledby={`venc-orden-${lote.id}`}>
        <h3 className="venc-detalle-titulo" id={`venc-orden-${lote.id}`}>
          Orden de compra
        </h3>
        <dl className="venc-detalle-datos">
          <Dato etiqueta="Número">{ordenCompra.id != null ? `#${ordenCompra.id}` : '—'}</Dato>
          <Dato etiqueta="Fecha">{formatearFecha(ordenCompra.fecha)}</Dato>
          <Dato etiqueta="Total">
            {ordenCompra.total != null ? formatearPrecio(ordenCompra.total) : '—'}
          </Dato>
        </dl>
      </section>
    </div>
  )
}

export default DetalleLote
