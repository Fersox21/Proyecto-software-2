import { useEffect, useState } from 'react'
import { LuImagePlus } from 'react-icons/lu'
import Modal from '../comunes/Modal'
import CampoFormulario from '../comunes/CampoFormulario'
import { obtenerCategorias, obtenerHistorialPreciosProducto } from '../../services/productosServices'
import {
  bloquearTeclasNoNumericas,
  sanitizarDecimalPositivo,
} from '../../../../shared/utils/validaciones'
import {
  formatearFecha,
  formatearPrecio,
  manejarErrorImagenProducto,
  obtenerUrlImagenProducto,
} from '../../../../shared/utils/formato'

const ETIQUETAS_ORIGEN_HISTORIAL = {
  ALTA_PRODUCTO: 'Alta inicial',
  INGRESO_LOTE: 'Ingreso de lote',
  EDICION_ORDEN: 'Edición de orden',
  EDICION_MANUAL: 'Edición manual',
}

const CATEGORIAS_DISPONIBLES = [
  'Almacén',
  'Lácteos',
  'Frescos',
  'Enlatados',
  'Bebidas',
  'Golosinas',
  'Harinas',
  'Pastas',
  'Granos',
  'Limpieza',
]

function obtenerCategoriaInicialId(producto) {
  if (producto?.categoriaId != null) return String(producto.categoriaId)
  if (producto?.categoria?.id != null) return String(producto.categoria.id)
  return ''
}

function redondear2(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

function calcularPorcentajeInicial(producto) {
  const precioVenta = Number(producto?.precioVenta)
  const precioPromo = Number(producto?.precioPromo)
  if (
    !Number.isFinite(precioVenta) ||
    !Number.isFinite(precioPromo) ||
    precioPromo <= 0 ||
    precioPromo >= precioVenta
  ) {
    return ''
  }
  return String(redondear2(100 - ((precioPromo * 100) / precioVenta)))
}

function ModalFormProducto({ producto, visible, guardando, soloLectura = false, onGuardar, onCerrar }) {
  const editando = Boolean(producto)
  const tieneIdProducto = producto?.id != null
  const tieneLotesVigentes = Boolean(producto?.tieneLoteVigente) && Number(producto?.stock) > 0

  const [pestanaActiva, setPestanaActiva] = useState('datos')
  const [historialPrecios, setHistorialPrecios] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(() => Boolean(producto?.id != null))
  const [errorHistorial, setErrorHistorial] = useState(null)

  const [categorias, setCategorias] = useState([])

  const [valores, setValores] = useState({
    nombre: producto?.nombre ?? '',
    marca: producto?.marca ?? '',
    descripcion: producto?.descripcion ?? '',
    categoriaId: obtenerCategoriaInicialId(producto),
    categoria: typeof producto?.categoria === 'string'
      ? producto.categoria
      : producto?.categoria?.nombre ?? CATEGORIAS_DISPONIBLES[0],
    precioVenta: producto?.precioVenta !== undefined && producto?.precioVenta !== null ? String(producto.precioVenta) : '',
    precioCosto: producto?.precioCosto !== undefined && producto?.precioCosto !== null ? String(producto.precioCosto) : '',
    stock: producto?.stock !== undefined && producto?.stock !== null ? String(producto.stock) : '0',
    enPromocion: Boolean(producto?.enPromocion),
    porcentajeDescuento: calcularPorcentajeInicial(producto),
    precioPromo: producto?.precioPromo !== undefined && producto?.precioPromo !== null ? String(producto.precioPromo) : '',
    destacado: Boolean(producto?.destacado),
    visibleCatalogo: Boolean(producto?.visibleCatalogo),
  })

  const [imagenArchivo, setImagenArchivo] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState(() =>
    producto?.imagen ? obtenerUrlImagenProducto(producto.imagen) : '',
  )
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)

  useEffect(() => {
    if (!vistaPrevia || !vistaPrevia.startsWith('blob:')) return undefined
    return () => URL.revokeObjectURL(vistaPrevia)
  }, [vistaPrevia])

  useEffect(() => {
    if (!visible) return
    let ignorar = false

    obtenerCategorias()
      .then((listaCats) => {
        if (ignorar) return
        const cats = (Array.isArray(listaCats) ? listaCats : []).filter((c) => c?.activo !== false)
        setCategorias(cats)

        setValores((prev) => {
          if (prev.categoriaId || cats.length === 0) return prev
          const nombreCat = typeof producto?.categoria === 'string'
            ? producto.categoria
            : producto?.categoria?.nombre
          const encontrada = cats.find((c) => c.nombre === nombreCat)
          return {
            ...prev,
            categoriaId: encontrada ? String(encontrada.id) : String(cats[0].id),
          }
        })
      })
      .catch(() => {
        // Fallback silencioso a categorías locales si falla la carga
      })

    return () => {
      ignorar = true
    }
  }, [visible, producto])

  useEffect(() => {
    if (!visible || producto?.id == null) return
    let ignorar = false

    obtenerHistorialPreciosProducto(producto.id)
      .then((registros) => {
        if (ignorar) return
        setHistorialPrecios(Array.isArray(registros) ? registros : [])
        setErrorHistorial(null)
      })
      .catch((err) => {
        if (!ignorar) {
          setErrorHistorial(err.message || 'No se pudo cargar el historial de costos')
        }
      })
      .finally(() => {
        if (!ignorar) {
          setCargandoHistorial(false)
        }
      })

    return () => {
      ignorar = true
    }
  }, [visible, producto?.id])

  if (!visible) return null

  const actualizarCampo = (campo, valor) => {
    setValores((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: null }))
    }
  }

  const actualizarPrecioVenta = (valor) => {
    const limpio = sanitizarDecimalPositivo(valor)
    const precioVentaNum = Number(limpio)
    const porcentajeNum = Number(valores.porcentajeDescuento)

    setValores((prev) => {
      const siguiente = { ...prev, precioVenta: limpio }
      if (
        prev.enPromocion &&
        prev.porcentajeDescuento !== '' &&
        Number.isFinite(precioVentaNum) &&
        precioVentaNum > 0 &&
        Number.isFinite(porcentajeNum)
      ) {
        const nuevoPrecioPromo = redondear2(precioVentaNum - (precioVentaNum * (porcentajeNum / 100)))
        siguiente.precioPromo = nuevoPrecioPromo >= 0 ? String(nuevoPrecioPromo) : ''
      }
      return siguiente
    })

    if (errores.precioVenta) {
      setErrores((prev) => ({ ...prev, precioVenta: null }))
    }
  }

  const manejarCambioPorcentaje = (valor) => {
    const limpio = sanitizarDecimalPositivo(valor)
    const porcentajeNum = Number(limpio)
    const precioVentaNum = Number(valores.precioVenta)

    setValores((prev) => {
      let nuevoPrecioPromo = prev.precioPromo
      if (limpio === '') {
        nuevoPrecioPromo = ''
      } else if (Number.isFinite(precioVentaNum) && precioVentaNum > 0 && Number.isFinite(porcentajeNum)) {
        const calculado = redondear2(precioVentaNum - (precioVentaNum * (porcentajeNum / 100)))
        nuevoPrecioPromo = calculado >= 0 ? String(calculado) : ''
      }
      return {
        ...prev,
        porcentajeDescuento: limpio,
        precioPromo: nuevoPrecioPromo,
      }
    })

    if (errores.porcentajeDescuento || errores.precioPromo) {
      setErrores((prev) => ({ ...prev, porcentajeDescuento: null, precioPromo: null }))
    }
  }

  const manejarCambioPrecioPromo = (valor) => {
    const limpio = sanitizarDecimalPositivo(valor)
    const precioPromoNum = Number(limpio)
    const precioVentaNum = Number(valores.precioVenta)

    setValores((prev) => {
      let nuevoPorcentaje = prev.porcentajeDescuento
      if (limpio === '') {
        nuevoPorcentaje = ''
      } else if (Number.isFinite(precioVentaNum) && precioVentaNum > 0 && Number.isFinite(precioPromoNum)) {
        const calculado = redondear2(100 - ((precioPromoNum * 100) / precioVentaNum))
        nuevoPorcentaje = calculado >= 0 ? String(calculado) : ''
      }
      return {
        ...prev,
        precioPromo: limpio,
        porcentajeDescuento: nuevoPorcentaje,
      }
    })

    if (errores.precioPromo || errores.porcentajeDescuento) {
      setErrores((prev) => ({ ...prev, precioPromo: null, porcentajeDescuento: null }))
    }
  }

  const validar = () => {
    const nuevosErrores = {}
    if (!valores.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio'
    if (!valores.marca.trim()) nuevosErrores.marca = 'La marca es obligatoria'
    if (categorias.length > 0 && !valores.categoriaId) {
      nuevosErrores.categoria = 'Debes seleccionar una categoría'
    } else if (categorias.length === 0 && !valores.categoria) {
      nuevosErrores.categoria = 'Debes seleccionar una categoría'
    }

    const precioVentaNum = Number(valores.precioVenta)
    if (valores.precioVenta === '' || isNaN(precioVentaNum) || precioVentaNum <= 0) {
      nuevosErrores.precioVenta = 'El precio de venta debe ser mayor a 0'
    }

    const precioCostoNum = Number(valores.precioCosto)
    if (valores.precioCosto === '' || isNaN(precioCostoNum) || precioCostoNum <= 0) {
      nuevosErrores.precioCosto = 'El precio de costo debe ser mayor a 0'
    }

    const stockNum = Number(valores.stock)
    if (valores.stock === '' || isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      nuevosErrores.stock = 'El stock debe ser un número entero mayor o igual a 0'
    }

    if (valores.enPromocion) {
      const porcentajeNum = Number(valores.porcentajeDescuento)
      if (
        valores.porcentajeDescuento === '' ||
        isNaN(porcentajeNum) ||
        porcentajeNum <= 0 ||
        porcentajeNum >= 100
      ) {
        nuevosErrores.porcentajeDescuento = 'El porcentaje debe ser mayor a 0 y menor a 100'
      }

      const precioPromoNum = Number(valores.precioPromo)
      if (
        valores.precioPromo === '' ||
        isNaN(precioPromoNum) ||
        precioPromoNum <= 0 ||
        (!isNaN(precioVentaNum) && precioVentaNum > 0 && precioPromoNum >= precioVentaNum)
      ) {
        nuevosErrores.precioPromo = 'El precio en promoción debe ser mayor a 0 y menor al precio de venta'
      }
    }

    if (tieneLotesVigentes && valores.visibleCatalogo && !producto?.imagen && !imagenArchivo) {
      const msg = 'Debe cargar una imagen para publicar el producto en el catálogo'
      nuevosErrores.imagen = msg
      nuevosErrores.visibleCatalogo = msg
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setErrorServidor(null)

    if (!validar()) return

    const formData = new FormData()
    formData.append('nombre', valores.nombre.trim())
    formData.append('marca', valores.marca.trim())
    formData.append('descripcion', valores.descripcion.trim())
    formData.append('precioVenta', String(Number(valores.precioVenta)))
    formData.append('precioCosto', String(Number(valores.precioCosto)))
    formData.append('stock', String(Number(valores.stock)))
    formData.append('enPromocion', String(valores.enPromocion))
    if (valores.enPromocion) {
      formData.append('precioPromo', String(Number(valores.precioPromo)))
    } else {
      formData.append('tipoPromocionId', '')
      formData.append('precioPromo', '')
    }
    formData.append('destacado', String(valores.destacado))
    formData.append('visibleCatalogo', String(Boolean(tieneLotesVigentes && valores.visibleCatalogo)))

    if (categorias.length > 0 && valores.categoriaId) {
      formData.append('categoriaId', String(Number(valores.categoriaId)))
    } else {
      formData.append('categoria', valores.categoria)
    }

    if (imagenArchivo) {
      formData.append('imagen', imagenArchivo)
    }

    try {
      await onGuardar(formData)
    } catch (err) {
      setErrorServidor(err.message || 'Error al guardar el producto')
    }
  }

  const ultimoCambioFecha = historialPrecios.length > 0
    ? formatearFecha(historialPrecios[0]?.fechaRegistro)
    : 'Sin cambios'

  const renderVariacionCosto = (item) => {
    if (item.precioCostoAnterior == null) {
      return (
        <span>
          <strong>{formatearPrecio(item.precioCostoNuevo)}</strong>{' '}
          <span className="prod-historial-badge prod-historial-badge-neutro">(Inicial)</span>
        </span>
      )
    }

    const anterior = Number(item.precioCostoAnterior)
    const nuevo = Number(item.precioCostoNuevo)
    const diffPct = Number.isFinite(anterior) && anterior > 0
      ? ((nuevo - anterior) / anterior) * 100
      : null

    let claseBadge = 'prod-historial-badge-neutro'
    let textoBadge = '0.0%'
    if (diffPct !== null && Math.abs(diffPct) >= 0.05) {
      claseBadge = diffPct > 0 ? 'prod-historial-badge-suba' : 'prod-historial-badge-baja'
      textoBadge = `${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%`
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span>
          {formatearPrecio(item.precioCostoAnterior)} → <strong>{formatearPrecio(item.precioCostoNuevo)}</strong>
        </span>
        {diffPct !== null && (
          <span className={`prod-historial-badge ${claseBadge}`}>{textoBadge}</span>
        )}
      </div>
    )
  }

  const renderPrecioVentaHistorial = (item) => {
    const ventaAnt = item.precioVentaAnterior != null ? Number(item.precioVentaAnterior) : null
    const ventaNva = Number(item.precioVentaNuevo)
    if (ventaAnt !== null && Number.isFinite(ventaAnt) && Math.abs(ventaAnt - ventaNva) >= 0.01) {
      return (
        <span>
          {formatearPrecio(ventaAnt)} → <strong>{formatearPrecio(ventaNva)}</strong>
        </span>
      )
    }
    return <span>{formatearPrecio(ventaNva)}</span>
  }

  const renderReferenciaHistorial = (item) => {
    if (item.proveedorNombre || item.cantidadLote != null || item.ordenCompraId != null || item.loteId != null) {
      return `${item.proveedorNombre || 'Orden de compra'}${item.cantidadLote ? ` · ${item.cantidadLote} u.` : ''}`
    }
    return 'Catálogo admin'
  }

  return (
    <Modal
      titulo={
        soloLectura
          ? `Detalle del Producto: ${producto?.nombre || ''}`
          : editando
            ? `Editar Producto: ${producto.nombre}`
            : 'Nuevo Producto'
      }
      onCerrar={onCerrar}
      tamanio="normal"
      headerExtra={
        tieneIdProducto ? (
          <div className="prod-modal-tabs flex-shrink-0" role="tablist" aria-label="Secciones del producto">
            <button
              type="button"
              role="tab"
              aria-selected={pestanaActiva === 'datos'}
              className={`prod-modal-tab${pestanaActiva === 'datos' ? ' prod-modal-tab-activa' : ''}`}
              onClick={() => setPestanaActiva('datos')}
            >
              Datos del Producto
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={pestanaActiva === 'historial'}
              className={`prod-modal-tab${pestanaActiva === 'historial' ? ' prod-modal-tab-activa' : ''}`}
              onClick={() => setPestanaActiva('historial')}
            >
              Historial de Costos
            </button>
          </div>
        ) : null
      }
    >
      {tieneIdProducto && pestanaActiva === 'historial' ? (
        <div className="orden-form flex flex-col max-h-[90vh] flex-1 min-h-0 overflow-hidden">
          <div className="orden-modal-cuerpo prod-modal-scroll-body prod-historial-contenedor flex-1 overflow-y-auto p-6">
            <div className="prod-historial-resumen">
              <div className="prod-historial-tarjeta">
                <span className="prod-historial-tarjeta-etiqueta">Costo Actual</span>
                <span className="prod-historial-tarjeta-valor">
                  {formatearPrecio(producto.precioCosto)}
                </span>
                <span className="prod-historial-tarjeta-sub">
                  Precio de Venta actual: {formatearPrecio(producto.precioVenta)}
                </span>
              </div>

              <div className="prod-historial-tarjeta">
                <span className="prod-historial-tarjeta-etiqueta">Registros en Historial</span>
                <span className="prod-historial-tarjeta-valor">
                  {historialPrecios.length} {historialPrecios.length === 1 ? 'movimiento' : 'movimientos'}
                </span>
                <span className="prod-historial-tarjeta-sub">
                  Último cambio: {ultimoCambioFecha}
                </span>
              </div>
            </div>

            {cargandoHistorial ? (
              <p className="orden-form-cargando" role="status">
                Cargando historial de costos...
              </p>
            ) : errorHistorial ? (
              <div className="orden-alerta orden-alerta-error" role="alert">
                <span>{errorHistorial}</span>
              </div>
            ) : historialPrecios.length === 0 ? (
              <p className="orden-lotes-vacio">
                Aún no hay movimientos de costos registrados para este producto.
              </p>
            ) : (
              <div className="prod-historial-tabla-scroll max-h-80 overflow-y-auto">
                <table className="orden-tabla-lotes" style={{ border: 'none', borderRadius: 0 }}>
                  <thead>
                    <tr>
                      <th>Fecha y Origen</th>
                      <th>Costo Unitario</th>
                      <th>Precio de Venta</th>
                      <th>Referencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialPrecios.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                            <span>{formatearFecha(item.fechaRegistro)}</span>
                            <span className="prod-historial-badge prod-historial-badge-origen">
                              {ETIQUETAS_ORIGEN_HISTORIAL[item.origen] || item.origen || 'Movimiento'}
                            </span>
                          </div>
                        </td>
                        <td>{renderVariacionCosto(item)}</td>
                        <td>{renderPrecioVentaHistorial(item)}</td>
                        <td>{renderReferenciaHistorial(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="orden-modal-acciones prod-modal-acciones flex-shrink-0 bg-slate-800 border-t border-slate-700 p-4 flex justify-end gap-3">
            <button
              type="button"
              className="orden-btn prod-btn-secundario border border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:hover:text-white"
              onClick={() => setPestanaActiva('datos')}
            >
              Volver a datos
            </button>
            <button
              type="button"
              className="orden-btn prod-btn-primario"
              onClick={onCerrar}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
      <form className="orden-form flex flex-col max-h-[90vh] flex-1 min-h-0 overflow-hidden" onSubmit={manejarEnvio} noValidate>
        <div className="orden-modal-cuerpo prod-modal-scroll-body flex-1 overflow-y-auto p-6">
          <div
            className="prod-modal-cuerpo"
            style={soloLectura ? { pointerEvents: 'none', opacity: 0.85 } : undefined}
          >
          {errorServidor && (
            <div className="orden-alerta orden-alerta-error prod-modal-span-2" role="alert">
              <span>{errorServidor}</span>
            </div>
          )}

          <div className="prod-modal-span-2">
            <CampoFormulario label="Nombre del producto *" id="prod-nombre" error={errores.nombre}>
              <input
                id="prod-nombre"
                type="text"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                placeholder="Ej. Alfajor de Chocolate"
                value={valores.nombre}
                onChange={(e) => actualizarCampo('nombre', e.target.value)}
                disabled={guardando}
                autoFocus
              />
            </CampoFormulario>
          </div>

          <CampoFormulario label="Marca *" id="prod-marca" error={errores.marca}>
            <input
              id="prod-marca"
              type="text"
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
              placeholder="Ej. Havanna"
              value={valores.marca}
              onChange={(e) => actualizarCampo('marca', e.target.value)}
              disabled={guardando}
            />
          </CampoFormulario>

          <CampoFormulario label="Categoría *" id="prod-categoria" error={errores.categoria}>
            {categorias.length > 0 ? (
              <select
                id="prod-categoria"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                value={valores.categoriaId}
                onChange={(e) => actualizarCampo('categoriaId', e.target.value)}
                disabled={guardando}
              >
                <option value="">Elegí una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <select
                id="prod-categoria"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                value={valores.categoria}
                onChange={(e) => actualizarCampo('categoria', e.target.value)}
                disabled={guardando}
              >
                {CATEGORIAS_DISPONIBLES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </CampoFormulario>

          <div className="prod-modal-grilla-3">
            <CampoFormulario label="Precio Costo ($) *" id="prod-costo" error={errores.precioCosto}>
              <input
                id="prod-costo"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                value={valores.precioCosto}
                onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                onChange={(e) => actualizarCampo('precioCosto', sanitizarDecimalPositivo(e.target.value))}
                disabled={guardando}
              />
            </CampoFormulario>

            <CampoFormulario label="Precio Venta ($) *" id="prod-venta" error={errores.precioVenta}>
              <input
                id="prod-venta"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                value={valores.precioVenta}
                onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                onChange={(e) => actualizarPrecioVenta(e.target.value)}
                disabled={guardando}
              />
            </CampoFormulario>

            <CampoFormulario label="Stock actual (calculado por lotes)" id="prod-stock" error={errores.stock}>
              <input
                id="prod-stock"
                type="number"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                value={valores.stock}
                readOnly
                disabled
                title="El stock se calcula automáticamente como la suma de sus lotes activos y vigentes"
                style={{ cursor: 'not-allowed' }}
              />
            </CampoFormulario>
          </div>

          <div className="prod-modal-span-2">
            <CampoFormulario label="Descripción" id="prod-descripcion" error={errores.descripcion}>
              <textarea
                id="prod-descripcion"
                rows={2}
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                placeholder="Descripción del producto"
                value={valores.descripcion}
                onChange={(e) => actualizarCampo('descripcion', e.target.value)}
                disabled={guardando}
              />
            </CampoFormulario>
          </div>

          <div className="prod-modal-span-2">
            <CampoFormulario
              label={tieneLotesVigentes && valores.visibleCatalogo && !producto?.imagen ? 'Imagen del producto *' : 'Imagen del producto (opcional)'}
              id="prod-imagen"
              error={errores.imagen}
            >
              <input
                id="prod-imagen"
                type="file"
                accept="image/*"
                className="orden-visually-hidden"
                required={tieneLotesVigentes && valores.visibleCatalogo && !producto?.imagen}
                onChange={(e) => {
                  const archivo = e.target.files?.[0] || null
                  setImagenArchivo(archivo)
                  setVistaPrevia(
                    archivo
                      ? URL.createObjectURL(archivo)
                      : (producto?.imagen ? obtenerUrlImagenProducto(producto.imagen) : '')
                  )
                  if (errores.imagen || errores.visibleCatalogo) {
                    setErrores((prev) => ({ ...prev, imagen: null, visibleCatalogo: null }))
                  }
                }}
                disabled={guardando}
              />
              <label
                htmlFor="prod-imagen"
                className={`prod-dropzone${guardando ? ' prod-dropzone-deshabilitada' : ''}`}
              >
                <div className="prod-dropzone-info">
                  <span className="prod-dropzone-icono" aria-hidden="true">
                    <LuImagePlus size={18} />
                  </span>
                  <div className="prod-dropzone-textos">
                    <span className="prod-dropzone-titulo">Haz clic para subir una imagen</span>
                    {(imagenArchivo || vistaPrevia) && (
                      <span className="prod-dropzone-archivo">
                        {imagenArchivo ? imagenArchivo.name : 'Imagen actual cargada'}
                      </span>
                    )}
                  </div>
                </div>
                {vistaPrevia && (
                  <img
                    src={vistaPrevia}
                    alt="Vista previa del producto"
                    className="prod-dropzone-preview"
                    onError={manejarErrorImagenProducto}
                  />
                )}
              </label>
            </CampoFormulario>
          </div>

          <div className="prod-switches-fila">
            <div className="prod-switch-bloque">
              <label className={`prod-switch-label${guardando ? ' prod-switch-label-deshabilitada' : ''}`}>
                <span className="prod-switch-control">
                  <input
                    type="checkbox"
                    role="switch"
                    className="prod-switch-input"
                    checked={valores.enPromocion}
                    onChange={(e) => {
                      const check = e.target.checked
                      setValores((prev) => ({
                        ...prev,
                        enPromocion: check,
                        ...(check
                          ? {}
                          : {
                              porcentajeDescuento: '',
                              precioPromo: '',
                            }),
                      }))
                      if (!check) {
                        setErrores((prev) => ({
                          ...prev,
                          porcentajeDescuento: null,
                          precioPromo: null,
                        }))
                      }
                    }}
                    disabled={guardando}
                  />
                  <span className="prod-switch-slider" aria-hidden="true" />
                </span>
                <span>¿En promoción?</span>
              </label>
            </div>

            <div className="prod-switch-bloque">
              <label className={`prod-switch-label${guardando ? ' prod-switch-label-deshabilitada' : ''}`}>
                <span className="prod-switch-control">
                  <input
                    type="checkbox"
                    role="switch"
                    className="prod-switch-input"
                    checked={valores.destacado}
                    onChange={(e) => actualizarCampo('destacado', e.target.checked)}
                    disabled={guardando}
                  />
                  <span className="prod-switch-slider" aria-hidden="true" />
                </span>
                <span>¿Destacado en catálogo?</span>
              </label>
            </div>

            <div className="prod-switch-bloque">
              <label
                className={`prod-switch-label${guardando || !tieneLotesVigentes ? ' prod-switch-label-deshabilitada' : ''}`}
              >
                <span className="prod-switch-control">
                  <input
                    type="checkbox"
                    role="switch"
                    className="prod-switch-input"
                    checked={tieneLotesVigentes ? valores.visibleCatalogo : false}
                    onChange={(e) => {
                      const check = e.target.checked
                      if (check && !producto?.imagen && !imagenArchivo) {
                        const msg = 'Debe cargar una imagen para publicar el producto en el catálogo'
                        setErrores((prev) => ({
                          ...prev,
                          visibleCatalogo: msg,
                          imagen: msg,
                        }))
                        return
                      }
                      actualizarCampo('visibleCatalogo', check)
                      if (!check && errores.imagen === 'Debe cargar una imagen para publicar el producto en el catálogo') {
                        setErrores((prev) => ({ ...prev, imagen: null }))
                      }
                    }}
                    disabled={guardando || !tieneLotesVigentes}
                  />
                  <span className="prod-switch-slider" aria-hidden="true" />
                </span>
                <span>Mostrar en Catálogo Público</span>
              </label>
              {!tieneLotesVigentes && (
                <p className="orden-campo-error">
                  No hay lotes vigentes. No se puede hacer público.
                </p>
              )}
              {errores.visibleCatalogo && (
                <p className="orden-campo-error" role="alert">
                  {errores.visibleCatalogo}
                </p>
              )}
            </div>
          </div>

          {valores.enPromocion && (
            <>
              <CampoFormulario
                label="Porcentaje de descuento (%)"
                id="prod-porcentaje-promo"
                error={errores.porcentajeDescuento}
              >
                <input
                  id="prod-porcentaje-promo"
                  type="number"
                  min="0.01"
                  max="99.99"
                  step="0.01"
                  inputMode="decimal"
                  className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                  placeholder="Ej. 15"
                  value={valores.porcentajeDescuento}
                  onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                  onChange={(e) => manejarCambioPorcentaje(e.target.value)}
                  disabled={guardando}
                />
              </CampoFormulario>

              <CampoFormulario
                label="Precio en promoción ($)"
                id="prod-promo"
                error={errores.precioPromo}
              >
                <input
                  id="prod-promo"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                  placeholder="Precio con descuento"
                  value={valores.precioPromo}
                  onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                  onChange={(e) => manejarCambioPrecioPromo(e.target.value)}
                  disabled={guardando}
                />
              </CampoFormulario>
            </>
          )}
          </div>
        </div>

        <div className="orden-modal-acciones prod-modal-acciones flex-shrink-0 bg-slate-800 border-t border-slate-700 p-4 flex justify-end gap-3">
          <button
            type="button"
            className="orden-btn prod-btn-secundario border border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:hover:text-white"
            onClick={onCerrar}
            disabled={guardando}
          >
            {soloLectura ? 'Cerrar' : 'Cancelar'}
          </button>
          {!soloLectura && (
            <button
              type="submit"
              className="orden-btn prod-btn-primario"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
            </button>
          )}
        </div>
      </form>
      )}
    </Modal>
  )
}

export default ModalFormProducto
