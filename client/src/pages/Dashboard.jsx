import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signup');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        {user?.role === 'TENANT' ? 'Tenant Dashboard' : 'Landlord Dashboard'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">{user?.firstName} {user?.lastName}</span>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                        Welcome back, {user?.firstName}!
                    </h2>
                    <p className="text-gray-600">
                        {user?.role === 'TENANT'
                            ? 'Here you can view your rental information, pay rent, and submit maintenance requests.'
                            : 'Manage your properties, view tenant information, and track payments.'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {user?.role === 'TENANT' ? (
                        <>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Current Rent</h3>
                                <p className="text-3xl font-bold">$1,500</p>
                                <p className="text-sm text-gray-600 mt-2">Due in 5 days</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Lease End Date</h3>
                                <p className="text-3xl font-bold">Dec 31</p>
                                <p className="text-sm text-gray-600 mt-2">2025</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Maintenance Requests</h3>
                                <p className="text-3xl font-bold">2</p>
                                <p className="text-sm text-gray-600 mt-2">1 pending</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Total Properties</h3>
                                <p className="text-3xl font-bold">12</p>
                                <p className="text-sm text-gray-600 mt-2">8 occupied</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Monthly Revenue</h3>
                                <p className="text-3xl font-bold">$18,000</p>
                                <p className="text-sm text-green-600 mt-2">+5% from last month</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Pending Requests</h3>
                                <p className="text-3xl font-bold">5</p>
                                <p className="text-sm text-gray-600 mt-2">Maintenance issues</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {user?.role === 'TENANT' ? 'Recent Activity' : 'Recent Tenants'}
                    </h2>
                    <div className="space-y-4">
                        {user?.role === 'TENANT' ? (
                            <>
                                <div className="border-b pb-4">
                                    <p className="font-medium">Rent Payment Confirmed</p>
                                    <p className="text-sm text-gray-600">October 1, 2025 - $1,500</p>
                                </div>
                                <div className="border-b pb-4">
                                    <p className="font-medium">Maintenance Request Submitted</p>
                                    <p className="text-sm text-gray-600">September 28, 2025 - Kitchen sink leak</p>
                                </div>
                                <div className="pb-4">
                                    <p className="font-medium">Lease Renewed</p>
                                    <p className="text-sm text-gray-600">September 15, 2025 - 12 months</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="border-b pb-4">
                                    <p className="font-medium">New Tenant: Sarah Johnson</p>
                                    <p className="text-sm text-gray-600">Property: 123 Main St - Move in: Oct 15</p>
                                </div>
                                <div className="border-b pb-4">
                                    <p className="font-medium">Payment Received: Unit 5B</p>
                                    <p className="text-sm text-gray-600">$1,800 - October rent</p>
                                </div>
                                <div className="pb-4">
                                    <p className="font-medium">Maintenance Completed: Unit 2A</p>
                                    <p className="text-sm text-gray-600">HVAC repair - September 30</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}