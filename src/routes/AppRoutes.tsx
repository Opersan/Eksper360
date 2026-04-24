import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../layouts/AppLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ExpertiseList from '../pages/ExpertiseList'
import ExpertiseCreate from '../pages/ExpertiseCreate'
import ExpertiseEdit from '../pages/ExpertiseEdit'
import ExpertiseDetail from '../pages/ExpertiseDetail'
import ExpertiseReport from '../pages/ExpertiseReport'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expertises" element={<ExpertiseList />} />
          <Route path="/expertises/new" element={<ExpertiseCreate />} />
          <Route path="/expertises/:id/edit" element={<ExpertiseEdit />} />
          <Route path="/expertises/:id" element={<ExpertiseDetail />} />
        </Route>
        <Route path="/expertises/:id/report" element={<ExpertiseReport />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
