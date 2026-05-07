import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Sidebar from './components/Sidebar'
import NetworkBackground from './components/NetworkBackground'
import MeetingReminderBanner from './components/MeetingReminderBanner'
import Dashboard from './pages/Dashboard'
import Meetings from './pages/Meetings'
import Contacts from './pages/Contacts'
import Groups from './pages/Groups'
import Notes from './pages/Notes'
import JoinRoom from './pages/JoinRoom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

// Apply saved theme on load — default to light
const saved = localStorage.getItem('huddle_theme') || 'light'
document.documentElement.setAttribute('data-theme', saved)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NetworkBackground />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:inviteCode" element={<JoinRoom />} />
          <Route path="/*" element={
            <PrivateRoute>
              <MeetingReminderBanner />
              <div className="app">
                <Sidebar />
                <Routes>
                  <Route path="/"         element={<Dashboard />} />
                  <Route path="/meetings" element={<Meetings />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/rooms"    element={<Groups />} />
                  <Route path="/groups"   element={<Groups />} />
                  <Route path="/notes"    element={<Notes />} />
                  <Route path="/profile"  element={<Profile />} />
                </Routes>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
