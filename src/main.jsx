import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AdminAuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AdminAuthProvider>
)
