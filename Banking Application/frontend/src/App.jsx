import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ManualCheck from './pages/ManualCheck'
import TransactionHistory from './pages/TransactionHistory'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import UserProfile from './pages/UserProfile'
import Layout from './components/Layout'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/manual-check" element={<ManualCheck />} />
                      <Route path="/history" element={<TransactionHistory />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/profile" element={<UserProfile />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
