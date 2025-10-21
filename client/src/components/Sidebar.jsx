import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ navItems, activeNav, setActiveNav }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = (id) => {
    setActiveNav(id);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden lg:block fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <div
        className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    text-white p-6 flex flex-col
                    transform transition-all duration-300 ease-in-out
                    ${
                      isMobileMenuOpen
                        ? "translate-x-0 w-64"
                        : "-translate-x-full lg:translate-x-0"
                    }
                    ${
                      isCollapsed
                        ? "lg:w-0 lg:p-0 lg:overflow-hidden"
                        : "lg:w-[232px]"
                    }
                `}
        style={{ backgroundColor: "#3B3B3B" }}
      >
        {!isCollapsed && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-400">PropEase</h1>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-2 hover:bg-gray-700 rounded-lg transition cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-0 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 transition cursor-pointer ${
                    activeNav === item.id ? "bg-gray-400/10 rounded-lg" : "hover:bg-gray-700"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex-shrink-0"></div>
                  <span className="text-[18px] whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
            <div className="space-y-2 border-t border-gray-700 pt-4 mt-4">
              <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer">
                <span className="text-sm">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
              >
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
      <nav className="flex-1 space-y-0 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 transition cursor-pointer ${
              activeNav === item.id ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-400 flex-shrink-0"></div>
            <span className="text-[18px] whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="space-y-2 border-t border-gray-700 pt-4 mt-4">
        <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer">
          <span className="text-sm">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
        >
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
