import { useOutletContext, useSearchParams } from 'react-router'
import { useEffect } from 'react'
import GrillaProductos from '../components/GrillaProductos'
import FiltroCategorias from '../components/FiltroCategorias'
import { useFiltros } from '../hooks/useFiltros'
import { obtenerProductos } from '../services/catalogoService'
import { useFetch } from '../../../shared/hooks/useFetch'
import Boton from '../../../shared/components/Boton'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import '../../../styles/catalogo-filtros.css'
import '../../../styles/catalogo.css'

function CatalogoPage() {
  const { agregarProducto } = useOutletContext()
  const { datos: productos, cargando, error } = useFetch(obtenerProductos)
  console.log(productos)
  const filtros = useFiltros(productos)

  const [searchParams] = useSearchParams()
  const categoriaUrl = searchParams.get('categoria')

useEffect(function() {
  if (categoriaUrl !== null) {
    filtros.setCategoria(categoriaUrl)
  }
}, [categoriaUrl])

  if (cargando) return <Spinner texto="Cargando catálogo..." />
  if (error) return <MensajeVacio titulo="No pudimos cargar el catálogo" texto={error.message} />

  return (
    <>
    <div className="container py-4">
      <header className="mb-4">
        <h1 className="h2 mb-1 titulo-tag">Catálogo</h1>
        <p className="text-body-secondary mb-0">Filtrá por categoría o nombre.</p>
      </header>

      <div className="row g-4">
        <aside className="col-lg-3 filtros">
          <div className="buscador-contenedor mb-4">
            <label htmlFor="busqueda" className="rotulo-filtro">
              Buscar
            </label>
            <div className="campo-busqueda-wrapper">
              <span className="icono-lupa">🔍</span>
              <input
                id="busqueda"
                type="search"
                className="campo-busqueda-tag"
                placeholder="Ej: harina, fideos..."
                value={filtros.busqueda}
                onChange={(e) => filtros.setBusqueda(e.target.value)}
                autoComplete="off"
              />
              {filtros.busqueda && (
                <button
                  type="button"
                  className="btn-limpiar-busqueda"
                  onClick={() => filtros.setBusqueda('')}
                  aria-label="Borrar búsqueda"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <FiltroCategorias
            categorias={filtros.categorias}
            seleccionada={filtros.categoria}
            onSeleccionar={filtros.setCategoria}
          />
          
          {filtros.hayFiltrosActivos && (
            <Boton
              variante="outline-secondary"
              tamanio="sm"
              className="btn-limpiar-tag"
              onClick={filtros.limpiarFiltros}
            >
              Limpiar filtros
            </Boton>
          )}
        </aside>

        <section className="col-lg-9">
          <p className="small text-body-secondary">
            Mostrando {filtros.productosFiltrados.length} de {productos.length} productos
          </p>

          {filtros.productosFiltrados.length > 0 ? (
            <GrillaProductos productos={filtros.productosFiltrados} onAgregar={agregarProducto} />
          ) : (
            <MensajeVacio titulo="No hay productos con esos filtros" texto="Probá con otra categoría.">
              <Boton onClick={filtros.limpiarFiltros}>Ver todo</Boton>
            </MensajeVacio>
          )}
        </section>
      </div>
    </div>
    </>
  )
}

export default CatalogoPage
