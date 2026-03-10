import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import './styles/index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"              element={<EventList />} />
        <Route path="/event/:code"   element={<EventDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
