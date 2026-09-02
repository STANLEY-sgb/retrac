import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import NewClientPage from './pages/NewClientPage';
import CheckinsPage from './pages/CheckinsPage';
import RiskAlertsPage from './pages/RiskAlertsPage';
import InterventionsPage from './pages/InterventionsPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import NewJobPage from './pages/NewJobPage';
import JobMatchingPage from './pages/JobMatchingPage';
import EmployersPage from './pages/EmployersPage';
import PaymentsPage from './pages/PaymentsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';
import DemoSmsSimulatorPage from './pages/DemoSmsSimulatorPage';
import DemoPaymentSimulatorPage from './pages/DemoPaymentSimulatorPage';

// Guards
function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

      {/* Protected Routes inside AppLayout */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<NewClientPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="checkins" element={<CheckinsPage />} />
        <Route path="risk-alerts" element={<RiskAlertsPage />} />
        <Route path="interventions" element={<InterventionsPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/new" element={<NewJobPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="job-matches" element={<JobMatchingPage />} />
        <Route path="employers" element={<EmployersPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<PrivateRoute roles={['admin']}><SettingsPage /></PrivateRoute>} />
        <Route path="admin/users" element={<PrivateRoute roles={['admin']}><AdminUsersPage /></PrivateRoute>} />
        <Route path="admin/audit-logs" element={<PrivateRoute roles={['admin']}><AdminAuditLogsPage /></PrivateRoute>} />
        <Route path="demo/sms" element={<DemoSmsSimulatorPage />} />
        <Route path="demo/payment" element={<DemoPaymentSimulatorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
