import { useEffect, useMemo, useState } from 'react'
import { LuImagePlus } from 'react-icons/lu'
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
  porcentajeDescuento,
  precioConDescuento,
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

function calcularPorcentajeInicial(producto) {
  const pct = porcentajeDescuento(producto?.precioVenta, producto?.precioPromo)
  return pct !== null ? String(pct) : ''
}

function ModalFormProducto({ producto, visible, guardando, soloLectura = false, onGuardar, onCerrar }) {
  const editando = Boolean(producto)
  const tieneLotesVigentes = Boolean(producto?.tieneLoteVigente) && Number(producto?.stock) > 0

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
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)

  const vistaPreviaArchivo = useMemo(
    () => (imagenArchivo ? URL.createObjectURL(imagenArchivo) : ''),
    [imagenArchivo],
  )

  useEffect(() => {
    if (!vistaPreviaArchivo) return undefined
    return () => URL.revokeObjectURL(vistaPreviaArchivo)
  }, [vistaPreviaArchivo])

  const vistaPrevia =
    vistaPreviaArchivo ||
    (producto?.imagen ? obtenerUrlImagenProducto(producto.imagen) : '')

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
        Number.isInteger(porcentajeNum) &&
        porcentajeNum >= 1 &&
        porcentajeNum < 100
      ) {
        const nuevoPrecioPromo = precioConDescuento(precioVentaNum, porcentajeNum)
        siguiente.precioPromo =
          Number.isFinite(nuevoPrecioPromo) && nuevoPrecioPromo > 0
            ? String(nuevoPrecioPromo)
            : ''
      }
      return siguiente
    })

    if (errores.precioVenta) {
      setErrores((prev) => ({ ...prev, precioVenta: null }))
    }
  }

  const manejarCambioPorcentaje = (valor) => {
    const limpio = sanitizarEnteroPositivo(valor)
    const porcentajeNum = Number(limpio)
    const precioVentaNum = Number(valores.precioVenta)

    setValores((prev) => {
      let nuevoPrecioPromo = ''
      if (
        limpio !== '' &&
        Number.isFinite(precioVentaNum) &&
        precioVentaNum > 0 &&
        Number.isInteger(porcentajeNum) &&
        porcentajeNum >= 1 &&
        porcentajeNum < 100
      ) {
        const calculado = precioConDescuento(precioVentaNum, porcentajeNum)
        nuevoPrecioPromo = Number.isFinite(calculado) && calculado > 0 ? String(calculado) : ''
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
      let nuevoPorcentaje = ''
      if (
        limpio !== '' &&
        Number.isFinite(precioVentaNum) &&
        precioVentaNum > 0 &&
        Number.isFinite(precioPromoNum)
      ) {
        const calculado = porcentajeDescuento(precioVentaNum, precioPromoNum)
        nuevoPorcentaje = calculado !== null ? String(calculado) : ''
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
        !Number.isInteger(porcentajeNum) ||
        porcentajeNum < 1 ||
        porcentajeNum >= 100
      ) {
        nuevosErrores.porcentajeDescuento = 'El porcentaje debe ser un entero entre 1% y 99%'
      }

      const precioPromoNum = Number(valores.precioPromo)
      if (
        valores.precioPromo === '' ||
        isNaN(precioPromoNum) ||
        precioPromoNum <= 0 ||
        (!isNaN(precioVentaNum) && precioVentaNum > 0 && precioPromoNum >= precioVentaNum)
      ) {
        nuevosErrores.precioPromo = 'El precio en promoción debe ser mayor a 0 y menor al precio de venta'
      } else if (
        !isNaN(precioVentaNum) &&
        precioVentaNum > 0 &&
        porcentajeDescuento(precioVentaNum, precioPromoNum) === null
      ) {
        nuevosErrores.precioPromo = 'El descuento debe ser de al menos 1% y menor al 100%'
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
      const precioPromoNormalizado = precioConDescuento(
        Number(valores.precioVenta),
        Number(valores.porcentajeDescuento),
      )
      formData.append('tipoPromocionId', valores.tipoPromocionId ? String(Number(valores.tipoPromocionId)) : '')
      formData.append(
        'precioPromo',
        String(Number.isFinite(precioPromoNormalizado) ? precioPromoNormalizado : Number(valores.precioPromo)),
      )
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
    >
      <form className="orden-form" onSubmit={manejarEnvio} noValidate>
        <fieldset disabled={soloLectura} style={{ border: 'none', padding: 0, margin: 0 }}>
          <div className="orden-modal-cuerpo prod-modal-cuerpo">
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

          <div className="prod-modal-grilla-3">
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

            <CampoFormulario label="Stock actual (calculado por lotes)" id="prod-stock" error={errores.stock}>
              <input
                id="prod-stock"
                type="number"
                value={valores.stock}
                readOnly
                disabled
                title="El stock se calcula automáticamente como la suma de sus lotes activos y vigentes"
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              />
            </CampoFormulario>
          </div>

          <div className="prod-modal-span-2">
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
              <div className="prod-modal-span-2">
                <CampoFormulario label="Tipo de promoción" id="prod-tipo-promo" error={errores.tipoPromocionId}>
                  <select
                    id="prod-tipo-promo"
                    value={valores.tipoPromocionId}
                    onChange={(e) => {
                      const nuevoTipoId = e.target.value
                      setValores((prev) => ({
                        ...prev,
                        tipoPromocionId: nuevoTipoId,
                      }))
                      setErrores((prev) => ({
                        ...prev,
                        tipoPromocionId: null,
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

              <CampoFormulario
                label="Porcentaje de descuento (%)"
                id="prod-porcentaje-promo"
                error={errores.porcentajeDescuento}
              >
                <input
                  id="prod-porcentaje-promo"
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  inputMode="numeric"
                  placeholder="Ej. 15"
                  value={valores.porcentajeDescuento}
                  onKeyDown={(e) => bloquearTeclasNoNumericas(e, false)}
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
        </fieldset>

        <div className="orden-modal-acciones prod-modal-acciones">
          <button
            type="button"
            className="orden-btn prod-btn-secundario"
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
    </Modal>
  )
}

export default ModalFormProducto
