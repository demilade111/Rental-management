import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignUp from './pages/auth/SignUp';
import TenantOnboarding from './pages/onboarding/TenantOnboarding';
import LandlordOnboarding from './pages/onboarding/LandlordOnboarding';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={<SignUp />} />

          {/* protected Tenant Routes */}
          <Route
            path="/onboarding/tenant"
            element={
              <ProtectedRoute allowedRoles={['TENANT']}>
                <TenantOnboarding />
              </ProtectedRoute>
            }
          />

          {/* protected Landlord Routes */}
          <Route
            path="/onboarding/landlord"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <LandlordOnboarding />
              </ProtectedRoute>
            }
          />

          {/* protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;