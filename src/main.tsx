import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // This line is crucial for loading styles
import ApiProvider from './context/ApiProvider'
import { ToastProvider } from './hooks/useToast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { DashboardProvider } from './context/DashboardContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApiProvider>
      <AuthProvider>
        <ThemeProvider>
          <DashboardProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </DashboardProvider>
        </ThemeProvider>
      </AuthProvider>
    </ApiProvider>
  </React.StrictMode>,
)