import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import './styles/global.css'
import './styles/appearance.css'

import {
  aplicarApariencia
} from './utils/apariencia'


// APLICAR APARIENCIA AL INICIAR
aplicarApariencia()


ReactDOM.createRoot(
  document.getElementById('root')
).render(

  <React.StrictMode>

    <App />

  </React.StrictMode>

)