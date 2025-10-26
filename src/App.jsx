import { Routes, Route } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import LandingPage from './components/LandingPage'

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </div>
  )
}

export default App


