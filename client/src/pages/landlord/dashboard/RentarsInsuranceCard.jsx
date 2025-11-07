import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const RentersInsuranceCard = () => {
    const chartData = [
        {
            category: "insurance",
            expiringInThirty: 2,
            notExpiring: 5,
            notNotified: 1,
            notified: 2
        }
    ];

    return (
        <div className="bg-card rounded-lg border border-gray-400 p-6">
            <h2 className="text-[32px] font-bold mb-10">Renters Insurance</h2>
            <div className="flex items-center gap-8">
                <div className="w-38 h-72 flex-shrink-0 p-0 -ml-3 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <XAxis type="category" dataKey="category" hide />
                            <YAxis type="number" hide domain={[0]} />
                            <defs>
                                {/* Light gray pattern */}
                                <pattern id="patternLight" patternUnits="userSpaceOnUse" width="8" height="8">
                                    <rect width="8" height="8" fill="#d1d5db" />
                                    <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#b8bcc4" strokeWidth="1.5" />
                                </pattern>
                                {/* Dark gray pattern */}
                                <pattern id="patternDark" patternUnits="userSpaceOnUse" width="8" height="8">
                                    <rect width="8" height="8" fill="#6b7280" />
                                    <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#505559" strokeWidth="1.5" />
                                </pattern>
                            </defs>
                            <Bar dataKey="notified" stackId="a" radius={[0, 0, 10, 10]} fill="#6b7280" />
                            <Bar dataKey="notNotified" stackId="a" fill="url(#patternDark)" />
                            <Bar dataKey="notExpiring" stackId="a" fill="#d1d5db" />
                            <Bar dataKey="expiringInThirty" stackId="a" radius={[10, 10, 0, 0]} fill="url(#patternLight)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-[16px] font-bold mb-3">Insured (7)</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 ml-3">
                                <div className="w-8 h-8 rounded-lg" style={{
                                    background: `repeating-linear-gradient(
                                        45deg,
                                        #d1d5db,
                                        #d1d5db 4px,
                                        #b8bcc4 4px,
                                        #b8bcc4 5px
                                    )`
                                }} />
                                <span className="text-[16px]">Expiring in 30 days (2)</span>
                            </div>
                            <div className="flex items-center gap-3 ml-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-lg" />
                                <span className="text-[16px]">Not expiring soon (5)</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[16px] font-bold mb-3">Uninsured (3)</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 ml-3">
                                <div className="w-8 h-8 rounded-lg" style={{
                                    background: `repeating-linear-gradient(
                                        45deg,
                                        #6b7280,
                                        #6b7280 4px,
                                        #505559 4px,
                                        #505559 5px
                                    )`
                                }} />
                                <span className="text-[16px]">Not Notified (1)</span>
                            </div>
                            <div className="flex items-center gap-3 ml-3">
                                <div className="w-8 h-8 bg-gray-500 rounded-lg" />
                                <span className="text-[16px]">Notified (2)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RentersInsuranceCard;