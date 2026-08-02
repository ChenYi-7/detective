import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAppState } from './utils/storage'
import SplashPage from './pages/SplashPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CameraPage from './pages/CameraPage'
import CasePage from './pages/CasePage'
import CommissionPage from './pages/CommissionPage'
import TaskPage from './pages/TaskPage'
import ArchivePage from './pages/ArchivePage'
import UserProfilePage from './pages/UserProfilePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const [appState, setAppState] = useState(getAppState())

  useEffect(() => {
    // 同步应用状态
  }, [])

  const ProtectedRoute = ({ children }) => {
    if (!appState.isLoggedIn && !appState.isGuest) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SplashPage appState={appState} setAppState={setAppState} />} />
        <Route path="/login" element={<LoginPage appState={appState} setAppState={setAppState} />} />
        <Route path="/home" element={<ProtectedRoute><HomePage appState={appState} /></ProtectedRoute>} />
        <Route path="/camera" element={<ProtectedRoute><CameraPage /></ProtectedRoute>} />
        <Route path="/case/:caseId" element={<ProtectedRoute><CasePage /></ProtectedRoute>} />
        <Route path="/commission" element={<ProtectedRoute><CommissionPage /></ProtectedRoute>} />
        <Route path="/commission/:caseId" element={<ProtectedRoute><CommissionPage /></ProtectedRoute>} />
        <Route path="/task/:caseId/:clueIndex" element={<ProtectedRoute><TaskPage /></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage appState={appState} setAppState={setAppState} /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage appState={appState} setAppState={setAppState} /></ProtectedRoute>} />
      </Routes>
    </HashRouter>
  )
}

export default App
