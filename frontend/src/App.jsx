import AppRoutes from './routes/AppRoutes'
import AuthProvider from './features/auth/AuthProvider'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
