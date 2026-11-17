import { LuPencil, LuTrash2 } from 'react-icons/lu'
import {
  formatearPrecio,
  manejarErrorImagenProducto,
  obtenerUrlImagenProducto,
} from '../../../../shared/utils/formato'

function obtenerEstadoStock(stock) {
  const cantidad = Number(stock) || 0
  if (cantidad < 10) return { texto: 'Stock bajo', clase: 'prod-badge-bajo' }
  if (cantidad <= 20) return { texto: 'Stock suficiente', clase: 'prod-badge-suficiente' }
  return { texto: 'Stock alto', clase: 'prod-badge-alto' }
}

function obtenerNombreCategoria(categoria) {
  if (typeof categoria === 'string') return categoria.trim() || '—'
  return categoria?.nombre?.trim() || '—'
}

function FilaProducto({ producto, onEditar, onEliminar }) {
  const estadoStock = obtenerEstadoStock(producto.stock)
  const nombreCategoria = obtenerNombreCategoria(producto.categoria)
  const tieneLotesVigentes = Boolean(producto.tieneLoteVigente) && Number(producto.stock) > 0
  const visibleEnCatalogo = producto.visibleCatalogo === true && tieneLotesVigentes
  const tienePrecioPromo = producto.enPromocion && producto.precioPromo != null
  const textoPromo = producto.enPromocion
    ? (tienePrecioPromo ? `Sí (${formatearPrecio(producto.precioPromo)})` : 'Sí')
    : 'No'

  return (
    <tr>
      <td className="col-admin">
        <div className="prod-celda-producto">
          <img
            src={obtenerUrlImagenProducto(producto.imagen)}
            alt={producto.nombre || 'Producto'}
            onError={manejarErrorImagenProducto}
            className="tabla-prod-miniatura"
          />
          <div className="prod-info-texto">
            <span className="prod-nombre">{producto.nombre}</span>
            <span className="prod-marca">{producto.marca || '—'}</span>
          </div>
        </div>
      </td>
      <td className="col-admin col-categoria">{nombreCategoria}</td>
      <td className="col-admin">
        <div className="prod-celda-precios">
          <span className="prod-precio-venta">{formatearPrecio(producto.precioVenta)}</span>
          <span className="prod-precio-costo">Costo: {formatearPrecio(producto.precioCosto)}</span>
        </div>
      </td>
      <td className="col-admin col-stock">{producto.stock}</td>
      <td className="col-admin">
        <span className={`prod-chip ${producto.enPromocion ? 'prod-chip-promo' : 'prod-chip-neutro'}`}>
          {textoPromo}
        </span>
      </td>
      <td className="col-admin">
        <span className={`prod-pill ${estadoStock.clase}`}>
          {estadoStock.texto}
        </span>
      </td>
      <td className="col-admin">
        <span className={`prod-chip ${visibleEnCatalogo ? 'prod-chip-publico' : 'prod-chip-oculto'}`}>
          {visibleEnCatalogo ? 'Público' : 'Oculto'}
        </span>
      </td>
      <td className="col-admin col-acciones">
        <div className="prod-acciones-grupo">
          <button
            type="button"
            className="prod-btn-accion prod-btn-editar"
            onClick={() => onEditar(producto)}
          >
            <LuPencil size={14} aria-hidden="true" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            className="prod-btn-accion prod-btn-eliminar"
            onClick={() => onEliminar(producto)}
          >
            <LuTrash2 size={14} aria-hidden="true" />
            <span>Eliminar</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default FilaProducto
