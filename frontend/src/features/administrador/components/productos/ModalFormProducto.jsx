import { useEffect, useState } from 'react'
import Modal from '../comunes/Modal'
import CampoFormulario from '../comunes/CampoFormulario'
import {
  obtenerCategorias,
  obtenerTiposPromocion,
} from '../../services/productosServices'
import {
  bloquearTeclasNoNumericas,
  sanitizarDecimalPositivo,
  sanitizarEnteroPositivo,
} from '../../../../shared/utils/validaciones'
import {
  manejarErrorImagenProducto,
  obtenerUrlImagenProducto,
} from '../../../../shared/utils/formato'

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

function obtenerTipoPromocionInicialId(producto) {
  if (producto?.tipoPromocionId != null) return String(producto.tipoPromocionId)
  if (producto?.tipoPromocion?.id != null) return String(producto.tipoPromocion.id)
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

function ModalFormProducto({ producto, visible, guardando, onGuardar, onCerrar }) {
  const editando = Boolean(producto)
  const sinLotesVigentes = editando && producto?.tieneLoteVigente === false

  const [categorias, setCategorias] = useState([])
  const [tiposPromocion, setTiposPromocion] = useState([])

  const [valores, setValores] = useState({
    nombre: producto?.nombre ?? '',
    marca: producto?.marca ?? '',
    descripcion: producto?.descripcion ?? '',
    categoriaId: obtenerCategoriaInicialId(producto),
    categoria: typeof producto?.categoria === 'string'
      ? producto.categoria
      : producto?.categoria?.nombre ?? CATEGORIAS_DISPONIBLES[0],
    tipoPromocionId: obtenerTipoPromocionInicialId(producto),
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
    if (!imagenArchivo) {
      setVistaPrevia(producto?.imagen ? obtenerUrlImagenProducto(producto.imagen) : '')
      return
    }
    const objectUrl = URL.createObjectURL(imagenArchivo)
    setVistaPrevia(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imagenArchivo, producto])

  useEffect(() => {
    if (!visible) return
    let ignorar = false

    Promise.all([obtenerCategorias(), obtenerTiposPromocion()])
      .then(([listaCats, listaPromos]) => {
        if (ignorar) return
        const cats = (Array.isArray(listaCats) ? listaCats : []).filter((c) => c?.activo !== false)
        const promos = (Array.isArray(listaPromos) ? listaPromos : []).filter((p) => p?.activo !== false)
        setCategorias(cats)
        setTiposPromocion(promos)

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

  if (!visible) return null

  const tipoPromocionSeleccionado = tiposPromocion.find(
    (tp) => String(tp.id) === String(valores.tipoPromocionId),
  )
  const esTipoDescuento = Boolean(
    tipoPromocionSeleccionado?.nombre?.toLowerCase().includes('descuento'),
  )

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
        esTipoDescuento &&
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

    if (valores.enPromocion && esTipoDescuento) {
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

    if (valores.visibleCatalogo && !producto?.imagen && !imagenArchivo) {
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
      formData.append('tipoPromocionId', valores.tipoPromocionId ? String(Number(valores.tipoPromocionId)) : '')
      formData.append('precioPromo', esTipoDescuento ? String(Number(valores.precioPromo)) : '')
    } else {
      formData.append('tipoPromocionId', '')
      formData.append('precioPromo', '')
    }
    formData.append('destacado', String(valores.destacado))
    formData.append('visibleCatalogo', String(Boolean(valores.visibleCatalogo)))

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

  return (
    <Modal
      titulo={editando ? `Editar Producto: ${producto.nombre}` : 'Nuevo Producto'}
      onCerrar={onCerrar}
      tamanio="normal"
    >
      <form className="orden-form" onSubmit={manejarEnvio} noValidate>
        <div className="orden-modal-cuerpo" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          {errorServidor && (
            <div className="orden-alerta orden-alerta-error" role="alert" style={{ gridColumn: 'span 2' }}>
              <span>{errorServidor}</span>
            </div>
          )}

          <div style={{ gridColumn: 'span 2' }}>
            <CampoFormulario label="Nombre del Producto *" id="prod-nombre" error={errores.nombre}>
              <input
                id="prod-nombre"
                type="text"
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

          <div style={{ gridColumn: 'span 2' }}>
            <CampoFormulario label="Descripción" id="prod-descripcion" error={errores.descripcion}>
              <textarea
                id="prod-descripcion"
                rows={2}
                placeholder="Descripción del producto"
                value={valores.descripcion}
                onChange={(e) => actualizarCampo('descripcion', e.target.value)}
                disabled={guardando}
              />
            </CampoFormulario>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <CampoFormulario label="Stock actual *" id="prod-stock" error={errores.stock}>
              <input
                id="prod-stock"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={valores.stock}
                onKeyDown={(e) => bloquearTeclasNoNumericas(e, false)}
                onChange={(e) => actualizarCampo('stock', sanitizarEnteroPositivo(e.target.value))}
                disabled={guardando}
              />
            </CampoFormulario>
          </div>

          <CampoFormulario label="Precio Costo ($) *" id="prod-costo" error={errores.precioCosto}>
            <input
              id="prod-costo"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
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
              value={valores.precioVenta}
              onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
              onChange={(e) => actualizarPrecioVenta(e.target.value)}
              disabled={guardando}
            />
          </CampoFormulario>

          <div style={{ gridColumn: 'span 2' }}>
            <CampoFormulario
              label={valores.visibleCatalogo && !producto?.imagen ? 'Imagen del producto *' : 'Imagen del producto (opcional)'}
              id="prod-imagen"
              error={errores.imagen}
            >
              <input
                id="prod-imagen"
                type="file"
                accept="image/*"
                required={valores.visibleCatalogo && !producto?.imagen}
                onChange={(e) => {
                  const archivo = e.target.files?.[0] || null
                  setImagenArchivo(archivo)
                  if (errores.imagen || errores.visibleCatalogo) {
                    setErrores((prev) => ({ ...prev, imagen: null, visibleCatalogo: null }))
                  }
                }}
                disabled={guardando}
              />
              {vistaPrevia && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img
                    src={vistaPrevia}
                    alt="Vista previa del producto"
                    onError={manejarErrorImagenProducto}
                    style={{
                      width: '96px',
                      height: '96px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                    }}
                  />
                </div>
              )}
            </CampoFormulario>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={valores.enPromocion}
                onChange={(e) => {
                  const check = e.target.checked
                  setValores((prev) => ({
                    ...prev,
                    enPromocion: check,
                    ...(check
                      ? {}
                      : {
                          tipoPromocionId: '',
                          porcentajeDescuento: '',
                          precioPromo: '',
                        }),
                  }))
                  if (!check) {
                    setErrores((prev) => ({
                      ...prev,
                      tipoPromocionId: null,
                      porcentajeDescuento: null,
                      precioPromo: null,
                    }))
                  }
                }}
                disabled={guardando}
              />
              ¿En promoción?
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={valores.destacado}
                onChange={(e) => actualizarCampo('destacado', e.target.checked)}
                disabled={guardando}
              />
              ¿Destacado en catálogo?
            </label>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: sinLotesVigentes ? 'not-allowed' : 'pointer',
                opacity: sinLotesVigentes ? 0.65 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={valores.visibleCatalogo}
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
                disabled={guardando || sinLotesVigentes}
              />
              Mostrar en Catálogo Público
            </label>
            {sinLotesVigentes && (
              <p className="orden-campo-error" style={{ margin: 0 }}>
                No hay lotes vigentes
              </p>
            )}
            {errores.visibleCatalogo && (
              <p className="orden-campo-error" role="alert" style={{ margin: 0 }}>
                {errores.visibleCatalogo}
              </p>
            )}
          </div>

          {valores.enPromocion && (
            <div style={{ gridColumn: 'span 2' }}>
              <CampoFormulario label="Tipo de promoción" id="prod-tipo-promo" error={errores.tipoPromocionId}>
                <select
                  id="prod-tipo-promo"
                  value={valores.tipoPromocionId}
                  onChange={(e) => {
                    const nuevoTipoId = e.target.value
                    const nuevoTipo = tiposPromocion.find((tp) => String(tp.id) === String(nuevoTipoId))
                    const nuevoEsDescuento = Boolean(
                      nuevoTipo?.nombre?.toLowerCase().includes('descuento'),
                    )
                    setValores((prev) => ({
                      ...prev,
                      tipoPromocionId: nuevoTipoId,
                      ...(nuevoEsDescuento
                        ? {}
                        : {
                            porcentajeDescuento: '',
                            precioPromo: '',
                          }),
                    }))
                    setErrores((prev) => ({
                      ...prev,
                      tipoPromocionId: null,
                      porcentajeDescuento: null,
                      precioPromo: null,
                    }))
                  }}
                  disabled={guardando}
                >
                  <option value="">Ninguna</option>
                  {tiposPromocion.map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      {tp.nombre}
                    </option>
                  ))}
                </select>
              </CampoFormulario>
            </div>
          )}

          {valores.enPromocion && esTipoDescuento && (
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

        <div className="orden-modal-acciones">
          <button
            type="button"
            className="orden-btn"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="orden-btn orden-btn-primario"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : editando ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalFormProducto
