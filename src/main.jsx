import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'

const menu_config = {
  metp_request: '/metp_request',
}

const uri_config = {
  '/metp_request': {
    component: 'metp_editor',
    data: {
      host: 'http://localhost:6813',
      default: { '_.u': '/core/version' },
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App menu_config={menu_config} uri_config={uri_config} />
    </BrowserRouter>
  </React.StrictMode>
)
