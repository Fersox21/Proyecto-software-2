import { useEffect, useState } from 'react'
import { LuImagePlus } from 'react-icons/lu'
import { crearCategoria } from '../../services/ordenesCompraService'
import {
  bloquearTeclasNoNumericas,
  sanitizarDecimalPositivo,
} from '../../../../shared/utils/validaciones'

function redondear2(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

function NuevoProductoInlineForm({
  indice,
  producto,
  categorias,
  errores,
  onCambiarCampo,
  onCategoriaCreada,
}) {
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [errorCategoriaRapida, setErrorCategoriaRapida] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState('')

  useEffect(() => {
    if (!producto.imagenArchivo) {
      setVistaPrevia('')
      return
    }
    const objectUrl = URL.createObjectURL(producto.imagenArchivo)
    setVistaPrevia(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [producto.imagenArchivo])

  const categoriasActivas = categorias.filter((cat) => cat?.activo !== false)

  const errorCampo = (campo) => errores[`lote-${indice}-prod-${campo}`]

  async function manejarCrearCategoriaRapida() {
    const nombre = (producto.categoriaNuevaNombre || '').trim()
    if (!nombre) {
      setErrorCategoriaRapida('Ingresá el nombre de la categoría')
      return
    }
    setErrorCategoriaRapida(null)
    setCreandoCategoria(true)
    try {
      const nueva = await crearCategoria(nombre)
      onCategoriaCreada(nueva)
      onCambiarCampo(indice, 'categoriaId', String(nueva.id))
      onCambiarCampo(indice, 'categoriaNuevaNombre', '')
    } catch (err) {
      setErrorCategoriaRapida(err.message)
    } finally {
      setCreandoCategoria(false)
    }
  }

  function manejarCambioPrecioVenta(valor) {
    const limpio = sanitizarDecimalPositivo(valor)
    onCambiarCampo(indice, 'precioVenta', limpio)

    const precioVentaNum = Number(limpio)
    const porcentajeNum = Number(producto.porcentajeDescuento)
    if (
      producto.enPromocion &&
      producto.porcentajeDescuento !== '' &&
      Number.isFinite(precioVentaNum) &&
      precioVentaNum > 0 &&
      Number.isFinite(porcentajeNum)
    ) {
      const calculado = redondear2(precioVentaNum - (precioVentaNum * (porcentajeNum / 100)))
      onCambiarCampo(indice, 'precioPromo', calculado >= 0 ? String(calculado) : '')
    }
  }

  function manejarCambioPorcentaje(valor) {
    const limpio = sanitizarDecimalPositivo(valor)
    onCambiarCampo(indice, 'porcentajeDescuento', limpio)

    if (limpio === '') {
      onCambiarCampo(indice, 'precioPromo', '')
      return
    }

    const porcentajeNum = Number(limpio)
    const precioVentaNum = Number(producto.precioVenta)
    if (Number.isFinite(precioVentaNum) && precioVentaNum > 0 && Number.isFinite(porcentajeNum)) {
      const calculado = redondear2(precioVentaNum - (precioVentaNum * (porcentajeNum / 100)))
      onCambiarCampo(indice, 'precioPromo', calculado >= 0 ? String(calculado) : '')
    }
  }

  function manejarCambioPrecioPromo(valor) {
    const limpio = sanitizarDecimalPositivo(valor)
    onCambiarCampo(indice, 'precioPromo', limpio)

    if (limpio === '') {
      onCambiarCampo(indice, 'porcentajeDescuento', '')
      return
    }

    const precioPromoNum = Number(limpio)
    const precioVentaNum = Number(producto.precioVenta)
    if (Number.isFinite(precioVentaNum) && precioVentaNum > 0 && Number.isFinite(precioPromoNum)) {
      const calculado = redondear2(100 - ((precioPromoNum * 100) / precioVentaNum))
      onCambiarCampo(indice, 'porcentajeDescuento', calculado >= 0 ? String(calculado) : '')
    }
  }

  return (
    <div
      className="orden-producto-inline"
      role="group"
      aria-label={`Nuevo producto para lote ${indice + 1}`}
    >
      <div className="orden-producto-inline-cabecera">
        <h4 className="orden-producto-inline-titulo">Nuevo producto</h4>
      </div>

      <div className="orden-producto-inline-grilla">
        <div className="orden-campo">
          <label htmlFor={`orden-lote-${indice}-prod-nombre`}>Nombre *</label>
          <input
            id={`orden-lote-${indice}-prod-nombre`}
            type="text"
            placeholder="Ej. Aceite de girasol 900ml"
            value={producto.nombre}
            onChange={(e) => onCambiarCampo(indice, 'nombre', e.target.value)}
            aria-invalid={Boolean(errorCampo('nombre'))}
          />
          {errorCampo('nombre') && (
            <p className="orden-campo-error">{errorCampo('nombre')}</p>
          )}
        </div>

        <div className="orden-campo">
          <label htmlFor={`orden-lote-${indice}-prod-marca`}>Marca *</label>
          <input
            id={`orden-lote-${indice}-prod-marca`}
            type="text"
            placeholder="Ej. Cocinero"
            value={producto.marca}
            onChange={(e) => onCambiarCampo(indice, 'marca', e.target.value)}
            aria-invalid={Boolean(errorCampo('marca'))}
          />
          {errorCampo('marca') && (
            <p className="orden-campo-error">{errorCampo('marca')}</p>
          )}
        </div>

        <div className="orden-campo">
          <label htmlFor={`orden-lote-${indice}-prod-categoria`}>Categoría *</label>
          <select
            id={`orden-lote-${indice}-prod-categoria`}
            value={producto.categoriaId}
            onChange={(e) => {
              setErrorCategoriaRapida(null)
              onCambiarCampo(indice, 'categoriaId', e.target.value)
            }}
            aria-invalid={Boolean(errorCampo('categoriaId'))}
          >
            <option value="">Elegí una categoría</option>
            <option value="__nueva__">+ Nueva categoría</option>
            {categoriasActivas.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {errorCampo('categoriaId') && (
            <p className="orden-campo-error">{errorCampo('categoriaId')}</p>
          )}

          {producto.categoriaId === '__nueva__' && (
            <div className="orden-inline-creacion-bloque">
              <div className="orden-inline-creacion">
                <input
                  id={`orden-lote-${indice}-prod-categoria-nueva`}
                  type="text"
                  placeholder="Nombre de la nueva categoría"
                  aria-label="Nombre de la nueva categoría"
                  value={producto.categoriaNuevaNombre}
                  onChange={(e) => {
                    setErrorCategoriaRapida(null)
                    onCambiarCampo(indice, 'categoriaNuevaNombre', e.target.value)
                  }}
                  disabled={creandoCategoria}
                  aria-invalid={Boolean(errorCategoriaRapida || errorCampo('categoriaNuevaNombre'))}
                />
                <button
                  type="button"
                  className="orden-btn orden-btn-chico orden-btn-primario"
                  onClick={manejarCrearCategoriaRapida}
                  disabled={creandoCategoria}
                >
                  {creandoCategoria ? 'Creando...' : 'Crear'}
                </button>
              </div>
              {(errorCategoriaRapida || errorCampo('categoriaNuevaNombre')) && (
                <p className="orden-campo-error">
                  {errorCategoriaRapida || errorCampo('categoriaNuevaNombre')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="orden-campo">
          <label htmlFor={`orden-lote-${indice}-prod-costo`}>Precio al costo ($) *</label>
          <input
            id={`orden-lote-${indice}-prod-costo`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={producto.precioCosto}
            onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
            onChange={(e) => onCambiarCampo(indice, 'precioCosto', sanitizarDecimalPositivo(e.target.value))}
            aria-invalid={Boolean(errorCampo('precioCosto'))}
          />
          {errorCampo('precioCosto') && (
            <p className="orden-campo-error">{errorCampo('precioCosto')}</p>
          )}
        </div>

        <div className="orden-campo">
          <label htmlFor={`orden-lote-${indice}-prod-venta`}>Precio de venta ($) *</label>
          <input
            id={`orden-lote-${indice}-prod-venta`}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={producto.precioVenta}
            onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
            onChange={(e) => manejarCambioPrecioVenta(e.target.value)}
            aria-invalid={Boolean(errorCampo('precioVenta'))}
          />
          {errorCampo('precioVenta') && (
            <p className="orden-campo-error">{errorCampo('precioVenta')}</p>
          )}
        </div>

        <div className="orden-campo orden-producto-inline-full">
          <div className="orden-producto-inline-switch">
            <label className="prod-switch-label" htmlFor={`orden-lote-${indice}-prod-en-promo`}>
              <span className="prod-switch-control">
                <input
                  id={`orden-lote-${indice}-prod-en-promo`}
                  type="checkbox"
                  role="switch"
                  className="prod-switch-input"
                  checked={Boolean(producto.enPromocion)}
                  onChange={(e) => {
                    const activo = e.target.checked
                    onCambiarCampo(indice, 'enPromocion', activo)
                    if (!activo) {
                      onCambiarCampo(indice, 'porcentajeDescuento', '')
                      onCambiarCampo(indice, 'precioPromo', '')
                    }
                  }}
                />
                <span className="prod-switch-slider" aria-hidden="true" />
              </span>
              <span>¿En promoción?</span>
            </label>
          </div>
        </div>

        {producto.enPromocion && (
          <>
            <div className="orden-campo">
              <label htmlFor={`orden-lote-${indice}-prod-porcentaje-promo`}>
                Porcentaje de descuento (%)
              </label>
              <input
                id={`orden-lote-${indice}-prod-porcentaje-promo`}
                type="number"
                min="0.01"
                max="99.99"
                step="0.01"
                inputMode="decimal"
                placeholder="Ej. 15"
                value={producto.porcentajeDescuento ?? ''}
                onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                onChange={(e) => manejarCambioPorcentaje(e.target.value)}
                aria-invalid={Boolean(errorCampo('porcentajeDescuento'))}
              />
              {errorCampo('porcentajeDescuento') && (
                <p className="orden-campo-error">{errorCampo('porcentajeDescuento')}</p>
              )}
            </div>

            <div className="orden-campo">
              <label htmlFor={`orden-lote-${indice}-prod-precio-promo`}>
                Precio en promoción ($)
              </label>
              <input
                id={`orden-lote-${indice}-prod-precio-promo`}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                placeholder="Precio con descuento"
                value={producto.precioPromo ?? ''}
                onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                onChange={(e) => manejarCambioPrecioPromo(e.target.value)}
                aria-invalid={Boolean(errorCampo('precioPromo'))}
              />
              {errorCampo('precioPromo') && (
                <p className="orden-campo-error">{errorCampo('precioPromo')}</p>
              )}
            </div>
          </>
        )}

        <div className="orden-campo orden-producto-inline-full">
          <div className="orden-producto-inline-switch">
            <label className="prod-switch-label" htmlFor={`orden-lote-${indice}-prod-destacado`}>
              <span className="prod-switch-control">
                <input
                  id={`orden-lote-${indice}-prod-destacado`}
                  type="checkbox"
                  role="switch"
                  className="prod-switch-input"
                  checked={Boolean(producto.destacado)}
                  onChange={(e) => onCambiarCampo(indice, 'destacado', e.target.checked)}
                />
                <span className="prod-switch-slider" aria-hidden="true" />
              </span>
              <span>Destacado en el home</span>
            </label>
          </div>
        </div>

        <div className="orden-campo orden-producto-inline-full">
          <label htmlFor={`orden-lote-${indice}-prod-imagen`}>Imagen del producto (opcional)</label>
          <input
            id={`orden-lote-${indice}-prod-imagen`}
            type="file"
            accept="image/*"
            className="orden-visually-hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0] || null
              onCambiarCampo(indice, 'imagenArchivo', archivo)
            }}
            aria-invalid={Boolean(errorCampo('imagenArchivo'))}
          />
          <label
            htmlFor={`orden-lote-${indice}-prod-imagen`}
            className="prod-dropzone"
          >
            <div className="prod-dropzone-info">
              <span className="prod-dropzone-icono" aria-hidden="true">
                <LuImagePlus size={18} />
              </span>
              <div className="prod-dropzone-textos">
                <span className="prod-dropzone-titulo">Haz clic para subir una imagen</span>
                {producto.imagenArchivo && (
                  <span className="prod-dropzone-archivo">
                    {producto.imagenArchivo.name}
                  </span>
                )}
              </div>
            </div>
            {vistaPrevia && (
              <img
                src={vistaPrevia}
                alt="Vista previa del nuevo producto"
                className="prod-dropzone-preview"
              />
            )}
          </label>
          {errorCampo('imagenArchivo') && (
            <p className="orden-campo-error">{errorCampo('imagenArchivo')}</p>
          )}
        </div>

        <div className="orden-campo orden-producto-inline-full">
          <label htmlFor={`orden-lote-${indice}-prod-descripcion`}>Descripción *</label>
          <textarea
            id={`orden-lote-${indice}-prod-descripcion`}
            rows={2}
            placeholder="Descripción del producto"
            value={producto.descripcion}
            onChange={(e) => onCambiarCampo(indice, 'descripcion', e.target.value)}
            aria-invalid={Boolean(errorCampo('descripcion'))}
          />
          {errorCampo('descripcion') && (
            <p className="orden-campo-error">{errorCampo('descripcion')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default NuevoProductoInlineForm
