import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@fontsource/manrope/400.css"
import "@fontsource/manrope/500.css"
import "@fontsource/manrope/600.css"
import "@fontsource/manrope/700.css"
import "@fontsource-variable/fraunces/opsz.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/variables.css'
import './index.css'
import './styles/estilos.css'
import App from './App.jsx'
import { aplicarPreferencias } from './shared/utils/preferencias'

// Aplica tema y tamaño de fuente guardados antes del primer render (evita parpadeo)
aplicarPreferencias()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
