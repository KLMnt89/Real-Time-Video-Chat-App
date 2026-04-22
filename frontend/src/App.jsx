import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Meetings from './pages/Meetings'
import Contacts from './pages/Contacts'
import Rooms from './pages/Rooms'
import Notes from './pages/Notes'
import JoinRoom from './pages/JoinRoom'

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/join/:inviteCode" element={<JoinRoom />} />
          <Route path="/*" element={
            <div className="app">
              <Sidebar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/notes" element={<Notes />} />
              </Routes>
            </div>
          } />
        </Routes>
      </BrowserRouter>
  )
}