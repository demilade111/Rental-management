import { Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ navItems, activeNav, setActiveNav }) => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signup');
    };

    return (
        <div className="w-48 bg-gray-800 text-white p-6 flex flex-col">
            <div className="mb-8">
                <h1 className="text-lg font-semibold text-gray-400">PropEase</h1>
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveNav(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition ${activeNav === item.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                            }`}
                    >
                        <span className="text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="space-y-2 border-t border-gray-700 pt-4">
                <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                    <Settings size={18} />
                    <span className="text-sm">Settings</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                    <LogOut size={18} />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
