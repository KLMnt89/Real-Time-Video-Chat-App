import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Meetings from './pages/Meetings'
import Contacts from './pages/Contacts'
import Rooms from './pages/Rooms'
import Notes from './pages/Notes'
import JoinRoom from './pages/JoinRoom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:inviteCode" element={<JoinRoom />} />
          <Route path="/*" element={
            <PrivateRoute>
              <div className="app">
                <Sidebar />
                <Routes>
                  <Route path="/"         element={<Dashboard />} />
                  <Route path="/meetings" element={<Meetings />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/rooms"    element={<Rooms />} />
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
