import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

// Chart config for accounting data
const accountingChartConfig = {
    value: {
        label: "Amount",
    },
    outstanding: {
        label: "Outstanding Balances",
        color: "#8b5cf6",
    },
    overdue: {
        label: "Overdue",
        color: "#ef4444",
    },
    paid: {
        label: "Paid",
        color: "#64748b",
    },
};

const AccountingCard = ({ data }) => {
    const accountingData = data || [
        { name: 'Outstanding Balances', value: 15698.05, fill: '#8b5cf6' },
        { name: 'Overdue', value: 2325.00, fill: '#ef4444' },
        { name: 'Paid', value: 31954.55, fill: '#64748b' }
    ];

    return (
        <div className="bg-card rounded-lg border border-gray-400 p-6">
            <h3 className="text-[32px] font-bold mb-6">Accounting</h3>
            <div className="flex items-center">
                <div className="flex-1">
                    {accountingData.map((item) => (
                        <div key={item.name} className="mb-4 flex">
                            <div
                                className="min-w-4 rounded-full mr-3"
                                style={{ backgroundColor: item.fill }}
                            ></div>
                            <div>
                                <div className="text-[16px] font-bold text-gray-900">{item.name}</div>
                                <div className="text-[16px] text-gray-900">
                                    ${item.value.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full sm:h-64 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={accountingData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius="40%"
                                outerRadius="80%"
                            >
                                {accountingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

export default AccountingCard;