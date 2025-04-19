import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/responsive.css'  // Import our responsive styles
import { initializeAdminUser } from './lib/admin-setup'

// Initialize admin user
initializeAdminUser().catch(console.error);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
