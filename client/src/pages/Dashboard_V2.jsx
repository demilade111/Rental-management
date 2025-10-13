import { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
    const [activeNav, setActiveNav] = useState('dashboard');
    
    // Mock user data - replace with actual auth store in your app
    const user = {
        firstName: 'Dumpsterina',
        lastName: 'Raccoonson',
        role: 'ADMIN' // or 'TENANT'
    };

    const isLandlord = user.role === 'ADMIN';
    const isTenant = user.role === 'TENANT';

    const handleLogout = () => {
        console.log('Logout');
    };

    // Landlord data
    const accountingData = [
        { name: 'Outstanding Balances', value: 15698.05, color: '#8b5cf6' },
        { name: 'Overdue', value: 2325.00, color: '#ef4444' },
        { name: 'Paid', value: 31954.55, color: '#64748b' }
    ];

    const leaseData = [
        { category: 'Offers', value: 5 },
        { category: 'Renewals', value: 9 },
        { category: 'Move outs', value: 2 }
    ];

    const applications = [
        { address: '1023 Jervis st, V6T 3A1', time: '8 hours ago', status: 'New' },
        { address: '456 Cherry st, V5T 2B4', time: '1 day ago', status: 'New' },
        { address: '1980 Hasting st, V6T 6A1', time: '3 days ago', status: 'Approved' },
        { address: '850 Nelson st, V7Y 7F5', time: '5 days ago', status: 'Undecided' },
        { address: '1603 Pendrell st, V4T 3A2', time: '1 week ago', status: 'Approved' }
    ];

    const maintenance = [
        { address: '1023 Jervis st', time: '2h', status: 'New', title: 'Kitchen sink faucet problem' },
        { address: '1980 Hasting st', time: '1d', status: 'Ongoing', title: 'Heater Repair' },
        { address: '1603 Pendrell st', time: '4d', status: 'Ongoing', title: 'Leak on the kitchen' },
        { address: '850 Nelson st', time: '22d', status: 'Done', title: 'Fridge is not working' },
        { address: '456 Cherry st', time: '1m', status: 'Ongoing', title: 'There is no hot water' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Ongoing': return 'bg-yellow-100 text-yellow-800';
            case 'Done': return 'bg-gray-100 text-gray-800';
            case 'Undecided': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Tenant data
    const tenantRecentActivity = [
        { type: 'Rent Payment Confirmed', date: 'October 1, 2025', details: '$1,500' },
        { type: 'Maintenance Request Submitted', date: 'September 28, 2025', details: 'Kitchen sink leak' },
        { type: 'Lease Renewed', date: 'September 15, 2025', details: '12 months' }
    ];

    // Landlord recent activity
    const landlordRecentActivity = [
        { type: 'New Tenant: Sarah Johnson', date: 'October 15, 2025', details: 'Property: 123 Main St' },
        { type: 'Payment Received: Unit 5B', date: 'October 1, 2025', details: '$1,800 - October rent' },
        { type: 'Maintenance Completed: Unit 2A', date: 'September 30, 2025', details: 'HVAC repair' }
    ];

    const navItems = isLandlord
        ? [
            { label: 'Dashboard', id: 'dashboard' },
            { label: 'Portfolio', id: 'portfolio' },
            { label: 'Applications', id: 'applications' },
            { label: 'Maintenance', id: 'maintenance' },
            { label: 'Accounting', id: 'accounting' },
            { label: 'Analytics', id: 'analytics' }
        ]
        : [
            { label: 'Dashboard', id: 'dashboard' },
            { label: 'My Lease', id: 'lease' },
            { label: 'Rent Payments', id: 'payments' },
            { label: 'Maintenance Requests', id: 'maintenance' }
        ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
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

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Good morning, {user.firstName} {user.lastName}!
                    </h2>
                    <span className="text-sm text-gray-600">
                        {isLandlord ? 'Landlord Dashboard' : 'Tenant Dashboard'}
                    </span>
                </div>

                {/* Content Grid */}
                <div className="p-8 space-y-6">
                    {/* Welcome Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-2">Welcome back!</h3>
                        <p className="text-gray-600">
                            {isLandlord
                                ? 'Manage your properties, view tenant information, and track payments.'
                                : 'Here you can view your rental information, pay rent, and submit maintenance requests.'
                            }
                        </p>
                    </div>

                    {/* Stats Grid */}
                    {isLandlord ? (
                        // Landlord Stats - 3 column grid
                        <div className="grid grid-cols-3 gap-6">
                            {/* Accounting Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-xl font-bold mb-6">Accounting</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        {accountingData.map((item) => (
                                            <div key={item.name} className="mb-4">
                                                <div className="text-sm font-semibold text-gray-700">{item.name}</div>
                                                <div className="text-lg font-bold text-gray-900">${item.value.toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <ResponsiveContainer width={150} height={150}>
                                        <PieChart>
                                            <Pie
                                                data={accountingData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                dataKey="value"
                                            >
                                                {accountingData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Applications Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-xl font-bold mb-4">Applications</h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {applications.map((app, idx) => (
                                        <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{app.address}</div>
                                                <div className="text-xs text-gray-500">{app.time}</div>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Maintenance Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-xl font-bold mb-4">Maintenance</h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {maintenance.map((item, idx) => (
                                        <div key={idx} className="pb-3 border-b border-gray-100 last:border-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="text-sm font-semibold text-gray-900">{item.address}</div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">{item.time}</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-600">{item.title}</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 text-center text-sm font-semibold text-gray-700 hover:text-gray-900 py-2">
                                    View All
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Tenant Stats - 3 column grid
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Current Rent</h3>
                                <p className="text-3xl font-bold">$1,500</p>
                                <p className="text-sm text-gray-600 mt-2">Due in 5 days</p>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Lease End Date</h3>
                                <p className="text-3xl font-bold">Dec 31</p>
                                <p className="text-sm text-gray-600 mt-2">2025</p>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-gray-500 text-sm font-medium mb-2">Maintenance Requests</h3>
                                <p className="text-3xl font-bold">2</p>
                                <p className="text-sm text-gray-600 mt-2">1 pending</p>
                            </div>
                        </div>
                    )}

                    {/* Bottom Row - Landlord Only */}
                    {isLandlord && (
                        <div className="grid grid-cols-2 gap-6">
                            {/* Expiring Leases Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-xl font-bold mb-4">Expiring Leases</h3>
                                <div className="flex space-x-4 mb-6">
                                    {['0-30 Days', '31-60 Days', '61-90 Days', 'All'].map((range, idx) => (
                                        <button
                                            key={range}
                                            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${idx === 0
                                                    ? 'bg-gray-800 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={leaseData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="category" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#64748b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Renters Insurance Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-xl font-bold mb-6">Renters Insurance</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-6">
                                            <div className="text-sm font-bold text-gray-900 mb-2">Insured (7)</div>
                                            <div className="space-y-2">
                                                <div className="text-xs text-gray-600">Expiring in 30 days (2)</div>
                                                <div className="text-xs text-gray-600">Not expiring soon (5)</div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 mb-2">Uninsured (3)</div>
                                            <div className="space-y-2">
                                                <div className="text-xs text-gray-600">Not Notified (1)</div>
                                                <div className="text-xs text-gray-600">Notified (2)</div>
                                            </div>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width={150} height={200}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Insured', value: 7, color: '#cbd5e1' },
                                                    { name: 'Uninsured', value: 3, color: '#64748b' }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                dataKey="value"
                                            >
                                                <Cell fill="#cbd5e1" />
                                                <Cell fill="#64748b" />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {isLandlord ? 'Recent Tenants' : 'Recent Activity'}
                        </h2>
                        <div className="space-y-4">
                            {(isLandlord ? landlordRecentActivity : tenantRecentActivity).map((item, idx) => (
                                <div key={idx} className={`border-b pb-4 ${idx === (isLandlord ? landlordRecentActivity.length - 1 : tenantRecentActivity.length - 1) ? 'border-0' : ''}`}>
                                    <p className="font-medium">{item.type}</p>
                                    <p className="text-sm text-gray-600">{item.date} - {item.details}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Portfolio Card - Landlord Only */}
                    {isLandlord && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold mb-6">Portfolio</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Vacant (3)</h4>
                                    <div className="flex space-x-4 mb-6">
                                        <div className="h-3 bg-gray-400 flex-1 rounded"></div>
                                    </div>
                                    <div className="text-sm text-gray-600">Listed (2) | Unlisted (1)</div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Occupied (7)</h4>
                                    <div className="flex space-x-2">
                                        <div className="h-3 bg-gray-600 flex-1 rounded"></div>
                                        <div className="h-3 bg-gray-300 flex-1 rounded"></div>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-2">Listed (5) | Unlisted (2)</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;