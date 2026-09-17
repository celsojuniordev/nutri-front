import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/features/auth/LoginPage'
import ProfilePage from '@/features/auth/ProfilePage'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import RedirectIfAuthenticated from '@/features/auth/RedirectIfAuthenticated'
import RegisterPage from '@/features/auth/RegisterPage'

function App() {
  return (
    <div className="min-h-screen bg-neutral-0 text-neutral-900">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/cadastro"
          element={
            <RedirectIfAuthenticated>
              <RegisterPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
