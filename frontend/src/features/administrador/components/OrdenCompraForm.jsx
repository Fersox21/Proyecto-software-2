import { useEffect, useState } from 'react'
import {
  normalizarFecha,
  obtenerProductos,
  obtenerProveedores,
} from '../services/ordenesCompraService'

let proximaLlave = 0

function nuevoLote() {
  proximaLlave += 1
  return { llave: proximaLlave, productoId: '', fechaArribo: '', fechaVencimiento: '' }
}

function mapearLotes(orden) {
  return (orden?.lotes ?? []).map((lote) => {
    proximaLlave += 1
    return {
      llave: proximaLlave,
      productoId: lote.producto?.id != null ? String(lote.producto.id) : '',
      fechaArribo: normalizarFecha(lote.fechaArribo),
      fechaVencimiento: normalizarFecha(lote.fechaVencimiento),
    }
  })
}

function OrdenCompraForm({ orden, onGuardar, onCerrar }) {
  const editando = Boolean(orden)

  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true)
  const [errorCatalogos, setErrorCatalogos] = useState(null)
  const [intentoCatalogos, setIntentoCatalogos] = useState(0)

  const [valores, setValores] = useState(() => ({
    cantidad: editando ? String(orden.cantidad ?? '') : '',
    total: editando ? String(orden.total ?? '') : '',
    fecha: normalizarFecha(orden?.fecha),
    proveedorId: orden?.proveedor?.id != null ? String(orden.proveedor.id) : '',
    lotes: mapearLotes(orden),
  }))
  const [lotesModificados, setLotesModificados] = useState(!editando)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let ignorar = false

    Promise.all([obtenerProveedores(), obtenerProductos()])
      .then(([listaProveedores, listaProductos]) => {
        if (ignorar) return
        setProveedores(Array.isArray(listaProveedores) ? listaProveedores : [])
        setProductos(Array.isArray(listaProductos) ? listaProductos : [])
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
  }, [intentoCatalogos])

  function cambiarCampo(campo, valor) {
    setValores((previos) => ({ ...previos, [campo]: valor }))

    setErrores((previos) => {
      if (!previos[campo]) return previos
      const copia = { ...previos }
      delete copia[campo]
      return copia
    })
  }

  function cambiarLote(indice, campo, valor) {
    setValores((previos) => ({
      ...previos,
      lotes: previos.lotes.map((lote, posicion) =>
        posicion === indice ? { ...lote, [campo]: valor } : lote,
      ),
    }))
    setLotesModificados(true)

    const clave = `lote-${indice}-${campo}`
    setErrores((previos) => {
      if (!previos[clave]) return previos
      const copia = { ...previos }
      delete copia[clave]
      return copia
    })
  }

  function agregarLote() {
    setValores((previos) => ({ ...previos, lotes: [...previos.lotes, nuevoLote()] }))
    setLotesModificados(true)
  }

  function quitarLote(indice) {
    setValores((previos) => ({
      ...previos,
      lotes: previos.lotes.filter((_, posicion) => posicion !== indice),
    }))
    setLotesModificados(true)
  }

  function validar() {
    const nuevosErrores = {}

    const cantidad = Number(valores.cantidad)
    if (valores.cantidad === '' || Number.isNaN(cantidad) || cantidad <= 0) {
      nuevosErrores.cantidad = 'La cantidad debe ser mayor a 0'
    }

    const total = Number(valores.total)
    if (valores.total === '' || Number.isNaN(total) || total <= 0) {
      nuevosErrores.total = 'El total debe ser mayor a 0'
    }

    if (!valores.fecha) {
      nuevosErrores.fecha = 'La fecha es obligatoria'
    }

    if (!valores.proveedorId) {
      nuevosErrores.proveedorId = 'Elegí un proveedor'
    }

    valores.lotes.forEach((lote, indice) => {
      if (!lote.productoId) {
        nuevosErrores[`lote-${indice}-producto`] = 'Elegí un producto'
      }
      if (!lote.fechaArribo) {
        nuevosErrores[`lote-${indice}-arribo`] = 'La fecha de arribo es obligatoria'
      }
      if (!lote.fechaVencimiento) {
        nuevosErrores[`lote-${indice}-vencimiento`] = 'La fecha de vencimiento es obligatoria'
      }
    })

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function construirDatos() {
    const datos = {
      cantidad: Number(valores.cantidad),
      total: Number(valores.total),
      fecha: valores.fecha,
      proveedorId: Number(valores.proveedorId),
      lotes: valores.lotes.map((lote) => ({
        productoId: Number(lote.productoId),
        fechaArribo: lote.fechaArribo,
        fechaVencimiento: lote.fechaVencimiento,
      })),
    }

    // En edición, si el usuario no tocó los lotes se omite el campo para que
    // el backend los conserve en lugar de borrarlos y recrearlos.
    if (editando && !lotesModificados) {
      delete datos.lotes
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
          Cargando proveedores y productos...
        </p>
      </div>
    )
  }

  if (errorCatalogos) {
    return (
      <div className="orden-modal-cuerpo">
        <div className="orden-alerta orden-alerta-error" role="alert">
          <p>No se pudieron cargar proveedores y productos: {errorCatalogos.message}</p>
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

  return (
    <form className="orden-form" onSubmit={manejarEnvio} noValidate>
      <div className="orden-modal-cuerpo">
        {errorServidor && (
          <div className="orden-alerta orden-alerta-error" role="alert">
            {errorServidor}
          </div>
        )}

        <div className="orden-form-grilla">
          <div className="orden-campo">
            <label htmlFor="orden-proveedor">Proveedor</label>
            <select
              id="orden-proveedor"
              data-autofocus
              value={valores.proveedorId}
              onChange={(evento) => cambiarCampo('proveedorId', evento.target.value)}
              aria-invalid={Boolean(errores.proveedorId)}
              aria-describedby={errores.proveedorId ? 'orden-error-proveedor' : undefined}
            >
              <option value="">Elegí un proveedor</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
            {errores.proveedorId && (
              <p className="orden-campo-error" id="orden-error-proveedor">
                {errores.proveedorId}
              </p>
            )}
          </div>

          <div className="orden-campo">
            <label htmlFor="orden-fecha">Fecha</label>
            <input
              id="orden-fecha"
              type="date"
              value={valores.fecha}
              onChange={(evento) => cambiarCampo('fecha', evento.target.value)}
              aria-invalid={Boolean(errores.fecha)}
              aria-describedby={errores.fecha ? 'orden-error-fecha' : undefined}
            />
            {errores.fecha && (
              <p className="orden-campo-error" id="orden-error-fecha">
                {errores.fecha}
              </p>
            )}
          </div>

          <div className="orden-campo">
            <label htmlFor="orden-cantidad">Cantidad</label>
            <input
              id="orden-cantidad"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={valores.cantidad}
              onChange={(evento) => cambiarCampo('cantidad', evento.target.value)}
              aria-invalid={Boolean(errores.cantidad)}
              aria-describedby={errores.cantidad ? 'orden-error-cantidad' : undefined}
            />
            {errores.cantidad && (
              <p className="orden-campo-error" id="orden-error-cantidad">
                {errores.cantidad}
              </p>
            )}
          </div>

          <div className="orden-campo">
            <label htmlFor="orden-total">Total</label>
            <input
              id="orden-total"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={valores.total}
              onChange={(evento) => cambiarCampo('total', evento.target.value)}
              aria-invalid={Boolean(errores.total)}
              aria-describedby={errores.total ? 'orden-error-total' : undefined}
            />
            {errores.total && (
              <p className="orden-campo-error" id="orden-error-total">
                {errores.total}
              </p>
            )}
          </div>
        </div>

        <section className="orden-lotes" aria-labelledby="orden-lotes-titulo">
          <div className="orden-lotes-cabecera">
            <h3 className="orden-lotes-titulo" id="orden-lotes-titulo">
              Lotes
            </h3>
            <button type="button" className="orden-btn" onClick={agregarLote}>
              + Agregar lote
            </button>
          </div>

          {valores.lotes.length === 0 ? (
            <p className="orden-lotes-vacio">Esta orden no tiene lotes.</p>
          ) : (
            valores.lotes.map((lote, indice) => (
              <div
                className="orden-lote-fila"
                key={lote.llave}
                role="group"
                aria-label={`Lote ${indice + 1}`}
              >
                <div className="orden-campo">
                  <label htmlFor={`orden-lote-producto-${indice}`}>Producto</label>
                  <select
                    id={`orden-lote-producto-${indice}`}
                    value={lote.productoId}
                    onChange={(evento) => cambiarLote(indice, 'productoId', evento.target.value)}
                    aria-invalid={Boolean(errores[`lote-${indice}-producto`])}
                  >
                    <option value="">Elegí un producto</option>
                    {productos.map((producto) => (
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
                  <label htmlFor={`orden-lote-arribo-${indice}`}>Fecha de arribo</label>
                  <input
                    id={`orden-lote-arribo-${indice}`}
                    type="date"
                    value={lote.fechaArribo}
                    onChange={(evento) => cambiarLote(indice, 'fechaArribo', evento.target.value)}
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
                    value={lote.fechaVencimiento}
                    onChange={(evento) =>
                      cambiarLote(indice, 'fechaVencimiento', evento.target.value)
                    }
                    aria-invalid={Boolean(errores[`lote-${indice}-vencimiento`])}
                  />
                  {errores[`lote-${indice}-vencimiento`] && (
                    <p className="orden-campo-error">{errores[`lote-${indice}-vencimiento`]}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="orden-btn orden-btn-peligro orden-btn-quitar"
                  onClick={() => quitarLote(indice)}
                  aria-label={`Quitar lote ${indice + 1}`}
                >
                  Quitar
                </button>
              </div>
            ))
          )}
        </section>
      </div>

      <div className="orden-modal-acciones">
        <button type="button" className="orden-btn" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="orden-btn orden-btn-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear orden'}
        </button>
      </div>
    </form>
  )
}

export default OrdenCompraForm
