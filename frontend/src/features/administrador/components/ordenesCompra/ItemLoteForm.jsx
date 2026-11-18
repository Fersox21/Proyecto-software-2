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
  onRecalcularTotalSiVacio,
  onCambiarProductoNuevo,
  onCategoriaCreada,
  onQuitar,
}) {
  const esProductoNuevo = lote.productoId === '__nuevo__'
  const productosActivos = productos.filter((p) => p?.activo !== false)

  const productoSeleccionado = !esProductoNuevo && lote.productoId
    ? productos.find((p) => String(p.id) === String(lote.productoId))
    : null
  const productosParaSelect =
    productoSeleccionado && !productosActivos.some((p) => String(p.id) === String(productoSeleccionado.id))
      ? [productoSeleccionado, ...productosActivos]
      : productosActivos

  const nuevoCostoIngresado = Number(lote.nuevoPrecioCostoProducto)
  const costoCatalogo = Number(productoSeleccionado?.precioCosto)

  const nuevoVentaIngresado = Number(lote.nuevoPrecioVentaProducto)
  const ventaCatalogo = Number(productoSeleccionado?.precioVenta)

  const precioCosto = esProductoNuevo
    ? Number(lote.productoNuevo?.precioCosto)
    : Number.isFinite(nuevoCostoIngresado) && nuevoCostoIngresado > 0
      ? nuevoCostoIngresado
      : costoCatalogo

  const cambioCosto =
    !esProductoNuevo &&
    Boolean(productoSeleccionado) &&
    lote.nuevoPrecioCostoProducto !== '' &&
    Number.isFinite(nuevoCostoIngresado) &&
    nuevoCostoIngresado > 0 &&
    Number.isFinite(costoCatalogo) &&
    Math.abs(nuevoCostoIngresado - costoCatalogo) >= 0.01

  const cambioVenta =
    !esProductoNuevo &&
    Boolean(productoSeleccionado) &&
    lote.nuevoPrecioVentaProducto !== '' &&
    Number.isFinite(nuevoVentaIngresado) &&
    nuevoVentaIngresado > 0 &&
    Number.isFinite(ventaCatalogo) &&
    Math.abs(nuevoVentaIngresado - ventaCatalogo) >= 0.01

  const cantidad = Number(lote.cantidad)
  const totalSugerido =
    Number.isFinite(precioCosto) && precioCosto > 0 && Number.isFinite(cantidad) && cantidad > 0
      ? Number((precioCosto * cantidad).toFixed(2))
      : null

  return (
    <div
      className="orden-lote-bloque dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
      role="group"
      aria-label={`Lote ${indice + 1}`}
    >
      <div className="orden-lote-fila">
        <div className="orden-campo">
          <label htmlFor={`orden-lote-producto-${indice}`}>Producto</label>
          <select
            id={`orden-lote-producto-${indice}`}
            className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
            value={lote.productoId}
            disabled={deshabilitado}
            onChange={(e) => onCambiar(indice, 'productoId', e.target.value)}
            aria-invalid={Boolean(errores[`lote-${indice}-producto`])}
          >
            <option value="">Elegí un producto</option>
            <option value="__nuevo__">+ Crear nuevo producto</option>
            {productosParaSelect.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
                {producto.marca ? ` · ${producto.marca}` : ''}
                {producto.activo === false ? ' (Inactivo)' : ''}
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
            className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
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
            className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
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
            className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
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
          className="orden-btn orden-btn-peligro orden-btn-quitar dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
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
        {!esProductoNuevo && lote.productoId && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              flex: '2 1 420px',
            }}
          >
            <div className="orden-campo" style={{ margin: 0 }}>
              <label htmlFor={`orden-lote-nuevo-costo-${indice}`}>Nuevo precio de costo para el catálogo ($)</label>
              <input
                id={`orden-lote-nuevo-costo-${indice}`}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                placeholder={Number.isFinite(costoCatalogo) && costoCatalogo > 0 ? String(costoCatalogo) : '0.00'}
                value={lote.nuevoPrecioCostoProducto ?? ''}
                disabled={deshabilitado}
                onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                onChange={(e) => onCambiar(indice, 'nuevoPrecioCostoProducto', sanitizarDecimalPositivo(e.target.value))}
                aria-invalid={Boolean(errores[`lote-${indice}-nuevoPrecioCostoProducto`])}
              />
              {cambioCosto && (
                <p className="orden-campo-ayuda">
                  Costo actual: {formatearPrecio(productoSeleccionado.precioCosto)} → Se actualizará y guardará en el historial
                </p>
              )}
              {errores[`lote-${indice}-nuevoPrecioCostoProducto`] && (
                <p className="orden-campo-error">{errores[`lote-${indice}-nuevoPrecioCostoProducto`]}</p>
              )}
            </div>

            <div className="orden-campo" style={{ margin: 0 }}>
              <label htmlFor={`orden-lote-nuevo-venta-${indice}`}>Nuevo precio de venta ($)</label>
              <input
                id={`orden-lote-nuevo-venta-${indice}`}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                placeholder={Number.isFinite(ventaCatalogo) && ventaCatalogo > 0 ? String(ventaCatalogo) : '0.00'}
                value={lote.nuevoPrecioVentaProducto ?? ''}
                disabled={deshabilitado}
                onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                onChange={(e) => onCambiar(indice, 'nuevoPrecioVentaProducto', sanitizarDecimalPositivo(e.target.value))}
                aria-invalid={Boolean(errores[`lote-${indice}-nuevoPrecioVentaProducto`])}
              />
              {cambioVenta && (
                <p className="orden-campo-ayuda">
                  Venta actual: {formatearPrecio(productoSeleccionado.precioVenta)} → Se actualizará en el catálogo
                </p>
              )}
              {errores[`lote-${indice}-nuevoPrecioVentaProducto`] && (
                <p className="orden-campo-error">{errores[`lote-${indice}-nuevoPrecioVentaProducto`]}</p>
              )}
            </div>
          </div>
        )}

        <div className="orden-campo" style={{ minWidth: '180px', maxWidth: '240px', margin: 0 }}>
          <label htmlFor={`orden-lote-total-${indice}`}>Precio total del lote ($)</label>
          <input
            id={`orden-lote-total-${indice}`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
            placeholder={totalSugerido != null ? String(totalSugerido) : '0.00'}
            value={lote.total ?? ''}
            disabled={deshabilitado}
            onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
            onChange={(e) => onCambiar(indice, 'total', sanitizarDecimalPositivo(e.target.value))}
            onBlur={() => onRecalcularTotalSiVacio?.(indice)}
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
