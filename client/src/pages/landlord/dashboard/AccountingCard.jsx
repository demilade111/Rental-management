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
    const { data: summary, isLoading } = useQuery({
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
                value: summary.outstanding.total || 0, 
                fill: '#8b5cf6' 
            },
            { 
                name: 'Overdue', 
                value: summary.overdue.total || 0, 
                fill: '#ef4444' 
            },
            { 
                name: 'Paid (Month)', 
                value: summary.paid.total || 0, 
                fill: '#64748b' 
            }
        ];
    }, [summary]);

    if (isLoading) {
        return (
            <div className="bg-card rounded-lg border border-gray-400 p-5 md:p-6 h-full overflow-hidden">
                <h3 className="text-xl md:text-2xl lg:text-[30px] font-bold mb-3">Accounting</h3>
                <LoadingState message="Loading accounting data..." compact={true} />
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg border border-gray-400 p-5 md:p-6 h-full overflow-hidden">
            <h3 className="text-xl md:text-2xl lg:text-[30px] font-bold mb-3">Accounting</h3>
            {accountingData.length === 0 || accountingData.every(d => d.value === 0) ? (
                <div className="text-center py-8 text-gray-500">
                    No payment data available
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    {/* Legend - Left Side */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                        {accountingData.map((item) => (
                            <div key={item.name} className="mb-3 flex">
                                <div
                                    className="min-w-4 rounded-full mr-3"
                                    style={{ backgroundColor: item.fill }}
                                ></div>
                                <div>
                                    <div className="text-[18px] font-bold text-gray-900">{item.name}</div>
                                    <div className="text-[16px] text-gray-900">
                                        ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Donut Chart - Right Side, Left Aligned */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2 flex lg:justify-start items-center justify-center overflow-hidden">
                        <div className="w-72 aspect-square max-w-[300px] overflow-hidden">
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