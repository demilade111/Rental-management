import { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
    const [activeNav, setActiveNav] = useState('dashboard');
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const isLandlord = user?.role === 'ADMIN';
    const isTenant = user?.role === 'TENANT';

    const handleLogout = () => {
        logout();
        navigate('/signup');
    };

    const accountingData = user?.landlordStats?.accounting || [
        { name: 'Outstanding Balances', value: 15698.05, color: '#8b5cf6' },
        { name: 'Overdue', value: 2325.00, color: '#ef4444' },
        { name: 'Paid', value: 31954.55, color: '#64748b' }
    ];

    const leaseData = user?.landlordStats?.leases || [
        { category: 'Offers', value: 5 },
        { category: 'Renewals', value: 9 },
        { category: 'Move outs', value: 2 }
    ];

    const applications = user?.landlordStats?.applications || [
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

    const navItems = isLandlord
        ? [
            { label: 'Dashboard', id: 'dashboard', path: '/dashboard' },
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

            {/* Main Content */}
            <div className="flex-1 overflow-auto">

                {/* Content Grid */}
                <div className="p-8 space-y-6">
                    {/* Two Section Layout */}
                    {isLandlord && (
                        <div className="flex gap-6">
                            {/* Left Section 3/4 */}
                            <div className="w-3/4 grid grid-cols-2 gap-6">
                                {/* Accounting */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold mb-6">Accounting</h3>
                                    <div className="flex items-center">
                                        <div>
                                            {accountingData.map((item) => (
                                                <div key={item.name} className="mb-4">
                                                    <div className="text-sm font-semibold text-gray-700">{item.name}</div>
                                                    <div className="text-lg font-bold text-gray-900">${item.value.toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <ResponsiveContainer width={180} height={180}>
                                            <PieChart>
                                                <Pie
                                                    data={accountingData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
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

                                {/* Applications */}
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

                                {/* Expiring Leases */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold mb-4">Expiring Leases</h3>
                                </div>

                                {/* Renters Insurance */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold mb-4">Renters Insurance</h3>
                                </div>
                            </div>

                            {/* Right Section 1/4 - Maintenance */}
                            <div className="w-1/4">
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold mb-4">Maintenance</h3>
                                    <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
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
