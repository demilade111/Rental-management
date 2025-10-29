import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LandlordDashboard from "../pages/landlord/dashboard/Dashboard";
import TenantDashboard from "../pages/tenant/dashboard/Dashboard";
import Analytics from "../pages/landlord/analytics/Analytics";
import PropertyPortfolio from "@/pages/landlord/property/PropertyPortfolio";
<<<<<<< HEAD
import LeasesPage from "@/pages/landlord/leases/LeasesPage"; // ✅ New import
=======
import PropertyDetails from "@/pages/landlord/property/PropertyDetails";
import MyLeasesTemplates from "../pages/landlord/leases/MyLeasesTemplates";
import Maintenance from "../pages/landlord/maintenance/Maintenance";
import TenanceMaintenance from "@/pages/tenant/maintenance/Maintenance";
>>>>>>> main

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const isLandlord = user?.role === "ADMIN";

  const navItems = isLandlord
    ? [
        { label: "Dashboard", id: "dashboard", path: "/landlord/dashboard" },
        { label: "Portfolio", id: "portfolio", path: "/landlord/portfolio" },
<<<<<<< HEAD
        { label: "Leases", id: "leases", path: "/landlord/leases" }, // ✅ New item
        // { label: "Applications", id: "applications", path: "/applications" },
        // { label: "Maintenance", id: "maintenance", path: "/maintenance" },
        // { label: "Accounting", id: "accounting", path: "/accounting" },
=======
        {
          label: "Applications",
          id: "applications",
          path: "/landlord/applications",
        },
        {
          label: "Maintenance",
          id: "maintenance",
          path: "/landlord/maintenance",
        },
>>>>>>> main
        { label: "Analytics", id: "analytics", path: "/landlord/analytics" },
        { label: "My Leases", id: "leases", path: "/landlord/leases" },
      ]
    : [
        { label: "Dashboard", id: "dashboard", path: "/tenant/dashboard" },
        {
          label: "Maintenance",
          id: "maintenance",
          path: "/tenant/maintenance",
        },
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

      <div className="flex-1 overflow-auto">
        <Header user={user} isLandlord={isLandlord} />

        <div className="pb-10">
          <Routes>
            <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
            <Route path="/landlord/portfolio" element={<PropertyPortfolio />} />
<<<<<<< HEAD
            <Route path="/landlord/leases" element={<LeasesPage />} /> {/* ✅ New Route */}
            <Route path="/landlord/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/landlord/dashboard" replace />} />
=======
            <Route
              path="/landlord/portfolio/:id"
              element={<PropertyDetails />}
            />
            <Route path="/landlord/maintenance" element={<Maintenance />} />
            <Route path="/landlord/analytics" element={<Analytics />} />
            <Route path="/landlord/leases" element={<MyLeasesTemplates />} />

            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route
              path="/tenant/maintenance"
              element={<TenanceMaintenance />}
            />
>>>>>>> main
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
