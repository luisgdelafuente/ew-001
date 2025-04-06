import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom' 
import App from './App.jsx'
import AdminApp from './admin/App.jsx'
import Success from './pages/Success'
import Cancel from './pages/Cancel'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* Public routes */}
        <Route path="/" element={<App />} />
        <Route path="/:clientNumber" element={<App />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)