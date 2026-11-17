import { useState } from 'react'

const UBICACION_POR_DEFECTO = 'Av. Juan Gilberto Funes 460, D5702 San Luis'

function EscogerUbicacion({ direccion, onDireccionChange }) {
    const [busquedaMapa, setBusquedaMapa] = useState(UBICACION_POR_DEFECTO);

    function actualizarMapa() {
        if (direccion.trim()) {
            setBusquedaMapa(direccion.trim());
        }
    }

    const urlMapa = `https://maps.google.com/maps?q=${encodeURIComponent(busquedaMapa)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="card p-3 rounded-4 border shadow-sm">
            <h5 className="card-title mb-3">Punto de entrega</h5>

            <div className="mb-3">
                <label htmlFor="direccionInput" className="form-label small text-body-secondary">
                    Ingresá tu dirección:
                </label>
                <div className="input-group">
                    <input
                        id="direccionInput"
                        type="text"
                        className="form-control"
                        placeholder="Ej: Rivadavia 500, San Luis"
                        value={direccion}
                        onChange={(e) => onDireccionChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                actualizarMapa();
                            }
                        }}
                    />

                    <button
                        type="button"
                        className="btn btn-dark d-flex align-items-center justify-content-center user-select-none"
                        onClick={actualizarMapa}
                    >
                        Ver en mapa
                    </button>
                </div>
            </div>

            <div className="ratio ratio-16x9 rounded-3 overflow-hidden border">
                <iframe
                    title="Mapa de ubicación"
                    src={urlMapa}
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

export default EscogerUbicacion;
