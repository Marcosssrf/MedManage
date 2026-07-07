import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {Toaster} from 'sonner'
import {AuthProvider} from './context/AuthContext'
import {initializeSecurityProtections} from './utils/securityUtils.ts'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

// initializeSecurityProtections()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/medmanage">
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)