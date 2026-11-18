import { useEffect, useState } from 'react'
import {
  normalizarFecha,
  obtenerCategorias,
  obtenerProductos,
  obtenerProveedores,
} from '../../services/ordenesCompraService'
import { formatearPrecio } from '../../../../shared/utils/formato'
import { hoyISO } from '../../utils/vencimientos'
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
    enPromocion: false,
    porcentajeDescuento: '',
    precioPromo: '',
    destacado: false,
    imagenArchivo: null,
  }
}

function crearLoteVacio() {
  return {
    idTemporal: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    productoId: '',
    nuevoPrecioCostoProducto: '',
    nuevoPrecioVentaProducto: '',
    cantidad: '',
    total: '',
    totalManual: false,
    fechaArribo: '',
    fechaVencimiento: '',
    productoNuevo: crearProductoNuevoVacio(),
  }
}

function mapearLotes(orden) {
  return (orden?.lotes ?? []).map((lote) => ({
    idTemporal: lote.id ? String(lote.id) : (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
    productoId: lote.producto?.id != null ? String(lote.producto.id) : '',
    nuevoPrecioCostoProducto:
      lote.nuevoPrecioCostoProducto != null
        ? String(lote.nuevoPrecioCostoProducto)
        : lote.producto?.precioCosto != null
          ? String(lote.producto.precioCosto)
          : '',
    nuevoPrecioVentaProducto:
      lote.nuevoPrecioVentaProducto != null
        ? String(lote.nuevoPrecioVentaProducto)
        : lote.producto?.precioVenta != null
          ? String(lote.producto.precioVenta)
          : '',
    cantidad: lote.cantidad != null ? String(lote.cantidad) : '',
    total: lote.total != null ? String(lote.total) : '',
    totalManual: false,
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
    const costoLote = Number(lote.nuevoPrecioCostoProducto)
    if (Number.isFinite(costoLote) && costoLote > 0) {
      precioCosto = costoLote
    } else {
      const prod = productos.find((p) => String(p.id) === String(lote.productoId))
      precioCosto = Number(prod?.precioCosto)
    }
  }

  if (!Number.isFinite(precioCosto) || precioCosto <= 0) return null
  return Number((precioCosto * cantidad).toFixed(2))
}

function OrdenCompraForm({ orden, onGuardar, onCerrar }) {
  const editando = Boolean(orden)
  const tieneLotesConsumidos = Boolean(
    orden?.lotes?.some(
      (l) => l.cantidadInicial != null && Number(l.cantidad) < Number(l.cantidadInicial)
    )
  )

  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
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
    ])
      .then(([listaProveedores, listaProductos, listaCategorias]) => {
        if (ignorar) return
        setProveedores(Array.isArray(listaProveedores) ? listaProveedores : [])
        setProductos(Array.isArray(listaProductos) ? listaProductos : [])
        setCategorias(Array.isArray(listaCategorias) ? listaCategorias : [])
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
    if (name === 'fecha') {
      // Si cambia la fecha de pedido, limpiamos errores de arribo que dependan de ella
      setErrores((prev) => {
        const siguiente = { ...prev }
        Object.keys(siguiente).forEach((k) => {
          if (k.endsWith('-arribo')) delete siguiente[k]
        })
        return siguiente
      })
    }
  }

  function cambiarLote(indice, campo, valor) {
    setValores((prev) => ({
      ...prev,
      lotes: prev.lotes.map((lote, pos) => {
        if (pos !== indice) return lote
        const actualizado = { ...lote, [campo]: valor }
        if (campo === 'productoId') {
          if (valor && valor !== '__nuevo__') {
            const prod = productos.find((p) => String(p.id) === String(valor))
            actualizado.nuevoPrecioCostoProducto = prod?.precioCosto != null ? String(prod.precioCosto) : ''
            actualizado.nuevoPrecioVentaProducto = prod?.precioVenta != null ? String(prod.precioVenta) : ''
          } else {
            actualizado.nuevoPrecioCostoProducto = ''
            actualizado.nuevoPrecioVentaProducto = ''
          }
          actualizado.totalManual = false
          const sugerido = calcularPrecioTotalLote(actualizado, productos)
          actualizado.total = sugerido !== null ? String(sugerido) : ''
        } else if (campo === 'total') {
          actualizado.totalManual = valor !== ''
        } else if ((campo === 'nuevoPrecioCostoProducto' || campo === 'cantidad') && !actualizado.totalManual) {
          const sugerido = calcularPrecioTotalLote(actualizado, productos)
          actualizado.total = sugerido !== null ? String(sugerido) : ''
        }
        return actualizado
      }),
    }))
    setLotesModificados(true)

    const sufijo = MAPA_CLAVE_ERROR_LOTE[campo] || campo
    const clave = `lote-${indice}-${sufijo}`
    if (
      errores[clave] ||
      (campo === 'fechaArribo' && errores[`lote-${indice}-vencimiento`]) ||
      (campo === 'productoId' &&
        (errores[`lote-${indice}-nuevoPrecioCostoProducto`] ||
          errores[`lote-${indice}-nuevoPrecioVentaProducto`]))
    ) {
      setErrores((prev) => ({
        ...prev,
        [clave]: null,
        ...(campo === 'fechaArribo' ? { [`lote-${indice}-vencimiento`]: null } : {}),
        ...(campo === 'productoId'
          ? {
              [`lote-${indice}-nuevoPrecioCostoProducto`]: null,
              [`lote-${indice}-nuevoPrecioVentaProducto`]: null,
            }
          : {}),
      }))
    }
  }

  function recalcularTotalLoteSiVacio(indice) {
    setValores((prev) => ({
      ...prev,
      lotes: prev.lotes.map((lote, pos) => {
        if (pos !== indice || lote.total !== '') return lote
        const sugerido = calcularPrecioTotalLote(lote, productos)
        if (sugerido === null) return lote
        return { ...lote, totalManual: false, total: String(sugerido) }
      }),
    }))
  }

  function cambiarProductoNuevo(indice, campo, valor) {
    setValores((prev) => ({
      ...prev,
      lotes: prev.lotes.map((lote, pos) => {
        if (pos !== indice) return lote
        const actualizado = {
          ...lote,
          productoNuevo: {
            ...lote.productoNuevo,
            [campo]: valor,
          },
        }
        if (campo === 'precioCosto' && !actualizado.totalManual) {
          const sugerido = calcularPrecioTotalLote(actualizado, productos)
          actualizado.total = sugerido !== null ? String(sugerido) : ''
        }
        return actualizado
      }),
    }))
    setLotesModificados(true)

    const clave = `lote-${indice}-prod-${campo}`
    setErrores((prev) => {
      if (!prev[clave] && campo !== 'categoriaId' && campo !== 'enPromocion') return prev
      const siguiente = { ...prev, [clave]: null }
      if (campo === 'categoriaId') siguiente[`lote-${indice}-prod-categoriaNuevaNombre`] = null
      if (campo === 'enPromocion' && !valor) {
        siguiente[`lote-${indice}-prod-porcentajeDescuento`] = null
        siguiente[`lote-${indice}-prod-precioPromo`] = null
      }
      return siguiente
    })
  }

  function agregarCategoria(nueva) {
    if (!nueva || nueva.id == null) return
    setCategorias((prev) => (prev.some((c) => c.id === nueva.id) ? prev : [...prev, nueva]))
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

    if (!valores.fecha) nuevosErrores.fecha = 'La fecha de pedido es obligatoria'
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
        const precioCosto = Number(prod.precioCosto)
        if (prod.precioCosto === '' || Number.isNaN(precioCosto) || precioCosto <= 0) {
          nuevosErrores[`lote-${indice}-prod-precioCosto`] = 'El precio al costo debe ser mayor a 0'
        }
        const precioVenta = Number(prod.precioVenta)
        if (prod.precioVenta === '' || Number.isNaN(precioVenta) || precioVenta <= 0) {
          nuevosErrores[`lote-${indice}-prod-precioVenta`] = 'El precio de venta debe ser mayor a 0'
        }
        if (prod.enPromocion) {
          const porcentajeNum = Number(prod.porcentajeDescuento)
          if (
            prod.porcentajeDescuento === '' ||
            !Number.isInteger(porcentajeNum) ||
            porcentajeNum < 1 ||
            porcentajeNum > 99
          ) {
            nuevosErrores[`lote-${indice}-prod-porcentajeDescuento`] =
              'El porcentaje debe ser un entero entre 1 y 99'
          }
          const precioPromoNum = Number(prod.precioPromo)
          if (
            prod.precioPromo === '' ||
            Number.isNaN(precioPromoNum) ||
            precioPromoNum <= 0 ||
            (!Number.isNaN(precioVenta) && precioVenta > 0 && precioPromoNum >= precioVenta)
          ) {
            nuevosErrores[`lote-${indice}-prod-precioPromo`] =
              'El precio en promoción debe ser mayor a 0 y menor al precio de venta'
          }
        }
      } else if (!lote.productoId) {
        nuevosErrores[`lote-${indice}-producto`] = 'Elegí un producto'
      } else {
        const nuevoCosto = Number(lote.nuevoPrecioCostoProducto)
        if (lote.nuevoPrecioCostoProducto === '' || Number.isNaN(nuevoCosto) || nuevoCosto <= 0) {
          nuevosErrores[`lote-${indice}-nuevoPrecioCostoProducto`] = 'El nuevo precio de costo debe ser mayor a 0'
        }
        const nuevaVenta = Number(lote.nuevoPrecioVentaProducto)
        if (lote.nuevoPrecioVentaProducto === '' || Number.isNaN(nuevaVenta) || nuevaVenta <= 0) {
          nuevosErrores[`lote-${indice}-nuevoPrecioVentaProducto`] = 'El nuevo precio de venta debe ser mayor a 0'
        }
      }

      const cantidad = Number(lote.cantidad)
      if (!lote.cantidad || !Number.isInteger(cantidad) || cantidad <= 0) {
        nuevosErrores[`lote-${indice}-cantidad`] = 'La cantidad debe ser un entero mayor a 0'
      }
      const totalLote = Number(lote.total)
      if (!lote.total || Number.isNaN(totalLote) || totalLote <= 0) {
        nuevosErrores[`lote-${indice}-total`] = 'El precio total del lote debe ser mayor a 0'
      }
      if (!lote.fechaArribo) {
        nuevosErrores[`lote-${indice}-arribo`] = 'La fecha de arribo es obligatoria'
      } else if (valores.fecha && lote.fechaArribo < valores.fecha) {
        nuevosErrores[`lote-${indice}-arribo`] =
          'La fecha de arribo no puede ser menor a la fecha de pedido'
      }
      const hoy = hoyISO()
      if (!lote.fechaVencimiento) {
        nuevosErrores[`lote-${indice}-vencimiento`] = 'La fecha de vencimiento es obligatoria'
      } else if (lote.fechaArribo && lote.fechaVencimiento < lote.fechaArribo) {
        nuevosErrores[`lote-${indice}-vencimiento`] =
          'La fecha de vencimiento debe ser igual o posterior a la fecha de arribo'
      } else if (lote.fechaVencimiento < hoy) {
        nuevosErrores[`lote-${indice}-vencimiento`] =
          'La fecha de vencimiento no puede estar ya vencida'
      }
    })

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function armarPayloadLote(lote) {
    const totalLote = Number(Number(lote.total).toFixed(2))
    const base = {
      cantidad: Number(lote.cantidad),
      fechaArribo: lote.fechaArribo,
      fechaVencimiento: lote.fechaVencimiento,
      ...(Number.isFinite(totalLote) && totalLote > 0 ? { total: totalLote, precioTotal: totalLote } : {}),
    }

    if (lote.productoId !== '__nuevo__') {
      return {
        ...base,
        productoId: Number(lote.productoId),
        nuevoPrecioCostoProducto: Number(Number(lote.nuevoPrecioCostoProducto).toFixed(2)),
        nuevoPrecioVentaProducto: Number(Number(lote.nuevoPrecioVentaProducto).toFixed(2)),
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

    if (prod.categoriaId === '__nueva__') {
      productoNuevo.categoriaNuevaNombre = prod.categoriaNuevaNombre.trim()
    } else {
      productoNuevo.categoriaId = Number(prod.categoriaId)
    }

    if (prod.enPromocion) {
      productoNuevo.enPromocion = true
      productoNuevo.precioPromo = Number(prod.precioPromo)
    } else {
      productoNuevo.enPromocion = false
      productoNuevo.tipoPromocionId = null
      productoNuevo.precioPromo = null
    }

    return {
      ...base,
      productoNuevo,
    }
  }

  const calcularTotalOrden = () => {
    if (editando && tieneLotesConsumidos) {
      return Number(orden?.total ?? 0)
    }
    const suma = valores.lotes.reduce((acc, lote) => {
      const val = Number(lote.total)
      return acc + (Number.isFinite(val) && val > 0 ? val : 0)
    }, 0)
    return Number(suma.toFixed(2))
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setErrorServidor(null)
    if (!validar()) return

    setGuardando(true)
    const datos = {
      total: calcularTotalOrden(),
      fecha: valores.fecha,
      proveedorId: Number(valores.proveedorId),
      lotes: valores.lotes.map(armarPayloadLote),
    }

    if (editando && !lotesModificados) {
      delete datos.lotes
    }

    const formData = new FormData()
    formData.append('datos', JSON.stringify(datos))
    if (Array.isArray(datos.lotes)) {
      valores.lotes.forEach((lote, indice) => {
        if (lote.productoId === '__nuevo__' && lote.productoNuevo?.imagenArchivo) {
          formData.append(`imagenProducto_${indice}`, lote.productoNuevo.imagenArchivo)
        }
      })
    }

    try {
      await onGuardar(formData)
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
  const proveedorActualInactivo =
    editando &&
    orden?.proveedor?.id != null &&
    !proveedoresActivos.some((p) => String(p.id) === String(orden.proveedor.id))
      ? orden.proveedor
      : null
  const proveedoresParaSelect = proveedorActualInactivo
    ? [{ ...proveedorActualInactivo, _inactivo: true }, ...proveedoresActivos]
    : proveedoresActivos
  const totalOrdenCalculado = calcularTotalOrden()

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
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
              value={valores.proveedorId}
              onChange={handleChange}
              aria-invalid={Boolean(errores.proveedorId)}
            >
              <option value="">Elegí un proveedor</option>
              <option value="__nuevo__">+ Nuevo proveedor</option>
              {proveedoresParaSelect.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}{p._inactivo || p.activo === false ? ' (Inactivo)' : ''}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario label="Fecha de pedido" id="orden-fecha" error={errores.fecha}>
            <input
              id="orden-fecha"
              name="fecha"
              type="date"
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
              value={valores.fecha}
              onChange={handleChange}
              aria-invalid={Boolean(errores.fecha)}
            />
          </CampoFormulario>

          <div className="orden-campo">
            <label>Total de la orden (calculado)</label>
            <div
              className="bg-gray-100 border border-gray-300 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {formatearPrecio(totalOrdenCalculado)}
            </div>
            <p className="orden-campo-ayuda">
              Se calcula automáticamente sumando el precio total de los lotes.
            </p>
          </div>
        </div>

        {valores.proveedorId === '__nuevo__' && (
          <NuevoProveedorInlineForm
            onProveedorCreado={agregarProveedorCreado}
            onCancelar={cancelarNuevoProveedor}
          />
        )}

        <section className="orden-lotes dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" aria-labelledby="orden-lotes-titulo">
          <div className="orden-lotes-cabecera">
            <h3 className="orden-lotes-titulo dark:text-white" id="orden-lotes-titulo">Lotes</h3>
            {!tieneLotesConsumidos && (
              <button
                type="button"
                className="orden-btn dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                onClick={agregarLote}
              >
                + Agregar lote
              </button>
            )}
          </div>

          {tieneLotesConsumidos && (
            <div className="orden-alerta bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800" style={{ marginBottom: '1rem' }}>
              Los lotes de esta orden ya registraron ventas o salidas de stock, por lo que su configuración permanece fija para preservar la trazabilidad histórica.
            </div>
          )}

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
                errores={errores}
                puedeEliminar={!tieneLotesConsumidos && valores.lotes.length > 1}
                deshabilitado={tieneLotesConsumidos}
                fechaPedidoMinima={valores.fecha}
                onCambiar={cambiarLote}
                onRecalcularTotalSiVacio={recalcularTotalLoteSiVacio}
                onCambiarProductoNuevo={cambiarProductoNuevo}
                onCategoriaCreada={agregarCategoria}
                onQuitar={quitarLote}
              />
            ))
          )}
        </section>
      </div>

      <div className="orden-modal-acciones">
        <button
          type="button"
          className="orden-btn dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
          onClick={onCerrar}
          disabled={guardando}
        >
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
