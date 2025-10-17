import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../pages/Dashboard';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const isLandlord = user?.role === 'ADMIN';

  const navItems = isLandlord
    ? [
        { label: 'Dashboard', id: 'dashboard', path: '/dashboard' },
        { label: 'Portfolio', id: 'portfolio', path: '/portfolio' },
        { label: 'Applications', id: 'applications', path: '/applications' },
        { label: 'Maintenance', id: 'maintenance', path: '/maintenance' },
        { label: 'Accounting', id: 'accounting', path: '/accounting' },
        { label: 'Analytics', id: 'analytics', path: '/analytics' }
      ]
    : [
        { label: 'Dashboard', id: 'dashboard', path: '/dashboard' },
        { label: 'My Lease', id: 'lease', path: '/lease' },
        { label: 'Rent Payments', id: 'payments', path: '/payments' },
        { label: 'Maintenance Requests', id: 'maintenance', path: '/maintenance' }
      ];

  const activeNav = navItems.find(item => item.path === location.pathname)?.id || 'dashboard';

  const handleNavChange = (id) => {
    const item = navItems.find(nav => nav.id === id);
    if (item) {
      navigate(item.path);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        navItems={navItems} 
        activeNav={activeNav} 
        setActiveNav={handleNavChange} 
      />
      
      <div className="flex-1 overflow-auto">
        <Header user={user} isLandlord={isLandlord} />
        
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/analytics" element={<Analytics />} /> */}
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default MainLayout;