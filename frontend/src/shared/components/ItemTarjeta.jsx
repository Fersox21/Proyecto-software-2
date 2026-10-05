const COLORES = {
    oscuro: "#2B211E",
    fondoSeleccionado: "#E9E6E1",
    fondoIconoInactivo: "#EFECE8",
};

function ItemTarjeta({ titulo, icono, texto, descripcion, seleccionado, onSelect }) {
    const claseTarjeta = seleccionado ? "border-dark" : "bg-white border-secondary-subtle";

    return (
        <div
            role="radio"
            aria-checked={seleccionado}
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.()}
            className={`d-flex text-start align-items-center p-3 mb-3 rounded-4 border ${claseTarjeta}`}
            style={{
                cursor: "pointer",
                borderWidth: "1.5px",
                backgroundColor: seleccionado ? COLORES.fondoSeleccionado : undefined,
            }}
        >
            {/* Recuadro del ícono */}
            <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{
                    width: "64px",
                    height: "64px",
                    minWidth: "64px",
                    backgroundColor: seleccionado ? COLORES.oscuro : COLORES.fondoIconoInactivo,
                }}
            >
                {icono && (
                    <img
                        src={icono}
                        alt={titulo}
                        className="img-fluid w-50"
                        style={{ filter: seleccionado ? "brightness(0) invert(1)" : "brightness(0)" }}
                    />
                )}
            </div>

            {/* Textos */}
            <div className="flex-grow-1 ms-3">
                <h6 className="fw-semibold fs-5 mb-1">{titulo}</h6>
                {texto && <p className="text-body-secondary mb-1">{texto}</p>}
                {descripcion && <p className="mb-0 fw-medium text-dark">{descripcion}</p>}
            </div>

            {/* Radio custom */}
            <div className="ms-3">
                <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-white"
                    style={{
                        width: "24px",
                        height: "24px",
                        border: `1.5px solid ${seleccionado ? COLORES.oscuro : "#CFCBC6"}`,
                    }}
                >
                    {seleccionado && (
                        <div
                            className="rounded-circle"
                            style={{ width: "12px", height: "12px", backgroundColor: COLORES.oscuro }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemTarjeta;