import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import NotificationDropdown from "./NotificationDropdown";
import ProfileImage from "./shared/ProfileImage";
import { User, LogOut } from "lucide-react";

const Header = ({ user, isLandlord }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const showGreeting =
    location.pathname === "/landlord/dashboard" ||
    location.pathname === "/tenant/dashboard";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    queryClient.clear();
    console.log('🧹 Cleared all React Query cache on logout');
    logout();
    navigate("/login");
  };

  const handleAccountClick = () => {
    setShowProfileMenu(false);
    navigate(isLandlord ? "/landlord/account" : "/tenant/account");
  };

  return (
    <div className="px-8 pb-2 pt-4 flex justify-between items-center">
      {showGreeting ? (
        <h2 className="text-[16px] text-gray-900">
          Good morning,{" "}
          <span className="font-semibold">
            {user?.firstName} {user?.lastName}!
          </span>
        </h2>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-4">
        <NotificationDropdown />
        
        {/* Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-gray-300 transition-all"
          >
            {user?.profileImage ? (
              <ProfileImage
                imageUrl={user.profileImage}
                alt={`${user?.firstName} ${user?.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleAccountClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Account</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
