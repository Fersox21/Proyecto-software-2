import { useFetch } from '../../../shared/hooks/useFetch';
import { usePreferencias } from '../../../shared/hooks/usePreferencias';
import { obtenerUsuario } from '../../auth/services/authService';
import Spinner from '../../../shared/components/Spinner';
import MensajeVacio from '../../../shared/components/MensajeVacio';
import '../../../styles/panelAdmin/configuracion.css';

const OPCIONES_TEMA = [
    { valor: 'claro', texto: 'Claro', icono: '☀️' },
    { valor: 'oscuro', texto: 'Oscuro', icono: '🌙' },
    { valor: 'sistema', texto: 'Sistema', icono: '💻' },
];

const OPCIONES_FUENTE = [
    { valor: 'chica', texto: 'Chica', muestra: 'Aa' },
    { valor: 'normal', texto: 'Normal', muestra: 'Aa' },
    { valor: 'grande', texto: 'Grande', muestra: 'Aa' },
];

function ConfiguracionPage() {

    const { datos: usuario, cargando, error } = useFetch(obtenerUsuario);
    const { tema, fuente, cambiarTema, cambiarFuente, restablecer } = usePreferencias();

    return (<>
        <section className="main-admin" id="main-configuracion">
            <header className="header-admin">
                <h1 className="h1-admin">Configuración</h1>
            </header>

            <div className="config-grilla">

                <section className="config-tarjeta" aria-labelledby="config-titulo-cuenta">
                    <h2 className="config-tarjeta-titulo" id="config-titulo-cuenta">Cuenta</h2>
                    <p className="config-tarjeta-desc">Datos de la sesión iniciada en este dispositivo.</p>

                    {cargando && <Spinner texto="Cargando datos de la cuenta..." />}
                    {error && <MensajeVacio titulo="No pudimos cargar tu cuenta" texto={error.message} />}
                    {usuario && !cargando && !error && (
                        <dl className="config-datos">
                            <div className="config-dato">
                                <dt>Correo electrónico</dt>
                                <dd>{usuario.correo}</dd>
                            </div>
                            {usuario.rol && (
                                <div className="config-dato">
                                    <dt>Rol</dt>
                                    <dd>{usuario.rol === 'admin' ? 'Administrador' : usuario.rol}</dd>
                                </div>
                            )}
                        </dl>
                    )}
                </section>

                <section className="config-tarjeta" aria-labelledby="config-titulo-tema">
                    <h2 className="config-tarjeta-titulo" id="config-titulo-tema">Apariencia</h2>
                    <p className="config-tarjeta-desc">Elige el modo visual del panel de administración.</p>

                    <div className="config-opciones" role="radiogroup" aria-label="Modo de tema">
                        {OPCIONES_TEMA.map((opcion) => (
                            <button
                                key={opcion.valor}
                                type="button"
                                role="radio"
                                aria-checked={tema === opcion.valor}
                                className={`config-opcion ${tema === opcion.valor ? 'activa' : ''}`}
                                onClick={() => cambiarTema(opcion.valor)}
                            >
                                <span className="config-opcion-icono" aria-hidden="true">{opcion.icono}</span>
                                <span>{opcion.texto}</span>
                            </button>
                        ))}
                    </div>
                    <p className="config-nota">
                        {tema === 'sistema'
                            ? 'Se adapta automáticamente a la configuración de tu sistema.'
                            : `Tema "${OPCIONES_TEMA.find((o) => o.valor === tema)?.texto}" activo. Solo aplica al panel de administración.`}
                    </p>
                </section>

                <section className="config-tarjeta" aria-labelledby="config-titulo-fuente">
                    <h2 className="config-tarjeta-titulo" id="config-titulo-fuente">Tamaño de fuente</h2>
                    <p className="config-tarjeta-desc">Ajusta el tamaño del texto en todo el panel.</p>

                    <div className="config-opciones" role="radiogroup" aria-label="Tamaño de fuente">
                        {OPCIONES_FUENTE.map((opcion) => (
                            <button
                                key={opcion.valor}
                                type="button"
                                role="radio"
                                aria-checked={fuente === opcion.valor}
                                className={`config-opcion config-opcion-fuente config-fuente-${opcion.valor} ${fuente === opcion.valor ? 'activa' : ''}`}
                                onClick={() => cambiarFuente(opcion.valor)}
                            >
                                <span className="config-opcion-icono config-muestra-fuente" aria-hidden="true">{opcion.muestra}</span>
                                <span>{opcion.texto}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="config-tarjeta" aria-labelledby="config-titulo-preferencias">
                    <h2 className="config-tarjeta-titulo" id="config-titulo-preferencias">Preferencias</h2>
                    <p className="config-tarjeta-desc">
                        Tus preferencias se guardan en este navegador. Puedes volver a los valores por defecto en cualquier momento.
                    </p>
                    <button type="button" className="config-btn-restablecer" onClick={restablecer}>
                        Restablecer preferencias
                    </button>
                </section>

            </div>
        </section>
    </>)
}

export default ConfiguracionPage;
