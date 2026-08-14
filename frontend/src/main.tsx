import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/pacifico/400.css'
import '@fontsource/playwrite-us-modern/100.css'
import '@fontsource/playwrite-us-modern/200.css'
import '@fontsource/playwrite-us-modern/300.css'
import '@fontsource/playwrite-us-modern/400.css'
import '@fontsource/forum/400.css'
import '@fontsource/poppins/200.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/quicksand/400.css'
import '@fontsource/quicksand/500.css'
import '@fontsource/quicksand/600.css'
import '@fontsource/quicksand/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
