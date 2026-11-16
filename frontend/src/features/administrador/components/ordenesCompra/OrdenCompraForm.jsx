import { useEffect, useState } from 'react'
import {
  normalizarFecha,
  obtenerCategorias,
  obtenerProductos,
  obtenerProveedores,
  obtenerTiposPromocion,
} from '../../services/ordenesCompraService'
import { formatearPrecio } from '../../../../shared/utils/formato'
import ItemLoteForm from './ItemLoteForm'
import NuevoProveedorInlineForm from './NuevoProveedorInlineForm'
import CampoFormulario from '../comunes/CampoFormulario'

function crearProductoNuevoVacio() {
  return {
    nombre: '',
    categoriaId: '',
    categoriaNuevaNombre: '',
    marca: '',
    descripcion: '',
    precioVenta: '',
    precioCosto: '',
    tipoPromocionId: '',
    tipoPromocionNuevaNombre: '',
    destacado: false,
    peso: '',
  }
}

function crearLoteVacio() {
  return {
    idTemporal: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    productoId: '',
    cantidad: '',
    fechaArribo: '',
    fechaVencimiento: '',
    productoNuevo: crearProductoNuevoVacio(),
  }
}

function mapearLotes(orden) {
  return (orden?.lotes ?? []).map((lote) => ({
    idTemporal: lote.id ? String(lote.id) : (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
    productoId: lote.producto?.id != null ? String(lote.producto.id) : '',
    cantidad: lote.cantidad != null ? String(lote.cantidad) : '',
    fechaArribo: normalizarFecha(lote.fechaArribo),
    fechaVencimiento: normalizarFecha(lote.fechaVencimiento),
    productoNuevo: crearProductoNuevoVacio(),
  }))
}

const MAPA_CLAVE_ERROR_LOTE = {
  productoId: 'producto',
  fechaArribo: 'arribo',
  fechaVencimiento: 'vencimiento',
}

function calcularPrecioTotalLote(lote, productos) {
  const cantidad = Number(lote.cantidad)
  if (!Number.isFinite(cantidad) || cantidad <= 0) return null

  let precioCosto = NaN
  if (lote.productoId === '__nuevo__') {
    precioCosto = Number(lote.productoNuevo?.precioCosto)
  } else if (lote.productoId) {
    const prod = productos.find((p) => String(p.id) === String(lote.productoId))
    precioCosto = Number(prod?.precioCosto)
  }

  if (!Number.isFinite(precioCosto) || precioCosto <= 0) return null
  return Number((precioCosto * cantidad).toFixed(2))
}

function OrdenCompraForm({ orden, onGuardar, onCerrar }) {
  const editando = Boolean(orden)

  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [tiposPromocion, setTiposPromocion] = useState([])
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

    Promise.all([
      obtenerProveedores(),
      obtenerProductos(),
      obtenerCategorias(),
      obtenerTiposPromocion(),
    ])
      .then(([listaProveedores, listaProductos, listaCategorias, listaTiposPromo]) => {
        if (ignorar) return
        setProveedores(Array.isArray(listaProveedores) ? listaProveedores : [])
        setProductos(Array.isArray(listaProductos) ? listaProductos : [])
        setCategorias(Array.isArray(listaCategorias) ? listaCategorias : [])
        setTiposPromocion(Array.isArray(listaTiposPromo) ? listaTiposPromo : [])
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

    const sufijo = MAPA_CLAVE_ERROR_LOTE[campo] || campo
    const clave = `lote-${indice}-${sufijo}`
    if (errores[clave] || (campo === 'fechaArribo' && errores[`lote-${indice}-vencimiento`])) {
      setErrores((prev) => ({
        ...prev,
        [clave]: null,
        ...(campo === 'fechaArribo' ? { [`lote-${indice}-vencimiento`]: null } : {}),
      }))
    }
  }

  function cambiarProductoNuevo(indice, campo, valor) {
    setValores((prev) => ({
      ...prev,
      lotes: prev.lotes.map((lote, pos) =>
        pos === indice
          ? {
              ...lote,
              productoNuevo: {
                ...lote.productoNuevo,
                [campo]: valor,
              },
            }
          : lote,
      ),
    }))
    setLotesModificados(true)

    const clave = `lote-${indice}-prod-${campo}`
    setErrores((prev) => {
      if (!prev[clave] && campo !== 'categoriaId' && campo !== 'tipoPromocionId') return prev
      const siguiente = { ...prev, [clave]: null }
      if (campo === 'categoriaId') siguiente[`lote-${indice}-prod-categoriaNuevaNombre`] = null
      if (campo === 'tipoPromocionId') siguiente[`lote-${indice}-prod-tipoPromocionNuevaNombre`] = null
      return siguiente
    })
  }

  function agregarCategoria(nueva) {
    if (!nueva || nueva.id == null) return
    setCategorias((prev) => (prev.some((c) => c.id === nueva.id) ? prev : [...prev, nueva]))
  }

  function agregarTipoPromocion(nuevo) {
    if (!nuevo || nuevo.id == null) return
    setTiposPromocion((prev) => (prev.some((tp) => tp.id === nuevo.id) ? prev : [...prev, nuevo]))
  }

  function agregarProveedorCreado(nuevo) {
    if (!nuevo || nuevo.id == null) return
    setProveedores((prev) => (prev.some((p) => p.id === nuevo.id) ? prev : [...prev, nuevo]))
    setValores((prev) => ({ ...prev, proveedorId: String(nuevo.id) }))
    setErrores((prev) => ({ ...prev, proveedorId: null }))
  }

  function cancelarNuevoProveedor() {
    setValores((prev) => ({ ...prev, proveedorId: '' }))
    setErrores((prev) => ({ ...prev, proveedorId: null }))
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
    if (!valores.proveedorId) {
      nuevosErrores.proveedorId = 'Elegí un proveedor'
    } else if (valores.proveedorId === '__nuevo__') {
      nuevosErrores.proveedorId =
        'Creá el nuevo proveedor o elegí uno existente antes de guardar la orden'
    }
    if (valores.lotes.length === 0) nuevosErrores.lotes = 'Agregá al menos un lote'

    valores.lotes.forEach((lote, indice) => {
      if (lote.productoId === '__nuevo__') {
        const prod = lote.productoNuevo || {}
        if (!prod.nombre?.trim()) {
          nuevosErrores[`lote-${indice}-prod-nombre`] = 'El nombre es obligatorio'
        }
        if (!prod.marca?.trim()) {
          nuevosErrores[`lote-${indice}-prod-marca`] = 'La marca es obligatoria'
        }
        if (!prod.descripcion?.trim()) {
          nuevosErrores[`lote-${indice}-prod-descripcion`] = 'La descripción es obligatoria'
        }
        if (!prod.categoriaId) {
          nuevosErrores[`lote-${indice}-prod-categoriaId`] = 'Elegí una categoría'
        } else if (prod.categoriaId === '__nueva__' && !prod.categoriaNuevaNombre?.trim()) {
          nuevosErrores[`lote-${indice}-prod-categoriaNuevaNombre`] = 'Ingresá el nombre de la nueva categoría'
        }
        if (prod.tipoPromocionId === '__nueva__' && !prod.tipoPromocionNuevaNombre?.trim()) {
          nuevosErrores[`lote-${indice}-prod-tipoPromocionNuevaNombre`] = 'Ingresá el nombre del tipo de promoción'
        }
        const precioCosto = Number(prod.precioCosto)
        if (prod.precioCosto === '' || Number.isNaN(precioCosto) || precioCosto <= 0) {
          nuevosErrores[`lote-${indice}-prod-precioCosto`] = 'El precio al costo debe ser mayor a 0'
        }
        const precioVenta = Number(prod.precioVenta)
        if (prod.precioVenta === '' || Number.isNaN(precioVenta) || precioVenta <= 0) {
          nuevosErrores[`lote-${indice}-prod-precioVenta`] = 'El precio de venta debe ser mayor a 0'
        }
        if (prod.peso !== '' && prod.peso != null) {
          const peso = Number(prod.peso)
          if (Number.isNaN(peso) || peso <= 0) {
            nuevosErrores[`lote-${indice}-prod-peso`] = 'El peso debe ser mayor a 0'
          }
        }
      } else if (!lote.productoId) {
        nuevosErrores[`lote-${indice}-producto`] = 'Elegí un producto'
      }

      const cantidad = Number(lote.cantidad)
      if (!lote.cantidad || !Number.isInteger(cantidad) || cantidad <= 0) {
        nuevosErrores[`lote-${indice}-cantidad`] = 'La cantidad debe ser un entero mayor a 0'
      }
      if (!lote.fechaArribo) {
        nuevosErrores[`lote-${indice}-arribo`] = 'La fecha de arribo es obligatoria'
      }
      if (!lote.fechaVencimiento) {
        nuevosErrores[`lote-${indice}-vencimiento`] = 'La fecha de vencimiento es obligatoria'
      } else if (lote.fechaArribo && lote.fechaVencimiento < lote.fechaArribo) {
        nuevosErrores[`lote-${indice}-vencimiento`] =
          'La fecha de vencimiento debe ser igual o posterior a la fecha de arribo'
      }
    })

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function armarPayloadLote(lote) {
    const totalLote = calcularPrecioTotalLote(lote, productos)
    const base = {
      cantidad: Number(lote.cantidad),
      fechaArribo: lote.fechaArribo,
      fechaVencimiento: lote.fechaVencimiento,
      ...(totalLote !== null ? { total: totalLote, precioTotal: totalLote } : {}),
    }

    if (lote.productoId !== '__nuevo__') {
      return {
        ...base,
        productoId: Number(lote.productoId),
      }
    }

    const prod = lote.productoNuevo
    const productoNuevo = {
      nombre: prod.nombre.trim(),
      marca: prod.marca.trim(),
      descripcion: prod.descripcion.trim(),
      precioVenta: Number(prod.precioVenta),
      precioCosto: Number(prod.precioCosto),
      destacado: Boolean(prod.destacado),
    }

    if (prod.peso !== '' && prod.peso != null) {
      productoNuevo.peso = Number(prod.peso)
    }

    if (prod.categoriaId === '__nueva__') {
      productoNuevo.categoriaNuevaNombre = prod.categoriaNuevaNombre.trim()
    } else {
      productoNuevo.categoriaId = Number(prod.categoriaId)
    }

    if (prod.tipoPromocionId === '__nueva__') {
      productoNuevo.tipoPromocionNuevaNombre = prod.tipoPromocionNuevaNombre.trim()
    } else if (prod.tipoPromocionId) {
      productoNuevo.tipoPromocionId = Number(prod.tipoPromocionId)
    } else {
      productoNuevo.tipoPromocionId = null
    }

    return {
      ...base,
      productoNuevo,
    }
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
      lotes: valores.lotes.map(armarPayloadLote),
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

  const proveedoresActivos = proveedores.filter((p) => p?.activo !== false)
  const totalesLotes = valores.lotes
    .map((lote) => calcularPrecioTotalLote(lote, productos))
    .filter((valor) => valor !== null)
  const sumaSugeridaLotes =
    totalesLotes.length > 0
      ? Number(totalesLotes.reduce((acc, val) => acc + val, 0).toFixed(2))
      : null

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
              <option value="__nuevo__">+ Nuevo proveedor</option>
              {proveedoresActivos.map((p) => (
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
            {sumaSugeridaLotes !== null && (
              <p className="orden-campo-ayuda">
                Suma estimada de lotes: {formatearPrecio(sumaSugeridaLotes)}
              </p>
            )}
          </CampoFormulario>
        </div>

        {valores.proveedorId === '__nuevo__' && (
          <NuevoProveedorInlineForm
            onProveedorCreado={agregarProveedorCreado}
            onCancelar={cancelarNuevoProveedor}
          />
        )}

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
                categorias={categorias}
                tiposPromocion={tiposPromocion}
                errores={errores}
                puedeEliminar={valores.lotes.length > 1}
                onCambiar={cambiarLote}
                onCambiarProductoNuevo={cambiarProductoNuevo}
                onCategoriaCreada={agregarCategoria}
                onTipoPromocionCreado={agregarTipoPromocion}
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
