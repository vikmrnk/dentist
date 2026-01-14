import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { RoleGuard } from '@/auth/ProtectedRoute'
import { LoginPage } from '@/pages/Login/Login'
import { DashboardPage } from '@/pages/Dashboard/Dashboard'
import { PatientsPage } from '@/pages/Patients/Patients'
import { DoctorsPage } from '@/pages/Doctors/Doctors'
import { AppointmentsPage } from '@/pages/Appointments/Appointments'
import { ReportsPage } from '@/pages/Reports/Reports'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'patients',
        element: <PatientsPage />,
      },
      {
        path: 'doctors',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <DoctorsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'appointments',
        element: <AppointmentsPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
    ],
  },
])

