import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@supersedure-studio/ui-kit";
import "@supersedure-studio/ui-kit/style.css";
import './index.css'
import './custom-theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
