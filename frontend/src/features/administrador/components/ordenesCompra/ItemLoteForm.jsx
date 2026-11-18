import { formatearPrecio } from '../../../../shared/utils/formato'
import { hoyISO } from '../../utils/vencimientos'
import {
  bloquearTeclasNoNumericas,
  sanitizarDecimalPositivo,
  sanitizarEnteroPositivo,
} from '../../../../shared/utils/validaciones'
import NuevoProductoInlineForm from './NuevoProductoInlineForm'

function ItemLoteForm({
  indice,
  lote,
  productos,
  categorias,
  errores,
  puedeEliminar,
  deshabilitado = false,
  fechaPedidoMinima,
  onCambiar,
  onCambiarProductoNuevo,
  onCategoriaCreada,
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
  const totalSugerido =
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
            disabled={deshabilitado}
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
            disabled={deshabilitado}
            onKeyDown={(e) => bloquearTeclasNoNumericas(e, false)}
            onChange={(e) => onCambiar(indice, 'cantidad', sanitizarEnteroPositivo(e.target.value))}
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
            min={fechaPedidoMinima || undefined}
            value={lote.fechaArribo}
            disabled={deshabilitado}
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
            min={[lote.fechaArribo, hoyISO()].filter(Boolean).sort().pop()}
            value={lote.fechaVencimiento}
            disabled={deshabilitado}
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
          disabled={!puedeEliminar || deshabilitado}
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
          errores={errores}
          onCambiarCampo={onCambiarProductoNuevo}
          onCategoriaCreada={onCategoriaCreada}
        />
      )}

      <div className="orden-lote-resumen" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="orden-campo" style={{ minWidth: '180px', maxWidth: '240px', margin: 0 }}>
          <label htmlFor={`orden-lote-total-${indice}`}>Precio total del lote ($)</label>
          <input
            id={`orden-lote-total-${indice}`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder={totalSugerido != null ? String(totalSugerido) : '0.00'}
            value={lote.total ?? ''}
            disabled={deshabilitado}
            onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
            onChange={(e) => onCambiar(indice, 'total', sanitizarDecimalPositivo(e.target.value))}
            aria-invalid={Boolean(errores[`lote-${indice}-total`])}
          />
          {errores[`lote-${indice}-total`] && (
            <p className="orden-campo-error">{errores[`lote-${indice}-total`]}</p>
          )}
        </div>

        <span
          className="orden-campo-ayuda"
          style={{ alignSelf: 'center', margin: 0 }}
        >
          {totalSugerido !== null ? `Sugerido (costo × cant.): ${formatearPrecio(totalSugerido)}` : ''}
        </span>
      </div>
    </div>
  )
}

export default ItemLoteForm
