import React, { useState } from 'react';
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

// Chart config for browser data
const chartConfig = {
    expiring_leases: {
        label: "Expiring Leases",
    },
    offers: {
        label: "Offers",
        color: "var(--chart-1)",
    },
    renewals: {
        label: "Renewals",
        color: "var(--chart-2)",
    },
    move_outs: {
        label: "Move Outs",
        color: "var(--chart-3)",
    },
};

// Sample data for different time periods
const allData = {
    '0-30': [
        { browser: "offers", expiring_leases: 5, fill: "var(--color-offers)" },
        { browser: "renewals", expiring_leases: 9, fill: "var(--color-renewals)" },
        { browser: "move_outs", expiring_leases: 2, fill: "var(--color-move_outs)" },
    ],
    '31-60': [
        { browser: "offers", expiring_leases: 6, fill: "var(--color-offers)" },
        { browser: "renewals", expiring_leases: 8, fill: "var(--color-renewals)" },
        { browser: "move_outs", expiring_leases: 4, fill: "var(--color-move_outs)" },
    ],
    '61-90': [
        { browser: "offers", expiring_leases: 5, fill: "var(--color-offers)" },
        { browser: "renewals", expiring_leases: 3, fill: "var(--color-renewals)" },
        { browser: "move_outs", expiring_leases: 1, fill: "var(--color-move_outs)" },
    ],
    'all': [
        { browser: "offers", expiring_leases: 7, fill: "var(--color-offers)" },
        { browser: "renewals", expiring_leases: 9, fill: "var(--color-renewals)" },
        { browser: "move_outs", expiring_leases: 3, fill: "var(--color-move_outs)" },
    ]
};

const filters = [
    { id: '0-30', label: '0-30 Days' },
    { id: '31-60', label: '31-60 Days' },
    { id: '61-90', label: '61-90 Days' },
    { id: 'all', label: 'All' }
];

const ExpiringLeasesCard = () => {
    const [activeFilter, setActiveFilter] = useState('0-30');
    const chartData = allData[activeFilter];

    return (
        <div className="bg-white rounded-lg border border-gray-400 p-6">
            <h3 className="text-[32px] font-bold mb-8">Expiring Leases</h3>
            {/* Filter Buttons */}
            <div className="flex gap-3 mb-8 justify-between">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-colors ${activeFilter === filter.id
                                ? 'bg-gray-800 text-white'
                                : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            <ChartContainer config={chartConfig}>
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                >
                    <YAxis
                        dataKey="browser"
                        type="category"
                        tickLine={false}
                        tickMargin={96}
                        axisLine={true}
                        width={100}
                        tickFormatter={(value) => chartConfig[value]?.label}
                        tick={{ fontSize: 16, textAnchor: 'start' }}
                        style={{ fill: '#000' }}
                    />
                    <XAxis dataKey="expiring_leases" type="number" hide />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="expiring_leases" layout="vertical" radius={[0, 10, 10, 0]} barSize={32} />
                </BarChart>
            </ChartContainer>
        </div>
    );
};

export default ExpiringLeasesCard;