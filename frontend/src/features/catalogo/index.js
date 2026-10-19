// Contrato público del módulo catálogo (lo que otros módulos pueden usar).
// GrillaProductos, los filtros y useFiltros quedan internos.
export { default as CatalogoPage } from './pages/CatalogoPage'
export { default as DetalleProductoPage } from './pages/DetalleProductoPage'
export { default as TarjetaProducto } from './components/TarjetaProducto'
export { obtenerDestacados } from './services/catalogoService'