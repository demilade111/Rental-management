import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Menu, X, ChevronLeft, ChevronRight, HelpCircle, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ navItems, activeNav, setActiveNav }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

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
          ${isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
        `}
        style={{
          width: isCollapsed ? "70px" : "220px",
        }}
      >
        {/* Top section */}
        <div className="p-4 pr-0">
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
          <nav className="flex-1 space-y-0 overflow-y-auto">
            {navItems.map((item, index) => {
              const activeIndex = navItems.findIndex((nav) => nav.id === activeNav);
              const isActive = activeNav === item.id;
              const isBeforeActive = activeIndex !== -1 && index === activeIndex - 1;
              const isAfterActive = activeIndex !== -1 && index === activeIndex + 1;

              // Determine rounded corners
              let roundedClasses = "";
              if (isActive) {
                // Active item: no right corners rounded, just left corners
                roundedClasses = "rounded-tl-full rounded-bl-full";
              } else if (isBeforeActive) {
                // Item before active: left corners + bottom-right corner
                roundedClasses = "rounded-tl-full rounded-bl-full rounded-br-full";
              } else if (isAfterActive) {
                // Item after active: left corners + top-right corner
                roundedClasses = "rounded-tl-full rounded-bl-full rounded-tr-full";
              } else {
                // Regular items: only left corners
                roundedClasses = "rounded-tl-full rounded-bl-full";
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"
                    } ${isActive ? "pl-3 pr-0" : "px-3"} py-2.5 ${roundedClasses} transition-all duration-200 ease-in-out cursor-pointer ${isActive
                      ? "bg-white"
                      : "hover:bg-gray-300/10 active:bg-gray-300/20"
                    } relative overflow-visible`}
                >
                  {/* Background overlay for clipped-in rounded corners on adjacent items - matching active color */}
                  {/* {isBeforeActive && (
                    <div className="absolute -right-4 bottom-0 w-8 h-8 bg-white border-white">
                      <div className="absolute right-0 bottom-0 w-8 h-8 bg-primary rounded-br-full"></div>
                    </div>
                  )} */}
                  {/* {isAfterActive && (
                    <div className="absolute -right-4 top-0 w-8 h-8 bg-white border-white">
                      <div className="absolute right-0 top-0 w-8 h-8 bg-primary rounded-tr-full"></div>
                    </div>
                  )} */}

                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 relative z-10 transition-all duration-200 ease-in-out ${isActive
                        ? "bg-[#1F363D]"
                        : "bg-gray-300 hover:bg-gray-400"
                      }`}
                  ></div>
                  {!isCollapsed && (
                    <span
                      className={`text-[16px] whitespace-nowrap relative z-10 transition-colors duration-200 ease-in-out ${isActive
                          ? "text-[#1F363D] font-semibold"
                          : "text-white"
                        }`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-4 mt-auto p-4 space-y-2">
          <button
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"
              } px-3 py-2 rounded-lg hover:bg-gray-400/10 transition`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300/20 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            {!isCollapsed && <span className="text-[16px]">Help & Support</span>}
          </button>

          <button
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"
              } px-3 py-2 rounded-lg hover:bg-gray-400/10 transition`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300/20 flex items-center justify-center flex-shrink-0">
              <SettingsIcon className="w-5 h-5" />
            </div>
            {!isCollapsed && <span className="text-[16px]">Settings</span>}
          </button>

          <button
            onClick={() => setLogoutOpen(true)}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"
              } px-3 py-2 rounded-lg hover:bg-gray-400/10 transition`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300/20 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            {!isCollapsed && <span className="text-[16px]">Logout</span>}
          </button>
        </div>
      </div>

      {/* Content wrapper with proper left margin on desktop */}
      <div
        className={`transition-all duration-300 ease-in-out lg:ml-[${isCollapsed ? "70px" : "220px"
          }]`}
      />

      {/* Logout confirmation */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-2xl" onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sidebar;
