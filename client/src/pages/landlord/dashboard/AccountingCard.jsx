import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import LoadingState from '@/components/shared/LoadingState';

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
        label: "Paid (Month)",
        color: "#64748b",
    },
};

const AccountingCard = () => {
// Fetch payment summary
    const { data: summary, isLoading, isFetched } = useQuery({
        queryKey: ['payment-summary-dashboard'],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.PAYMENTS.SUMMARY);
            return response.data.data;
        },
    });

    const accountingData = useMemo(() => {
        if (!summary) return [];
        
        return [
            { 
                name: 'Outstanding Balances',
                displayName: ['Outstanding', 'Balances'],
                value: summary.outstanding.total || 0, 
                fill: '#8b5cf6' 
            },
            { 
                name: 'Overdue',
                displayName: ['Overdue'],
                value: summary.overdue.total || 0, 
                fill: '#ef4444' 
            },
            { 
                name: 'Paid (Month)',
                displayName: ['Paid (Month)'],
                value: summary.paid.total || 0, 
                fill: '#64748b' 
            }
        ];
    }, [summary]);

    // Show loading only after first load
    const showLoading = isLoading && isFetched;

    return (
        <div className="bg-card rounded-lg border border-gray-400 p-5 md:p-6 h-full overflow-hidden flex flex-col min-h-[350px]">
            <h3 className="text-xl md:text-2xl lg:text-[28px] font-bold mb-2 flex-shrink-0">Accounting</h3>
            {showLoading ? (
                <LoadingState message="Loading accounting data..." compact={true} />
            ) : accountingData.length === 0 || accountingData.every(d => d.value === 0) ? (
                <div className="text-center py-4 text-gray-500 flex-1 flex items-center justify-center">
                    {isLoading ? (
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    ) : (
                        'No payment data available'
                    )}
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row items-center gap-6 flex-1 min-h-0">
                    {/* Legend - Left Side */}
                    <div className="w-full lg:w-auto order-2 lg:order-1 flex-shrink-0">
                        {accountingData.map((item) => (
                            <div key={item.name} className="mb-4 flex">
                                <div
                                    className="min-w-4 rounded-full mr-3 mt-1"
                                    style={{ backgroundColor: item.fill }}
                                ></div>
                                <div>
                                    <div className="text-base font-bold text-gray-900">
                                        {item.displayName.map((line, idx) => (
                                            <div key={idx}>{line}</div>
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-900">
                                        ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Donut Chart - Right Side, Larger */}
                    <div className="w-full lg:flex-1 order-1 lg:order-2 flex justify-start items-center overflow-hidden">
                        <div className="w-72 aspect-square max-w-full overflow-hidden">
                            <ChartContainer config={accountingChartConfig} className="w-full h-full overflow-hidden">
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
                                        <ChartTooltip
                                            content={<ChartTooltipContent 
                                                hideLabel
                                                formatter={(value, name, item) => {
                                                    const label = item.name;
                                                    const color = item.payload.fill;
                                                    return [
                                                        <div key={item.name} className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded" 
                                                                style={{ backgroundColor: color }}
                                                            />
                                                            <span>{label}: ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                    ];
                                                }}
                                            />}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountingCard;