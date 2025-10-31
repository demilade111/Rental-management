import LeasesPage from "@/pages/landlord/leases/LeasesPage";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TenantOnboarding from "./pages/onboarding/TenantOnboarding";
import LandlordOnboarding from "./pages/onboarding/LandlordOnboarding";
import MainLayout from "./layouts/MainLayout";
import ApplyForm from "./pages/landlord/application/ApplyForm";

const queryClient = new QueryClient();

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/onboarding/tenant"
            element={
              <ProtectedRoute allowedRoles={["TENANT"]}>
                <TenantOnboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/onboarding/landlord"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <LandlordOnboarding />
              </ProtectedRoute>
            }
          />

          <Route path="/apply/:publicId" element={<ApplyForm />} />

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

// import { useEffect } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useAuthStore } from "./store/authStore";
// import SignUp from "./pages/auth/SignUp";
// import Login from "./pages/auth/Login";
// import TenantOnboarding from "./pages/onboarding/TenantOnboarding";
// import LandlordOnboarding from "./pages/onboarding/LandlordOnboarding";
// import Dashboard from "./pages/landlord/dashboard/Dashboard";
// import MainLayout from "./layouts/MainLayout";
// import Maintenance from "./pages/landlord/Maintenance";

// const queryClient = new QueryClient();

// function App() {
//   const initializeAuth = useAuthStore((state) => state.initializeAuth);

//   useEffect(() => {
//     initializeAuth();
//   }, [initializeAuth]);

//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <Routes>
//           {/* Default route redirects to login */}
//           <Route path="/" element={<Navigate to="/login" replace />} />

//           {/* Public routes */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<SignUp />} />

//           {/* Onboarding routes (no restriction) */}
//           <Route path="/onboarding/tenant" element={<TenantOnboarding />} />
//           <Route path="/maintenance/landlord" element={<Maintenance />} />
//           <Route path="/onboarding/landlord" element={<LandlordOnboarding />} />

//           {/* Main layout & dashboard (fully open) */}
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/*" element={<MainLayout />} />
//         </Routes>
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// }

// export default App;
