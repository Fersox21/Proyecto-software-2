import { useEffect, useState } from 'react'
import { LuImagePlus } from 'react-icons/lu'
import {
  crearCategoria,
  crearTipoPromocion,
} from '../../services/ordenesCompraService'
import {
  bloquearTeclasNoNumericas,
  sanitizarDecimalPositivo,
} from '../../../../shared/utils/validaciones'

function NuevoProductoInlineForm({
  indice,
  producto,
  categorias,
  tiposPromocion,
  errores,
  onCambiarCampo,
  onCategoriaCreada,
  onTipoPromocionCreado,
}) {
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [errorCategoriaRapida, setErrorCategoriaRapida] = useState(null)

  const [creandoPromo, setCreandoPromo] = useState(false)
  const [errorPromoRapida, setErrorPromoRapida] = useState(null)
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
  const tiposPromocionActivos = tiposPromocion.filter((tp) => tp?.activo !== false)

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

  async function manejarCrearPromoRapida() {
    const nombre = (producto.tipoPromocionNuevaNombre || '').trim()
    if (!nombre) {
      setErrorPromoRapida('Ingresá el nombre del tipo de promoción')
      return
    }
    setErrorPromoRapida(null)
    setCreandoPromo(true)
    try {
      const nuevo = await crearTipoPromocion(nombre)
      onTipoPromocionCreado(nuevo)
      onCambiarCampo(indice, 'tipoPromocionId', String(nuevo.id))
      onCambiarCampo(indice, 'tipoPromocionNuevaNombre', '')
    } catch (err) {
      setErrorPromoRapida(err.message)
    } finally {
      setCreandoPromo(false)
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
          <label htmlFor={`orden-lote-${indice}-prod-promo`}>Tipo de promoción</label>
          <select
            id={`orden-lote-${indice}-prod-promo`}
            value={producto.tipoPromocionId}
            onChange={(e) => {
              setErrorPromoRapida(null)
              onCambiarCampo(indice, 'tipoPromocionId', e.target.value)
            }}
            aria-invalid={Boolean(errorCampo('tipoPromocionId'))}
          >
            <option value="">Ninguna</option>
            <option value="__nueva__">+ Nueva promoción</option>
            {tiposPromocionActivos.map((tp) => (
              <option key={tp.id} value={tp.id}>
                {tp.nombre}
              </option>
            ))}
          </select>

          {producto.tipoPromocionId === '__nueva__' && (
            <div className="orden-inline-creacion-bloque">
              <div className="orden-inline-creacion">
                <input
                  id={`orden-lote-${indice}-prod-promo-nueva`}
                  type="text"
                  placeholder="Nombre del tipo de promoción"
                  aria-label="Nombre del tipo de promoción"
                  value={producto.tipoPromocionNuevaNombre}
                  onChange={(e) => {
                    setErrorPromoRapida(null)
                    onCambiarCampo(indice, 'tipoPromocionNuevaNombre', e.target.value)
                  }}
                  disabled={creandoPromo}
                  aria-invalid={Boolean(errorPromoRapida || errorCampo('tipoPromocionNuevaNombre'))}
                />
                <button
                  type="button"
                  className="orden-btn orden-btn-chico orden-btn-primario"
                  onClick={manejarCrearPromoRapida}
                  disabled={creandoPromo}
                >
                  {creandoPromo ? 'Creando...' : 'Crear'}
                </button>
              </div>
              {(errorPromoRapida || errorCampo('tipoPromocionNuevaNombre')) && (
                <p className="orden-campo-error">
                  {errorPromoRapida || errorCampo('tipoPromocionNuevaNombre')}
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
            onChange={(e) => onCambiarCampo(indice, 'precioVenta', sanitizarDecimalPositivo(e.target.value))}
            aria-invalid={Boolean(errorCampo('precioVenta'))}
          />
          {errorCampo('precioVenta') && (
            <p className="orden-campo-error">{errorCampo('precioVenta')}</p>
          )}
        </div>

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
