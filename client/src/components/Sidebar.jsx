import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Menu, X, ChevronLeft, ChevronRight, HelpCircle, LogOut, User } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const Sidebar = ({ navItems, activeNav, setActiveNav }) => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Check if current page is Account (not accounting)
  const location = window.location.pathname;
  const isAccountActive = location === '/landlord/account' || location === '/tenant/account';

  const handleLogout = () => {
    // Clear all cached queries to prevent showing stale data on next login
    queryClient.clear();
    console.log('🧹 Cleared all React Query cache on logout');
    
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

      {/* Sidebar container */}
      <div
        className={`
          bg-primary dark:bg-gray-950 dark:border-r dark:border-gray-800 fixed lg:static inset-y-0 left-0 z-40 flex flex-col justify-between
          text-white dark:text-gray-100 transform transition-all duration-300 ease-in-out
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
          {isCollapsed ? (
            <div className="mb-8 flex items-center justify-center">
              <button
                onClick={() => setIsCollapsed(false)}
                className="hidden lg:block p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
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

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center ${
                    isCollapsed 
                      ? "justify-center px-0" 
                      : "space-x-3"
                    } ${
                    !isCollapsed && isActive 
                      ? "pl-3 pr-0" 
                      : !isCollapsed 
                      ? "px-3" 
                      : ""
                    } py-2.5 rounded-tl-full rounded-bl-full transition-all duration-200 ease-in-out cursor-pointer ${isActive
                      ? "bg-white dark:bg-gray-900"
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
                        ? "bg-[#1F363D] dark:bg-gray-100"
                        : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                      }`}
                  ></div>
                  {!isCollapsed && (
                    <span
                      className={`text-[16px] whitespace-nowrap relative z-10 transition-colors duration-200 ease-in-out ${isActive
                          ? "text-[#1F363D] dark:text-gray-100 font-semibold"
                          : "text-white dark:text-gray-300"
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
        <div className="border-t border-gray-700 dark:border-gray-800 pt-4 mt-auto p-4 pr-0 space-y-2">
          <button
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "space-x-3 px-3"
            } py-2.5 rounded-tl-full rounded-bl-full transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-300/10 active:bg-gray-300/20 relative overflow-visible`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-200 ease-in-out">
              <HelpCircle className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            </div>
            {!isCollapsed && <span className="text-[16px] text-white dark:text-gray-300 whitespace-nowrap relative z-10">Help & Support</span>}
          </button>

          <button
            onClick={() => navigate(user?.role === "ADMIN" ? "/landlord/account" : "/tenant/account")}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "space-x-3"
            } ${
              !isCollapsed && isAccountActive ? "pl-3 pr-0" : !isCollapsed ? "px-3" : ""
            } py-2.5 rounded-tl-full rounded-bl-full transition-all duration-200 ease-in-out cursor-pointer ${
              isAccountActive 
                ? "bg-white dark:bg-gray-900" 
                : "hover:bg-gray-400/10 dark:hover:bg-gray-800"
            } relative overflow-visible`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 relative z-10 transition-all duration-200 ease-in-out ${
              isAccountActive 
                ? "bg-[#1F363D] dark:bg-gray-100" 
                : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}>
              <div className="w-full h-full flex items-center justify-center">
                <User className={`w-5 h-5 ${isAccountActive ? "text-white dark:text-gray-900" : "text-gray-900 dark:text-gray-100"}`} />
              </div>
            </div>
            {!isCollapsed && (
              <span className={`text-[16px] whitespace-nowrap relative z-10 transition-colors duration-200 ease-in-out ${
                isAccountActive 
                  ? "text-[#1F363D] dark:text-gray-100 font-semibold" 
                  : "text-white dark:text-gray-300"
              }`}>
                Account
              </span>
            )}
          </button>

          <button
            onClick={() => setLogoutOpen(true)}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "space-x-3 px-3"
            } py-2.5 rounded-tl-full rounded-bl-full transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-300/10 active:bg-gray-300/20 relative overflow-visible`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-200 ease-in-out">
              <LogOut className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            </div>
            {!isCollapsed && <span className="text-[16px] text-white dark:text-gray-300 whitespace-nowrap relative z-10">Logout</span>}
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
