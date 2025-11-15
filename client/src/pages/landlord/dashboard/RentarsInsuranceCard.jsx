import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { getAllInsurances } from '@/services/insuranceService';
import { differenceInDays } from 'date-fns';
import LoadingState from '@/components/shared/LoadingState';

const RentersInsuranceCard = () => {
    // Fetch all insurance records
    const { data: insuranceData = {}, isLoading, isFetched } = useQuery({
        queryKey: ['insurances-dashboard'],
        queryFn: async () => {
            const data = await getAllInsurances();
            return data;
        },
    });

    const insurances = insuranceData.insurances || [];

    // Calculate insurance statistics
    const stats = useMemo(() => {
        if (!insurances.length) {
            return {
                expiringInThirty: 0,
                notExpiring: 0,
                notNotified: 0,
                notified: 0,
                totalInsured: 0,
                totalUninsured: 0,
            };
        }

        const now = new Date();
        
        // Filter insured (VERIFIED status)
        const insured = insurances.filter(ins => ins.status === 'VERIFIED');
        
        // Calculate expiring in 30 days
        const expiringInThirty = insured.filter(ins => {
            if (!ins.expiryDate) return false;
            const expiryDate = new Date(ins.expiryDate);
            const daysUntilExpiry = differenceInDays(expiryDate, now);
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        }).length;

        // Calculate not expiring soon (more than 30 days or no expiry date)
        const notExpiring = insured.filter(ins => {
            if (!ins.expiryDate) return true;
            const expiryDate = new Date(ins.expiryDate);
            const daysUntilExpiry = differenceInDays(expiryDate, now);
            return daysUntilExpiry > 30;
        }).length;

        // Filter uninsured (PENDING or REJECTED status, or no insurance at all)
        // For now, we'll count PENDING as "notified" and REJECTED as "notified" 
        // (assuming landlord has already interacted with them)
        const pending = insurances.filter(ins => ins.status === 'PENDING').length;
        const rejected = insurances.filter(ins => ins.status === 'REJECTED').length;
        
        // For simplicity, we'll treat PENDING as "notified" (landlord can see it)
        // and REJECTED as "notified" (landlord has already rejected it)
        // If there are no insurance records for a tenant, we can't track them here
        // So "notNotified" would be tenants without any insurance record (hard to track)
        // For now, let's assume all uninsured tenants with records are "notified"
        const totalUninsured = pending + rejected;
        
        // Since we can't easily track tenants without insurance records from this data,
        // we'll simplify: PENDING = not notified yet (in practice, landlord hasn't verified)
        // REJECTED = notified (landlord has rejected)
        // But actually, if there's a record with PENDING, the landlord can see it, so it's "notified"
        // Let's simplify further: PENDING = waiting for landlord review, REJECTED = already handled
        const notified = rejected;
        const notNotified = pending;

        return {
            expiringInThirty,
            notExpiring,
            notNotified,
            notified,
            totalInsured: insured.length,
            totalUninsured,
        };
    }, [insurances]);

    // Ensure chart always has data (use placeholder if no data)
    const hasData = stats.totalInsured > 0 || stats.totalUninsured > 0;
    const chartData = [
        {
            category: "insurance",
            expiringInThirty: stats.expiringInThirty || (hasData ? 0 : 1),
            notExpiring: stats.notExpiring || (hasData ? 0 : 1),
            notNotified: stats.notNotified || (hasData ? 0 : 1),
            notified: stats.notified || (hasData ? 0 : 1)
        }
    ];

    // Don't show loading indicator on first load
    const showLoading = isLoading && isFetched;

    // Calculate max domain for chart (if no data, show placeholder minimum height)
    const maxValue = hasData 
        ? Math.max(stats.expiringInThirty, stats.notExpiring, stats.notNotified, stats.notified, 1)
        : 4; // Placeholder value to show empty bars

    return (
        <div className="bg-card rounded-lg border border-gray-400 p-5 md:p-6 h-full flex flex-col overflow-hidden min-h-[350px]">
            <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold mb-2">Renters Insurance</h2>
            {showLoading ? (
                <div className="flex items-center gap-6 lg:gap-10 flex-1">
                    <div className="w-20 sm:w-24 lg:w-32 h-56 flex-shrink-0 p-0 -ml-2">
                        <div className="w-full h-full bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-6">
                        <LoadingState message="Loading insurance data..." compact={true} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-6 lg:gap-10 flex-1">
                    <div className="w-20 sm:w-24 lg:w-32 h-56 flex-shrink-0 p-0 -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <XAxis type="category" dataKey="category" hide />
                                <YAxis type="number" hide domain={[0, maxValue]} />
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
                                <Bar 
                                    dataKey="notified" 
                                    stackId="a" 
                                    radius={[0, 0, 10, 10]} 
                                    fill={hasData ? "#6b7280" : "#e5e7eb"} 
                                />
                                <Bar 
                                    dataKey="notNotified" 
                                    stackId="a" 
                                    fill={hasData ? "url(#patternDark)" : "#e5e7eb"} 
                                />
                                <Bar 
                                    dataKey="notExpiring" 
                                    stackId="a" 
                                    fill={hasData ? "#d1d5db" : "#e5e7eb"} 
                                />
                                <Bar 
                                    dataKey="expiringInThirty" 
                                    stackId="a" 
                                    radius={[10, 10, 0, 0]} 
                                    fill={hasData ? "url(#patternLight)" : "#e5e7eb"} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <h3 className="text-[17px] font-bold mb-3">Insured ({stats.totalInsured})</h3>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-3.5 ml-3">
                                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{
                                        background: hasData 
                                            ? `repeating-linear-gradient(
                                                45deg,
                                                #d1d5db,
                                                #d1d5db 4px,
                                                #b8bcc4 4px,
                                                #b8bcc4 5px
                                            )`
                                            : '#e5e7eb'
                                    }} />
                                    <span className="text-[17px]">Expiring in 30 days ({stats.expiringInThirty})</span>
                                </div>
                                <div className="flex items-center gap-3.5 ml-3">
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${hasData ? 'bg-gray-300' : 'bg-gray-200'}`} />
                                    <span className="text-[17px]">Not expiring soon ({stats.notExpiring})</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[17px] font-bold mb-3">Uninsured ({stats.totalUninsured})</h3>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-3.5 ml-3">
                                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{
                                        background: hasData
                                            ? `repeating-linear-gradient(
                                                45deg,
                                                #6b7280,
                                                #6b7280 4px,
                                                #505559 4px,
                                                #505559 5px
                                            )`
                                            : '#e5e7eb'
                                    }} />
                                    <span className="text-[17px]">Pending ({stats.notNotified})</span>
                                </div>
                                <div className="flex items-center gap-3.5 ml-3">
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${hasData ? 'bg-gray-500' : 'bg-gray-300'}`} />
                                    <span className="text-[17px]">Rejected ({stats.notified})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RentersInsuranceCard;