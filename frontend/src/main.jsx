import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@fontsource/manrope/400.css"
import "@fontsource/manrope/500.css"
import "@fontsource/manrope/600.css"
import "@fontsource/manrope/700.css"
import "@fontsource/fraunces/400.css"
import "@fontsource/fraunces/500.css"
import "@fontsource/fraunces/600.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/variables.css'
import './index.css'
import './styles/estilos.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
