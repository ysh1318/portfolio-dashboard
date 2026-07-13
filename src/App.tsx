import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import Login from './pages/Login'
import Leads from './pages/Leads'
import ContentEditor from './pages/ContentEditor'
import Availability from './pages/Availability'
import Projects from './pages/Projects'
import TestimonialsPage from './pages/Testimonials'

// Spec §5: private, single-user tool. /login is public (redirects away
// if already authenticated); every other route sits behind
// DashboardLayout, which route-guards via onAuthStateChanged.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Leads />} />
        <Route path="/content" element={<ContentEditor />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
      </Route>
    </Routes>
  )
}
