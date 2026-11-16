import { formatearPrecio } from '../../../../shared/utils/formato'
import NuevoProductoInlineForm from './NuevoProductoInlineForm'

function ItemLoteForm({
  indice,
  lote,
  productos,
  categorias,
  tiposPromocion,
  errores,
  puedeEliminar,
  onCambiar,
  onCambiarProductoNuevo,
  onCategoriaCreada,
  onTipoPromocionCreado,
  onQuitar,
}) {
  const esProductoNuevo = lote.productoId === '__nuevo__'
  const productosActivos = productos.filter((p) => p?.activo !== false)

  const productoSeleccionado = !esProductoNuevo && lote.productoId
    ? productos.find((p) => String(p.id) === String(lote.productoId))
    : null

  const precioCosto = esProductoNuevo
    ? Number(lote.productoNuevo?.precioCosto)
    : Number(productoSeleccionado?.precioCosto)

  const cantidad = Number(lote.cantidad)
  const totalLote =
    Number.isFinite(precioCosto) && precioCosto > 0 && Number.isFinite(cantidad) && cantidad > 0
      ? Number((precioCosto * cantidad).toFixed(2))
      : null

  return (
    <div
      className="orden-lote-bloque"
      role="group"
      aria-label={`Lote ${indice + 1}`}
    >
      <div className="orden-lote-fila">
        <div className="orden-campo">
          <label htmlFor={`orden-lote-producto-${indice}`}>Producto</label>
          <select
            id={`orden-lote-producto-${indice}`}
            value={lote.productoId}
            onChange={(e) => onCambiar(indice, 'productoId', e.target.value)}
            aria-invalid={Boolean(errores[`lote-${indice}-producto`])}
          >
            <option value="">Elegí un producto</option>
            <option value="__nuevo__">+ Crear nuevo producto</option>
            {productosActivos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
                {producto.marca ? ` · ${producto.marca}` : ''}
              </option>
            ))}
          </select>
          {errores[`lote-${indice}-producto`] && (
            <p className="orden-campo-error">{errores[`lote-${indice}-producto`]}</p>
          )}
        </div>

        <div className="orden-campo">
          <label htmlFor={`orden-lote-cantidad-${indice}`}>Cantidad</label>
          <input
            id={`orden-lote-cantidad-${indice}`}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={lote.cantidad}
            onChange={(e) => onCambiar(indice, 'cantidad', e.target.value)}
            aria-invalid={Boolean(errores[`lote-${indice}-cantidad`])}
          />
          {errores[`lote-${indice}-cantidad`] && (
            <p className="orden-campo-error">{errores[`lote-${indice}-cantidad`]}</p>
          )}
        </div>

        <div className="orden-campo">
          <label htmlFor={`orden-lote-arribo-${indice}`}>Fecha de arribo</label>
          <input
            id={`orden-lote-arribo-${indice}`}
            type="date"
            value={lote.fechaArribo}
            onChange={(e) => onCambiar(indice, 'fechaArribo', e.target.value)}
            aria-invalid={Boolean(errores[`lote-${indice}-arribo`])}
          />
          {errores[`lote-${indice}-arribo`] && (
            <p className="orden-campo-error">{errores[`lote-${indice}-arribo`]}</p>
          )}
        </div>

        <div className="orden-campo">
          <label htmlFor={`orden-lote-vencimiento-${indice}`}>Fecha de vencimiento</label>
          <input
            id={`orden-lote-vencimiento-${indice}`}
            type="date"
            min={lote.fechaArribo || undefined}
            value={lote.fechaVencimiento}
            onChange={(e) => onCambiar(indice, 'fechaVencimiento', e.target.value)}
            aria-invalid={Boolean(errores[`lote-${indice}-vencimiento`])}
          />
          {errores[`lote-${indice}-vencimiento`] && (
            <p className="orden-campo-error">{errores[`lote-${indice}-vencimiento`]}</p>
          )}
        </div>

        <button
          type="button"
          className="orden-btn orden-btn-peligro orden-btn-quitar"
          onClick={() => onQuitar(indice)}
          disabled={!puedeEliminar}
          aria-label={`Quitar lote ${indice + 1}`}
        >
          Quitar
        </button>
      </div>

      {esProductoNuevo && (
        <NuevoProductoInlineForm
          indice={indice}
          producto={lote.productoNuevo}
          categorias={categorias}
          tiposPromocion={tiposPromocion}
          errores={errores}
          onCambiarCampo={onCambiarProductoNuevo}
          onCategoriaCreada={onCategoriaCreada}
          onTipoPromocionCreado={onTipoPromocionCreado}
        />
      )}

      <div className="orden-lote-resumen">
        <span className="orden-lote-total-etiqueta">Total lote:</span>
        <span
          className={`orden-lote-total-valor${totalLote === null ? ' orden-lote-total-vacio' : ''}`}
        >
          {totalLote !== null ? formatearPrecio(totalLote) : '—'}
        </span>
      </div>
    </div>
  )
}

export default ItemLoteForm
