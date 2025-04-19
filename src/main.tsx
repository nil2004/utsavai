import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/responsive.css'  // Import our responsive styles
import './styles/chat-mobile.css'  // Import our mobile chat styles
import { initializeAdminUser } from './lib/admin-setup'

// Initialize admin user
initializeAdminUser().catch(console.error);

// Create a script element to load our mobile detector
const mobileDetectorScript = document.createElement('script');
mobileDetectorScript.src = '/scripts/mobile-detector.js';
mobileDetectorScript.async = true;
document.head.appendChild(mobileDetectorScript);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
