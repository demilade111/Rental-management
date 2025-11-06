import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LandlordDashboard from "../pages/landlord/dashboard/Dashboard";
import TenantDashboard from "../pages/tenant/dashboard/Dashboard";
import Analytics from "../pages/landlord/analytics/Analytics";
import PropertyPortfolio from "@/pages/landlord/property/PropertyPortfolio";
import PropertyDetails from "@/pages/landlord/property/PropertyDetails";
import MyLeasesTemplates from "../pages/landlord/leases/MyLeasesTemplates";
import Maintenance from "../pages/landlord/maintenance/Maintenance";
import Applications from "@/pages/landlord/application/Appications";
import LeasesPage from "@/pages/landlord/leases/LeasesPage";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const isLandlord = user?.role === "ADMIN";

  const navItems = isLandlord
    ? [
        { label: "Dashboard", id: "dashboard", path: "/landlord/dashboard" },
        { label: "Portfolio", id: "portfolio", path: "/landlord/portfolio" },
        { label: "Applications", id: "applications", path: "/landlord/applications" },
        { label: "Leases", id: "leases", path: "/landlord/leases" },
        { label: "Maintenance", id: "maintenance", path: "/landlord/maintenance" },
        // { label: "Analytics", id: "analytics", path: "/landlord/analytics" },
      ]
    : [
        { label: "Dashboard", id: "dashboard", path: "/tenant/dashboard" },
        { label: "Maintenance", id: "maintenance", path: "/tenant/maintenance" },
      ];

  const activeNav =
    navItems.find((item) => location.pathname.startsWith(item.path))?.id ||
    "dashboard";

  const handleNavChange = (id) => {
    const item = navItems.find((nav) => nav.id === id);
    if (item) navigate(item.path);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        navItems={navItems}
        activeNav={activeNav}
        setActiveNav={handleNavChange}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} isLandlord={isLandlord} />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Routes>
            <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
            <Route path="/landlord/portfolio" element={<PropertyPortfolio />} />
            <Route path="/landlord/portfolio/:id" element={<PropertyDetails />} />
            <Route path="/landlord/maintenance" element={<Maintenance />} />
            <Route path="/landlord/applications" element={<Applications />} />
            {/* <Route path="/landlord/analytics" element={<Analytics />} /> */}
            <Route path="/landlord/leases" element={<LeasesPage />} />

            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/maintenance" element={<Maintenance />} />

            <Route path="*" element={<Navigate to="/landlord/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
