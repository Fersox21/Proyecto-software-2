import { useState } from 'react'
import {
  crearCategoria,
  crearTipoPromocion,
} from '../../services/ordenesCompraService'

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
            placeholder="0.00"
            value={producto.precioCosto}
            onChange={(e) => onCambiarCampo(indice, 'precioCosto', e.target.value)}
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
            placeholder="0.00"
            value={producto.precioVenta}
            onChange={(e) => onCambiarCampo(indice, 'precioVenta', e.target.value)}
            aria-invalid={Boolean(errorCampo('precioVenta'))}
          />
          {errorCampo('precioVenta') && (
            <p className="orden-campo-error">{errorCampo('precioVenta')}</p>
          )}
        </div>

        <div className="orden-campo">
          <label htmlFor={`orden-lote-${indice}-prod-peso`}>Peso / Tamaño</label>
          <input
            id={`orden-lote-${indice}-prod-peso`}
            type="number"
            min="0.01"
            step="any"
            placeholder="Ej. 500"
            value={producto.peso}
            onChange={(e) => onCambiarCampo(indice, 'peso', e.target.value)}
            aria-invalid={Boolean(errorCampo('peso'))}
          />
          {errorCampo('peso') && (
            <p className="orden-campo-error">{errorCampo('peso')}</p>
          )}
        </div>

        <div className="orden-campo orden-producto-inline-checkbox">
          <label className="orden-checkbox-label" htmlFor={`orden-lote-${indice}-prod-destacado`}>
            <input
              id={`orden-lote-${indice}-prod-destacado`}
              type="checkbox"
              checked={Boolean(producto.destacado)}
              onChange={(e) => onCambiarCampo(indice, 'destacado', e.target.checked)}
            />
            Destacado en el home
          </label>
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
