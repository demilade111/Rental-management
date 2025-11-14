import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import api from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apiEndpoints';
import LoadingState from '@/components/shared/LoadingState';

// Chart config
const chartConfig = {
    expiring_leases: {
        label: "Expiring Leases",
    },
    draft: {
        label: "Draft Leases",
        color: "var(--chart-1)",
    },
    active: {
        label: "Active Leases",
        color: "var(--chart-2)",
    },
    expiring_soon: {
        label: "Expiring Soon",
        color: "var(--chart-3)",
    },
};

const filters = [
    { id: '0-30', label: '0-30 Days' },
    { id: '31-60', label: '31-60 Days' },
    { id: '61-90', label: '61-90 Days' },
    { id: 'all', label: 'All' }
];

const ExpiringLeasesCard = () => {
    const [activeFilter, setActiveFilter] = useState('0-30');

    // Fetch all leases
    const { data: leases = [], isLoading, isFetched } = useQuery({
        queryKey: ['leases-dashboard'],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.LEASES.BASE);
            return response.data.data || response.data || [];
        },
    });

    // Calculate expiring leases by time period
    const chartData = useMemo(() => {
        if (!leases.length) return [];

        const now = new Date();
        const filterLeasesByDays = (minDays, maxDays) => {
            return leases.filter(lease => {
                if (!lease.endDate || lease.leaseStatus === 'TERMINATED' || lease.leaseStatus === 'EXPIRED') {
                    return false;
                }
                const endDate = new Date(lease.endDate);
                const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry >= minDays && daysUntilExpiry <= maxDays;
            });
        };

        let filteredLeases = [];
        if (activeFilter === '0-30') {
            filteredLeases = filterLeasesByDays(0, 30);
        } else if (activeFilter === '31-60') {
            filteredLeases = filterLeasesByDays(31, 60);
        } else if (activeFilter === '61-90') {
            filteredLeases = filterLeasesByDays(61, 90);
        } else {
            filteredLeases = filterLeasesByDays(0, 365);
        }

        // Categorize leases
        const draft = filteredLeases.filter(l => l.leaseStatus === 'DRAFT').length;
        const active = filteredLeases.filter(l => l.leaseStatus === 'ACTIVE').length;
        const expiringSoon = filteredLeases.filter(l => {
            if (!l.endDate) return false;
            const endDate = new Date(l.endDate);
            const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && l.leaseStatus === 'ACTIVE';
        }).length;

        return [
            { browser: "draft", expiring_leases: draft, fill: "var(--color-draft)" },
            { browser: "active", expiring_leases: active, fill: "var(--color-active)" },
            { browser: "expiring_soon", expiring_leases: expiringSoon, fill: "var(--color-expiring_soon)" },
        ];
    }, [leases, activeFilter]);

    // Don't show loading indicator on first load
    const showLoading = isLoading && isFetched;

    return (
        <div className="bg-card rounded-lg border border-gray-400 p-5 md:p-6 h-full flex flex-col overflow-hidden min-h-[350px]">
            <h3 className="text-xl md:text-2xl lg:text-[28px] font-bold mb-6">Expiring Leases</h3>
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-3 justify-start flex-shrink-0">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold transition-colors ${activeFilter === filter.id
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {showLoading ? (
                <LoadingState message="Loading leases..." compact={true} />
            ) : chartData.length === 0 || chartData.every(d => d.expiring_leases === 0) ? (
                <div className="text-center py-4 text-gray-500 flex-1 flex items-center justify-center">
                    {isLoading && !isFetched ? (
                        <div className="animate-pulse w-full space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-6 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    ) : (
                        'No leases expiring in this period'
                    )}
                </div>
            ) : (
                <div className="flex-1 min-h-0 max-h-[220px] overflow-hidden">
                    <ChartContainer config={chartConfig} className="h-full">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            barCategoryGap="5%"
                            margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
                        >
                            <YAxis
                                dataKey="browser"
                                type="category"
                                tickLine={false}
                                tickMargin={70}
                                axisLine={true}
                                width={80}
                                tickFormatter={(value) => chartConfig[value]?.label}
                                tick={{ fontSize: 12, textAnchor: 'start' }}
                                style={{ fill: '#000' }}
                            />
                            <XAxis dataKey="expiring_leases" type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name, item) => {
                                        const label = chartConfig[item.payload.browser]?.label || item.payload.browser;
                                        const color = item.payload.fill;
                                        return [
                                            <div key={item.payload.browser} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span>{label}: {value}</span>
                                            </div>
                                        ];
                                    }}
                                />}
                            />
                            <Bar dataKey="expiring_leases" layout="vertical" radius={[0, 16, 16, 0]} barSize={20} />
                        </BarChart>
                    </ChartContainer>
                </div>
            )}
        </div>
    );
};

export default ExpiringLeasesCard;