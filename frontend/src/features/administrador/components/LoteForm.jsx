import { useEffect, useMemo, useState } from 'react'
import { formatearFecha } from '../../../shared/utils/formato'
import {
  normalizarFecha,
  obtenerOrdenesCompra,
  obtenerProductos,
  obtenerProveedores,
} from '../services/lotesService'
import CampoFormulario from './CampoFormulario'

function LoteForm({ lote, onGuardar, onCerrar }) {
  const editando = Boolean(lote)

  const [productos, setProductos] = useState([])
  const [ordenesCompra, setOrdenesCompra] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [cargandoCatalogos, setCargandoCatalogos] = useState(!editando)
  const [errorCatalogos, setErrorCatalogos] = useState(null)

  const [valores, setValores] = useState(() => ({
    productoId: lote?.producto?.id != null ? String(lote.producto.id) : '',
    ordenCompraId: lote?.ordenCompra?.id != null ? String(lote.ordenCompra.id) : '',
    cantidad: lote?.cantidad != null ? String(lote.cantidad) : '',
    fechaArribo: normalizarFecha(lote?.fechaArribo),
    fechaVencimiento: normalizarFecha(lote?.fechaVencimiento),
  }))

  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (editando) return
    let ignorar = false

    Promise.all([obtenerProductos(), obtenerOrdenesCompra(), obtenerProveedores()])
      .then(([listaProductos, listaOrdenes, listaProveedores]) => {
        if (ignorar) return
        setProductos(Array.isArray(listaProductos) ? listaProductos : [])
        setOrdenesCompra(Array.isArray(listaOrdenes) ? listaOrdenes : [])
        setProveedores(Array.isArray(listaProveedores) ? listaProveedores : [])
      })
      .catch((err) => {
        if (!ignorar) setErrorCatalogos(err.message)
      })
      .finally(() => {
        if (!ignorar) setCargandoCatalogos(false)
      })

    return () => {
      ignorar = true
    }
  }, [editando])

  const proveedoresPorId = useMemo(() => {
    const mapa = {}
    proveedores.forEach((p) => {
      mapa[p.id] = p.nombre
    })
    return mapa
  }, [proveedores])

  const ordenesDisponibles = useMemo(
    () => ordenesCompra.filter((orden) => orden.activo !== false),
    [ordenesCompra],
  )

  function handleChange(e) {
    const { name, value } = e.target
    setValores((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  function validar() {
    const nuevosErrores = {}
    if (!editando && !valores.productoId) nuevosErrores.productoId = 'Elegí un producto'
    if (!editando && !valores.ordenCompraId) nuevosErrores.ordenCompraId = 'Elegí una orden de compra'

    const cantidad = Number(valores.cantidad)
    if (!valores.cantidad || !Number.isInteger(cantidad) || cantidad <= 0) {
      nuevosErrores.cantidad = 'La cantidad debe ser un entero mayor a 0'
    }

    if (!valores.fechaArribo) nuevosErrores.fechaArribo = 'La fecha de arribo es obligatoria'
    if (!valores.fechaVencimiento) nuevosErrores.fechaVencimiento = 'La fecha de vencimiento es obligatoria'

    if (valores.fechaArribo && valores.fechaVencimiento && valores.fechaVencimiento < valores.fechaArribo) {
      nuevosErrores.fechaVencimiento = 'No puede ser anterior a la de arribo'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setErrorServidor(null)
    if (!validar()) return

    setGuardando(true)
    const datos = {
      cantidad: Number(valores.cantidad),
      fechaArribo: valores.fechaArribo,
      fechaVencimiento: valores.fechaVencimiento,
      ...(!editando && {
        producto: Number(valores.productoId),
        ordenCompra: Number(valores.ordenCompraId),
      }),
    }

    try {
      await onGuardar(datos)
    } catch (err) {
      setErrorServidor(err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoCatalogos) {
    return (
      <div className="orden-modal-cuerpo">
        <p className="orden-form-cargando" role="status">Cargando productos, órdenes y proveedores...</p>
      </div>
    )
  }

  if (errorCatalogos) {
    return (
      <div className="orden-modal-cuerpo">
        <div className="orden-alerta orden-alerta-error" role="alert">
          <p>No se pudieron cargar los catálogos: {errorCatalogos}</p>
        </div>
      </div>
    )
  }

  const productoActual = lote?.producto
  const ordenActual = lote?.ordenCompra

  return (
    <form className="orden-form" onSubmit={manejarEnvio} noValidate>
      <div className="orden-modal-cuerpo">
        {errorServidor && (
          <div className="orden-alerta orden-alerta-error" role="alert">
            {errorServidor}
          </div>
        )}

        <div className="orden-form-grilla">
          <CampoFormulario label="Producto" id="lote-producto" error={errores.productoId}>
            {editando ? (
              <input
                id="lote-producto"
                type="text"
                value={productoActual ? `${productoActual.nombre}${productoActual.marca ? ` · ${productoActual.marca}` : ''}` : 'Sin producto'}
                readOnly
                disabled
              />
            ) : (
              <select
                id="lote-producto"
                name="productoId"
                value={valores.productoId}
                onChange={handleChange}
                aria-invalid={Boolean(errores.productoId)}
              >
                <option value="">Elegí un producto</option>
                {productos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nombre}{prod.marca ? ` · ${prod.marca}` : ''}
                  </option>
                ))}
              </select>
            )}
          </CampoFormulario>

          <CampoFormulario label="Orden de compra" id="lote-orden" error={errores.ordenCompraId}>
            {editando ? (
              <input
                id="lote-orden"
                type="text"
                value={ordenActual ? `Orden #${ordenActual.id}${ordenActual.proveedor?.nombre ? ` · ${ordenActual.proveedor.nombre}` : ''}` : 'Sin orden'}
                readOnly
                disabled
              />
            ) : (
              <select
                id="lote-orden"
                name="ordenCompraId"
                value={valores.ordenCompraId}
                onChange={handleChange}
                aria-invalid={Boolean(errores.ordenCompraId)}
              >
                <option value="">Elegí una orden de compra</option>
                {ordenesDisponibles.map((orden) => (
                  <option key={orden.id} value={orden.id}>
                    {`Orden #${orden.id} · ${formatearFecha(orden.fecha)}${proveedoresPorId[orden.proveedor_id] ? ` · ${proveedoresPorId[orden.proveedor_id]}` : ''}`}
                  </option>
                ))}
              </select>
            )}
          </CampoFormulario>
        </div>

        <div className="orden-form-grilla">
          <CampoFormulario label="Cantidad" id="lote-cantidad" error={errores.cantidad}>
            <input
              id="lote-cantidad"
              name="cantidad"
              type="number"
              min="1"
              step="1"
              value={valores.cantidad}
              onChange={handleChange}
              aria-invalid={Boolean(errores.cantidad)}
            />
          </CampoFormulario>

          <CampoFormulario label="Fecha de arribo" id="lote-arribo" error={errores.fechaArribo}>
            <input
              id="lote-arribo"
              name="fechaArribo"
              type="date"
              value={valores.fechaArribo}
              onChange={handleChange}
              aria-invalid={Boolean(errores.fechaArribo)}
            />
          </CampoFormulario>

          <CampoFormulario label="Fecha de vencimiento" id="lote-vencimiento" error={errores.fechaVencimiento}>
            <input
              id="lote-vencimiento"
              name="fechaVencimiento"
              type="date"
              value={valores.fechaVencimiento}
              onChange={handleChange}
              aria-invalid={Boolean(errores.fechaVencimiento)}
            />
          </CampoFormulario>
        </div>
      </div>

      <div className="orden-modal-acciones">
        <button type="button" className="orden-btn" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="orden-btn orden-btn-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear lote'}
        </button>
      </div>
    </form>
  )
}

export default LoteForm
