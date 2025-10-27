import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Dashboard from "../pages/landlord/dashboard/Dashboard";
import Analytics from "../pages/landlord/analytics/Analytics";
import PropertyPortfolio from "@/pages/landlord/property/PropertyPortfolio";
import PropertyDetails from "@/pages/landlord/property/PropertyDetails";

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
      { label: "Maintenance", id: "maintenance", path: "/maintenance" },
      // { label: "Accounting", id: "accounting", path: "/accounting" },
      { label: "Analytics", id: "analytics", path: "/landlord/analytics" },
    ]
    : [
      { label: "Dashboard", id: "dashboard", path: "/dashboard" },
      { label: "My Lease", id: "lease", path: "/lease" },
      { label: "Rent Payments", id: "payments", path: "/payments" },
      {
        label: "Maintenance Requests",
        id: "maintenance",
        path: "/maintenance",
      },
    ];

  const activeNav =
    navItems.find((item) => location.pathname.startsWith(item.path))?.id ||
    "dashboard";

  const handleNavChange = (id) => {
    const item = navItems.find((nav) => nav.id === id);
    if (item) {
      navigate(item.path);
    }
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
            <Route path="/landlord/dashboard" element={<Dashboard />} />
            <Route path="/landlord/portfolio" element={<PropertyPortfolio />} />
            <Route path="/landlord/portfolio/:id" element={<PropertyDetails />} />
            <Route path="/landlord/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
