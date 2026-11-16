import { useEffect, useState } from 'react'
import Modal from '../comunes/Modal'
import CampoFormulario from '../comunes/CampoFormulario'
import {
  obtenerCategorias,
  obtenerTiposPromocion,
} from '../../services/productosServices'

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

function ModalFormProducto({ producto, visible, guardando, onGuardar, onCerrar }) {
  const editando = Boolean(producto)

  const [categorias, setCategorias] = useState([])
  const [tiposPromocion, setTiposPromocion] = useState([])

  const [valores, setValores] = useState({
    nombre: producto?.nombre ?? '',
    marca: producto?.marca ?? '',
    descripcion: producto?.descripcion ?? '',
    peso: producto?.peso !== undefined && producto?.peso !== null ? String(producto.peso) : '',
    categoriaId: obtenerCategoriaInicialId(producto),
    categoria: typeof producto?.categoria === 'string'
      ? producto.categoria
      : producto?.categoria?.nombre ?? CATEGORIAS_DISPONIBLES[0],
    tipoPromocionId: obtenerTipoPromocionInicialId(producto),
    precioVenta: producto?.precioVenta !== undefined && producto?.precioVenta !== null ? String(producto.precioVenta) : '',
    precioCosto: producto?.precioCosto !== undefined && producto?.precioCosto !== null ? String(producto.precioCosto) : '',
    stock: producto?.stock !== undefined && producto?.stock !== null ? String(producto.stock) : '0',
    enPromocion: Boolean(producto?.enPromocion),
    precioPromo: producto?.precioPromo !== undefined && producto?.precioPromo !== null ? String(producto.precioPromo) : '',
    destacado: Boolean(producto?.destacado),
  })

  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)

  useEffect(() => {
    if (!visible) return
    let ignorar = false

    Promise.all([obtenerCategorias(), obtenerTiposPromocion()])
      .then(([listaCats, listaPromos]) => {
        if (ignorar) return
        const cats = Array.isArray(listaCats) ? listaCats : []
        const promos = Array.isArray(listaPromos) ? listaPromos : []
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

  const validar = () => {
    const nuevosErrores = {}
    if (!valores.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio'
    if (!valores.marca.trim()) nuevosErrores.marca = 'La marca es obligatoria'
    if (categorias.length > 0 && !valores.categoriaId) {
      nuevosErrores.categoria = 'Debes seleccionar una categoría'
    } else if (categorias.length === 0 && !valores.categoria) {
      nuevosErrores.categoria = 'Debes seleccionar una categoría'
    }

    const pesoNum = Number(valores.peso)
    if (valores.peso === '' || isNaN(pesoNum) || pesoNum <= 0) {
      nuevosErrores.peso = 'El peso debe ser un número mayor a 0 (ej. 500 para gramos o 1.5)'
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
    if (valores.stock === '' || isNaN(stockNum) || stockNum < 0) {
      nuevosErrores.stock = 'El stock debe ser un número entero mayor o igual a 0'
    }

    if (valores.enPromocion) {
      const precioPromoNum = Number(valores.precioPromo)
      if (valores.precioPromo === '' || isNaN(precioPromoNum) || precioPromoNum <= 0) {
        nuevosErrores.precioPromo = 'Ingresa un precio promocional mayor a 0'
      }
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setErrorServidor(null)

    if (!validar()) return

    const payload = {
      nombre: valores.nombre.trim(),
      marca: valores.marca.trim(),
      descripcion: valores.descripcion.trim(),
      peso: Number(valores.peso),
      precioVenta: Number(valores.precioVenta),
      precioCosto: Number(valores.precioCosto),
      stock: Number(valores.stock),
      enPromocion: valores.enPromocion,
      precioPromo: valores.enPromocion ? Number(valores.precioPromo) : null,
      tipoPromocionId: valores.tipoPromocionId ? Number(valores.tipoPromocionId) : null,
      destacado: valores.destacado,
    }

    if (categorias.length > 0 && valores.categoriaId) {
      payload.categoriaId = Number(valores.categoriaId)
    } else {
      payload.categoria = valores.categoria
    }

    try {
      await onGuardar(payload)
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

          <CampoFormulario label="Peso / Tamaño (número > 0) *" id="prod-peso" error={errores.peso}>
            <input
              id="prod-peso"
              type="number"
              min="0.01"
              step="any"
              placeholder="Ej. 1000 (para 1kg) o 500"
              value={valores.peso}
              onChange={(e) => actualizarCampo('peso', e.target.value)}
              disabled={guardando}
            />
          </CampoFormulario>

          <CampoFormulario label="Stock actual *" id="prod-stock" error={errores.stock}>
            <input
              id="prod-stock"
              type="number"
              min="0"
              value={valores.stock}
              onChange={(e) => actualizarCampo('stock', e.target.value)}
              disabled={guardando}
            />
          </CampoFormulario>

          <CampoFormulario label="Precio Costo ($) *" id="prod-costo" error={errores.precioCosto}>
            <input
              id="prod-costo"
              type="number"
              min="0.01"
              step="0.01"
              value={valores.precioCosto}
              onChange={(e) => actualizarCampo('precioCosto', e.target.value)}
              disabled={guardando}
            />
          </CampoFormulario>

          <CampoFormulario label="Precio Venta ($) *" id="prod-venta" error={errores.precioVenta}>
            <input
              id="prod-venta"
              type="number"
              min="0.01"
              step="0.01"
              value={valores.precioVenta}
              onChange={(e) => actualizarCampo('precioVenta', e.target.value)}
              disabled={guardando}
            />
          </CampoFormulario>

          <div style={{ gridColumn: 'span 2' }}>
            <CampoFormulario label="Tipo de promoción" id="prod-tipo-promo" error={errores.tipoPromocionId}>
              <select
                id="prod-tipo-promo"
                value={valores.tipoPromocionId}
                onChange={(e) => actualizarCampo('tipoPromocionId', e.target.value)}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={valores.enPromocion}
                onChange={(e) => {
                  const check = e.target.checked
                  actualizarCampo('enPromocion', check)
                  if (!check) {
                    actualizarCampo('precioPromo', '')
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

          {valores.enPromocion && (
            <div style={{ gridColumn: 'span 2' }}>
              <CampoFormulario label="Precio Promocional ($) *" id="prod-promo" error={errores.precioPromo}>
                <input
                  id="prod-promo"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Precio con descuento"
                  value={valores.precioPromo}
                  onChange={(e) => actualizarCampo('precioPromo', e.target.value)}
                  disabled={guardando}
                />
              </CampoFormulario>
            </div>
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
