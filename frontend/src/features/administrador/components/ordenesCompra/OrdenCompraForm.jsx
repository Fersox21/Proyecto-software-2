import { useEffect, useState } from 'react'
import {
  normalizarFecha,
  obtenerProductos,
  obtenerProveedores,
} from '../services/ordenesCompraService'
import ItemLoteForm from './ItemLoteForm'
import CampoFormulario from './CampoFormulario'

function crearLoteVacio() {
  return {
    idTemporal: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    productoId: '',
    cantidad: '',
    fechaArribo: '',
    fechaVencimiento: '',
  }
}

function mapearLotes(orden) {
  return (orden?.lotes ?? []).map((lote) => ({
    idTemporal: lote.id ? String(lote.id) : (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
    productoId: lote.producto?.id != null ? String(lote.producto.id) : '',
    cantidad: lote.cantidad != null ? String(lote.cantidad) : '',
    fechaArribo: normalizarFecha(lote.fechaArribo),
    fechaVencimiento: normalizarFecha(lote.fechaVencimiento),
  }))
}

function OrdenCompraForm({ orden, onGuardar, onCerrar }) {
  const editando = Boolean(orden)

  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true)
  const [errorCatalogos, setErrorCatalogos] = useState(null)

  const [valores, setValores] = useState(() => {
    const lotesExistentes = mapearLotes(orden)
    return {
      total: editando ? String(orden.total ?? '') : '',
      fecha: normalizarFecha(orden?.fecha),
      proveedorId: orden?.proveedor?.id != null ? String(orden.proveedor.id) : '',
      lotes: lotesExistentes.length > 0 ? lotesExistentes : [crearLoteVacio()],
    }
  })

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
      .catch((err) => {
        if (!ignorar) setErrorCatalogos(err.message)
      })
      .finally(() => {
        if (!ignorar) setCargandoCatalogos(false)
      })

    return () => {
      ignorar = true
    }
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setValores((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  function cambiarLote(indice, campo, valor) {
    setValores((prev) => ({
      ...prev,
      lotes: prev.lotes.map((lote, pos) =>
        pos === indice ? { ...lote, [campo]: valor } : lote,
      ),
    }))
    setLotesModificados(true)

    const clave = `lote-${indice}-${campo}`
    if (errores[clave]) {
      setErrores((prev) => ({ ...prev, [clave]: null }))
    }
  }

  function agregarLote() {
    setValores((prev) => ({ ...prev, lotes: [...prev.lotes, crearLoteVacio()] }))
    setLotesModificados(true)
    if (errores.lotes) {
      setErrores((prev) => ({ ...prev, lotes: null }))
    }
  }

  function quitarLote(indice) {
    setValores((prev) => ({
      ...prev,
      lotes: prev.lotes.filter((_, pos) => pos !== indice),
    }))
    setLotesModificados(true)
  }

  function validar() {
    const nuevosErrores = {}
    const total = Number(valores.total)

    if (!valores.total || Number.isNaN(total) || total <= 0) {
      nuevosErrores.total = 'El total debe ser mayor a 0'
    }
    if (!valores.fecha) nuevosErrores.fecha = 'La fecha es obligatoria'
    if (!valores.proveedorId) nuevosErrores.proveedorId = 'Elegí un proveedor'
    if (valores.lotes.length === 0) nuevosErrores.lotes = 'Agregá al menos un lote'

    valores.lotes.forEach((lote, indice) => {
      if (!lote.productoId) nuevosErrores[`lote-${indice}-producto`] = 'Elegí un producto'

      const cantidad = Number(lote.cantidad)
      if (!lote.cantidad || !Number.isInteger(cantidad) || cantidad <= 0) {
        nuevosErrores[`lote-${indice}-cantidad`] = 'La cantidad debe ser un entero mayor a 0'
      }
      if (!lote.fechaArribo) nuevosErrores[`lote-${indice}-arribo`] = 'La fecha de arribo es obligatoria'
      if (!lote.fechaVencimiento) nuevosErrores[`lote-${indice}-vencimiento`] = 'La fecha de vencimiento es obligatoria'
    })

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setErrorServidor(null)
    if (!validar()) return

    setGuardando(true)
    const datos = {
      total: Number(valores.total),
      fecha: valores.fecha,
      proveedorId: Number(valores.proveedorId),
      lotes: valores.lotes.map((lote) => ({
        productoId: Number(lote.productoId),
        cantidad: Number(lote.cantidad),
        fechaArribo: lote.fechaArribo,
        fechaVencimiento: lote.fechaVencimiento,
      })),
    }

    if (editando && !lotesModificados) {
      delete datos.lotes
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
        <p className="orden-form-cargando" role="status">Cargando proveedores y productos...</p>
      </div>
    )
  }

  if (errorCatalogos) {
    return (
      <div className="orden-modal-cuerpo">
        <div className="orden-alerta orden-alerta-error" role="alert">
          <p>No se pudieron cargar proveedores y productos: {errorCatalogos}</p>
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
          <CampoFormulario label="Proveedor" id="orden-proveedor" error={errores.proveedorId}>
            <select
              id="orden-proveedor"
              name="proveedorId"
              value={valores.proveedorId}
              onChange={handleChange}
              aria-invalid={Boolean(errores.proveedorId)}
            >
              <option value="">Elegí un proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario label="Fecha" id="orden-fecha" error={errores.fecha}>
            <input
              id="orden-fecha"
              name="fecha"
              type="date"
              value={valores.fecha}
              onChange={handleChange}
              aria-invalid={Boolean(errores.fecha)}
            />
          </CampoFormulario>

          <CampoFormulario label="Total" id="orden-total" error={errores.total}>
            <input
              id="orden-total"
              name="total"
              type="number"
              min="0.01"
              step="0.01"
              value={valores.total}
              onChange={handleChange}
              aria-invalid={Boolean(errores.total)}
            />
          </CampoFormulario>
        </div>

        <section className="orden-lotes" aria-labelledby="orden-lotes-titulo">
          <div className="orden-lotes-cabecera">
            <h3 className="orden-lotes-titulo" id="orden-lotes-titulo">Lotes</h3>
            <button type="button" className="orden-btn" onClick={agregarLote}>
              + Agregar lote
            </button>
          </div>

          {valores.lotes.length === 0 ? (
            <>
              <p className="orden-lotes-vacio">Esta orden no tiene lotes.</p>
              {errores.lotes && <p className="orden-campo-error">{errores.lotes}</p>}
            </>
          ) : (
            valores.lotes.map((lote, indice) => (
              <ItemLoteForm
                key={lote.idTemporal}
                indice={indice}
                lote={lote}
                productos={productos}
                errores={errores}
                puedeEliminar={valores.lotes.length > 1}
                onCambiar={cambiarLote}
                onQuitar={quitarLote}
              />
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
