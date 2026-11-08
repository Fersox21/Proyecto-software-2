import { useEffect, useMemo, useState } from 'react'
import { formatearFecha } from '../../../shared/utils/formato'
import {
  normalizarFecha,
  obtenerOrdenesCompra,
  obtenerProductos,
  obtenerProveedores,
} from '../services/lotesService'

function LoteForm({ lote, onGuardar, onCerrar }) {
  const editando = Boolean(lote)

  const [productos, setProductos] = useState([])
  const [ordenesCompra, setOrdenesCompra] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [cargandoCatalogos, setCargandoCatalogos] = useState(!editando)
  const [errorCatalogos, setErrorCatalogos] = useState(null)
  const [intentoCatalogos, setIntentoCatalogos] = useState(0)

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
    // En edición no se necesitan los catálogos: producto y orden se muestran
    // con los datos que ya trae el lote.
    if (editando) return

    let ignorar = false

    Promise.all([obtenerProductos(), obtenerOrdenesCompra(), obtenerProveedores()])
      .then(([listaProductos, listaOrdenes, listaProveedores]) => {
        if (ignorar) return
        setProductos(Array.isArray(listaProductos) ? listaProductos : [])
        setOrdenesCompra(Array.isArray(listaOrdenes) ? listaOrdenes : [])
        setProveedores(Array.isArray(listaProveedores) ? listaProveedores : [])
      })
      .catch((nuevoError) => {
        if (!ignorar) setErrorCatalogos(nuevoError)
      })
      .finally(() => {
        if (!ignorar) setCargandoCatalogos(false)
      })

    return () => {
      ignorar = true
    }
  }, [editando, intentoCatalogos])

  const proveedoresPorId = useMemo(() => {
    const mapa = {}

    proveedores.forEach((proveedor) => {
      mapa[proveedor.id] = proveedor.nombre
    })

    return mapa
  }, [proveedores])

  const ordenesDisponibles = useMemo(
    () => ordenesCompra.filter((orden) => orden.activo !== false),
    [ordenesCompra],
  )

  function cambiarCampo(campo, valor) {
    setValores((previos) => ({ ...previos, [campo]: valor }))

    setErrores((previos) => {
      if (!previos[campo]) return previos
      const copia = { ...previos }
      delete copia[campo]
      return copia
    })
  }

  function etiquetaOrden(orden) {
    const partes = [`Orden #${orden.id}`, formatearFecha(orden.fecha)]
    const proveedor = proveedoresPorId[orden.proveedor_id]

    if (proveedor) partes.push(proveedor)

    return partes.join(' · ')
  }

  function validar() {
    const nuevosErrores = {}

    if (!editando && !valores.productoId) {
      nuevosErrores.productoId = 'Elegí un producto'
    }

    if (!editando && !valores.ordenCompraId) {
      nuevosErrores.ordenCompraId = 'Elegí una orden de compra'
    }

    const cantidad = Number(valores.cantidad)
    if (valores.cantidad === '' || !Number.isInteger(cantidad) || cantidad <= 0) {
      nuevosErrores.cantidad = 'La cantidad debe ser un entero mayor a 0'
    }

    if (!valores.fechaArribo) {
      nuevosErrores.fechaArribo = 'La fecha de arribo es obligatoria'
    }

    if (!valores.fechaVencimiento) {
      nuevosErrores.fechaVencimiento = 'La fecha de vencimiento es obligatoria'
    }

    if (
      valores.fechaArribo &&
      valores.fechaVencimiento &&
      valores.fechaVencimiento < valores.fechaArribo
    ) {
      nuevosErrores.fechaVencimiento =
        'La fecha de vencimiento no puede ser anterior a la de arribo'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function construirDatos() {
    const datos = {
      cantidad: Number(valores.cantidad),
      fechaArribo: valores.fechaArribo,
      fechaVencimiento: valores.fechaVencimiento,
    }

    // El PUT actual solo actualiza cantidad y fechas; producto y orden de
    // compra se conservan tal como estaban.
    if (!editando) {
      datos.producto = Number(valores.productoId)
      datos.ordenCompra = Number(valores.ordenCompraId)
    }

    return datos
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setErrorServidor(null)

    if (!validar()) return

    setGuardando(true)

    try {
      await onGuardar(construirDatos())
    } catch (nuevoError) {
      setErrorServidor(nuevoError.message)
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoCatalogos) {
    return (
      <div className="orden-modal-cuerpo">
        <p className="orden-form-cargando" role="status">
          Cargando productos, órdenes y proveedores...
        </p>
      </div>
    )
  }

  if (errorCatalogos) {
    return (
      <div className="orden-modal-cuerpo">
        <div className="orden-alerta orden-alerta-error" role="alert">
          <p>No se pudieron cargar los catálogos: {errorCatalogos.message}</p>
          <button
            type="button"
            className="orden-btn"
            onClick={() => {
              setCargandoCatalogos(true)
              setErrorCatalogos(null)
              setIntentoCatalogos((numero) => numero + 1)
            }}
          >
            Reintentar
          </button>
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

        {editando ? (
          <div className="orden-form-grilla">
            <div className="orden-campo">
              <label htmlFor="lote-producto">Producto</label>
              <input
                id="lote-producto"
                type="text"
                value={
                  productoActual
                    ? `${productoActual.nombre}${
                        productoActual.marca ? ` · ${productoActual.marca}` : ''
                      }`
                    : 'Sin producto'
                }
                readOnly
                disabled
              />
            </div>

            <div className="orden-campo">
              <label htmlFor="lote-orden">Orden de compra</label>
              <input
                id="lote-orden"
                type="text"
                value={
                  ordenActual
                    ? `Orden #${ordenActual.id}${
                        ordenActual.proveedor?.nombre
                          ? ` · ${ordenActual.proveedor.nombre}`
                          : ''
                      }`
                    : 'Sin orden de compra'
                }
                readOnly
                disabled
              />
            </div>
          </div>
        ) : (
          <div className="orden-form-grilla">
            <div className="orden-campo">
              <label htmlFor="lote-producto">Producto</label>
              <select
                id="lote-producto"
                data-autofocus
                value={valores.productoId}
                onChange={(evento) => cambiarCampo('productoId', evento.target.value)}
                aria-invalid={Boolean(errores.productoId)}
                aria-describedby={errores.productoId ? 'lote-error-producto' : undefined}
              >
                <option value="">Elegí un producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre}
                    {producto.marca ? ` · ${producto.marca}` : ''}
                  </option>
                ))}
              </select>
              {errores.productoId && (
                <p className="orden-campo-error" id="lote-error-producto">
                  {errores.productoId}
                </p>
              )}
            </div>

            <div className="orden-campo">
              <label htmlFor="lote-orden">Orden de compra</label>
              <select
                id="lote-orden"
                value={valores.ordenCompraId}
                onChange={(evento) => cambiarCampo('ordenCompraId', evento.target.value)}
                aria-invalid={Boolean(errores.ordenCompraId)}
                aria-describedby={errores.ordenCompraId ? 'lote-error-orden' : undefined}
              >
                <option value="">Elegí una orden de compra</option>
                {ordenesDisponibles.map((orden) => (
                  <option key={orden.id} value={orden.id}>
                    {etiquetaOrden(orden)}
                  </option>
                ))}
              </select>
              {errores.ordenCompraId && (
                <p className="orden-campo-error" id="lote-error-orden">
                  {errores.ordenCompraId}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="orden-form-grilla">
          <div className="orden-campo">
            <label htmlFor="lote-cantidad">Cantidad</label>
            <input
              id="lote-cantidad"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              data-autofocus={editando ? true : undefined}
              value={valores.cantidad}
              onChange={(evento) => cambiarCampo('cantidad', evento.target.value)}
              aria-invalid={Boolean(errores.cantidad)}
              aria-describedby={errores.cantidad ? 'lote-error-cantidad' : undefined}
            />
            {errores.cantidad && (
              <p className="orden-campo-error" id="lote-error-cantidad">
                {errores.cantidad}
              </p>
            )}
          </div>

          <div className="orden-campo">
            <label htmlFor="lote-arribo">Fecha de arribo</label>
            <input
              id="lote-arribo"
              type="date"
              value={valores.fechaArribo}
              onChange={(evento) => cambiarCampo('fechaArribo', evento.target.value)}
              aria-invalid={Boolean(errores.fechaArribo)}
              aria-describedby={errores.fechaArribo ? 'lote-error-arribo' : undefined}
            />
            {errores.fechaArribo && (
              <p className="orden-campo-error" id="lote-error-arribo">
                {errores.fechaArribo}
              </p>
            )}
          </div>

          <div className="orden-campo">
            <label htmlFor="lote-vencimiento">Fecha de vencimiento</label>
            <input
              id="lote-vencimiento"
              type="date"
              value={valores.fechaVencimiento}
              onChange={(evento) => cambiarCampo('fechaVencimiento', evento.target.value)}
              aria-invalid={Boolean(errores.fechaVencimiento)}
              aria-describedby={
                errores.fechaVencimiento ? 'lote-error-vencimiento' : undefined
              }
            />
            {errores.fechaVencimiento && (
              <p className="orden-campo-error" id="lote-error-vencimiento">
                {errores.fechaVencimiento}
              </p>
            )}
          </div>
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
