import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import VolunteerRegister from './pages/register/VolunteerRegister.jsx'
import FreelancerRegister from './pages/register/FreelancerRegister.jsx'
import NGORegister from './pages/register/NGORegister.jsx'

// Tasks (public browsing)
import TasksPage from './pages/tasks/TasksPage.jsx'
import TaskDetailPage from './pages/tasks/TaskDetailPage.jsx'

// Dashboards
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard.jsx'
import FreelancerDashboard from './pages/dashboard/FreelancerDashboard.jsx'
import NGODashboard from './pages/dashboard/NGODashboard.jsx'
import PostTaskPage from './pages/dashboard/PostTaskPage.jsx'

// Profiles
import UserProfilePage from './pages/profile/UserProfilePage.jsx'
import FreelancerProfilePage from './pages/profile/FreelancerProfilePage.jsx'
import NGOProfilePage from './pages/profile/NGOProfilePage.jsx'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

// 404
import NotFoundPage from './pages/NotFoundPage.jsx'

// Auth guard
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/register/volunteer"  element={<VolunteerRegister />} />
        <Route path="/register/freelancer" element={<FreelancerRegister />} />
        <Route path="/register/ngo"        element={<NGORegister />} />

        {/* ── Task browsing (public, but apply requires auth) ─────────── */}
        <Route path="/tasks"      element={<TasksPage />} />
        <Route path="/tasks/:id"  element={<TaskDetailPage />} />

        {/* ── Volunteer ───────────────────────────────────────────────── */}
        <Route path="/dashboard/volunteer"
          element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/volunteer/applications"
          element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/volunteer/notifications"
          element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/volunteer/saved"
          element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />

        {/* ── Freelancer ──────────────────────────────────────────────── */}
        <Route path="/dashboard/freelancer"
          element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/freelancer/contracts"
          element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/freelancer/earnings"
          element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/freelancer/notifications"
          element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />

        {/* ── NGO ─────────────────────────────────────────────────────── */}
        <Route path="/dashboard/ngo"
          element={<ProtectedRoute allowedRoles={['ngo']}><NGODashboard /></ProtectedRoute>} />
        <Route path="/dashboard/ngo/post-task"
          element={<ProtectedRoute allowedRoles={['ngo']}><PostTaskPage /></ProtectedRoute>} />
        <Route path="/dashboard/ngo/edit-task/:id"
          element={<ProtectedRoute allowedRoles={['ngo']}><PostTaskPage /></ProtectedRoute>} />
        <Route path="/dashboard/ngo/tasks"
          element={<ProtectedRoute allowedRoles={['ngo']}><NGODashboard /></ProtectedRoute>} />
        <Route path="/dashboard/ngo/applicants"
          element={<ProtectedRoute allowedRoles={['ngo']}><NGODashboard /></ProtectedRoute>} />
        <Route path="/dashboard/ngo/notifications"
          element={<ProtectedRoute allowedRoles={['ngo']}><NGODashboard /></ProtectedRoute>} />

        {/* ── Admin ───────────────────────────────────────────────────── */}
        <Route path="/admin"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tasks"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/verifications"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/payouts"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/notifications"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/settings"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        {/* ── Profiles ────────────────────────────────────────────────── */}
        <Route path="/profile/volunteer"  element={<UserProfilePage role="volunteer" />} />
        <Route path="/profile/freelancer" element={<FreelancerProfilePage />} />
        <Route path="/profile/ngo"        element={<NGOProfilePage />} />

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
