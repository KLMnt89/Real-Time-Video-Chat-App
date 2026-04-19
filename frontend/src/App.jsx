import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Meetings from './pages/Meetings'
import Contacts from './pages/Contacts'
import Rooms from './pages/Rooms'
import Notes from './pages/Notes'

export default function App() {
  return (
      <BrowserRouter>
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
      </BrowserRouter>
  )
}