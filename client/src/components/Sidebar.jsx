import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ navItems, activeNav, setActiveNav }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signup");
  };

  const handleNavClick = (id) => {
    setActiveNav(id);
  };

  return (
    <div
      className="w-[232px] text-white p-6 flex flex-col"
      style={{ backgroundColor: "#3B3B3B" }}
    >
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-gray-400">PropEase</h1>
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
    </div>
  );
};

export default Sidebar;
