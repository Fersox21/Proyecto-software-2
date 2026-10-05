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

function CatalogoPage() {
  const { agregarProducto } = useOutletContext()
  const { datos: productos, cargando, error } = useFetch(obtenerProductos)
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
      <header className="mb-4">
        <h1 className="h2 mb-1 titulo-tag">Catálogo</h1>
        <p className="text-body-secondary mb-0">Filtrá por categoría o nombre.</p>
      </header>

      <div className="row g-4">
        <aside className="col-lg-3 filtros">
          <label htmlFor="busqueda" className="rotulo-filtro">
            Buscar
          </label>
          {/* Input controlado: su valor sale del estado y cada tecla lo actualiza */}
          <input
            id="busqueda"
            type="search"
            className="form-control campo-busqueda-tag mb-4"
            placeholder="Ej: harina"
            value={filtros.busqueda}
            onChange={(e) => filtros.setBusqueda(e.target.value)}
          />

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
    </>
  )
}

export default CatalogoPage
