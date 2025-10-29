import { useState } from "react";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ navItems, activeNav, setActiveNav }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = (id) => {
    setActiveNav(id);
    setIsMobileMenuOpen(false);
  };

  // const sidebarWidth = isCollapsed ? "w-[70px]" : "w-[220px]";

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg cursor-pointer"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Collapsed expand button */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden lg:flex fixed top-4 left-4 z-40 p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Sidebar container */}
      <div
        className={`
          bg-primary fixed lg:static inset-y-0 left-0 z-40 flex flex-col justify-between
          text-white transform transition-all duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        style={{
          width: isCollapsed ? "70px" : "220px",
        }}
      >
        {/* Top section */}
        <div className="p-4">
          {!isCollapsed && (
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-300 whitespace-nowrap">
                PropEase
              </h1>
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:block p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          )}

          {/* Nav Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center" : "space-x-3"
                } px-3 py-2 rounded-lg transition cursor-pointer ${
                  activeNav === item.id
                    ? "bg-gray-400/10"
                    : "hover:bg-gray-400/10"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                {!isCollapsed && (
                  <span className="text-[16px] whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-4 mt-auto p-4 space-y-2">
          <button
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center" : "space-x-3"
            } px-3 py-2 rounded-lg hover:bg-gray-400/10 transition`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
            {!isCollapsed && <span className="text-[16px]">Settings</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center" : "space-x-3"
            } px-3 py-2 rounded-lg hover:bg-gray-400/10 transition`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
            {!isCollapsed && <span className="text-[16px]">Logout</span>}
          </button>
        </div>
      </div>

      {/* Content wrapper with proper left margin on desktop */}
      <div
        className={`transition-all duration-300 ease-in-out lg:ml-[${
          isCollapsed ? "70px" : "220px"
        }]`}
      />
    </>
  );
};

export default Sidebar;
