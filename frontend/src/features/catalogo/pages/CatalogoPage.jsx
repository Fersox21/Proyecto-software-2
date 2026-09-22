import '../../../styles/catalogo.css'

function CatalogoPage(){
    return (<>
        <h2 className="titulo-h2">Catalogo de Productos</h2>
            <div className="barra-superior">
                <div className="div-buscador">
                    <input type="search" id="buscador" placeholder="Buscar producto"/>
                    <button type="button" className="boton-buscador">
                        <img src="Resources\Img\Items\search_24dp_7A7A7A_FILL0_wght400_GRAD0_opsz24.svg"
                        className="lupa" alt="buscador"/>
                    </button>
                </div>

                <button type="button" id="btn-filtros" className="btn-filtros"
                        aria-expanded="false" aria-controls="panel-filtros">
                    Filtrar
                </button>

            </div>
            <aside id="panel-filtros" className="panel-filtros" aria-hidden="true">
                <div className="panel-filtros-head">
                    <h3>Filtros</h3>
                    <button type="button" id="btn-cerrar-filtros" className="btn-cerrar-filtros" aria-label="Cerrar filtros">✕</button>
                </div>

                <form id="form-filtros" className="form-filtros">
                    <fieldset>
                    <legend>Categoría</legend>
                    <label id="harinac"><input type="checkbox" name="categoria" value="harinas"/> Harinas</label>
                    <label><input type="checkbox" name="categoria" value="pastas"/> Pastas</label>
                    <label><input type="checkbox" name="categoria" value="lacteos"/> Lácteos</label>
                    </fieldset>

                    <fieldset>
                    <legend>Precio máximo</legend>
                    <input type="range" name="precioMax" id="precio-max" min="0" max="5000" step="100" value="5000"/>
                    <output id="precio-max-valor">$5.000</output>
                    </fieldset>

                    <div className="form-filtros-acciones">
                    <button type="reset" className="btn-limpiar">Limpiar</button>
                    <button type="submit" className="btn-aplicar">Aplicar</button>
                    </div>
                </form>
            </aside>
    </>);
}

export default CatalogoPage;