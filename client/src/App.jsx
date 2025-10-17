import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import SignUp from './pages/auth/SignUp';
import TenantOnboarding from './pages/onboarding/TenantOnboarding';
import LandlordOnboarding from './pages/onboarding/LandlordOnboarding';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';

// Create a client
const queryClient = new QueryClient();

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } 
          />

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

          {/* All dashboard routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;