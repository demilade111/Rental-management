import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apiEndpoints';
import LoadingState from '@/components/shared/LoadingState';

const PortfolioCard = () => {
    // Fetch all listings
    const { data: listings = [], isLoading } = useQuery({
        queryKey: ['listings-dashboard'],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.LISTINGS.BASE);
            const data = response.data;
            return Array.isArray(data) ? data : data.listing || data.data || [];
        },
    });

    const chartData = useMemo(() => {
        if (!listings || !Array.isArray(listings) || listings.length === 0) {
            return [{
                category: "portfolio",
                vacantListed: 0,
                vacantUnlisted: 0,
                occupiedListed: 0,
                occupiedUnlisted: 0,
            }];
        }

        // Categorize properties
        const vacant = listings.filter(l => l.status === 'ACTIVE');
        const occupied = listings.filter(l => l.status === 'RENTED');

        // For now, we'll consider all vacant as listed and occupied as listed
        // You can add more sophisticated logic later
        const vacantListed = vacant.length || 0;
        const vacantUnlisted = 0; // Can be updated based on your business logic
        const occupiedListed = occupied.length || 0;
        const occupiedUnlisted = 0; // Can be updated based on your business logic

        return [{
            category: "portfolio",
            vacantListed: Number(vacantListed) || 0,
            vacantUnlisted: Number(vacantUnlisted) || 0,
            occupiedListed: Number(occupiedListed) || 0,
            occupiedUnlisted: Number(occupiedUnlisted) || 0,
        }];
    }, [listings]);

    const totalVacant = Number(chartData[0]?.vacantListed || 0) + Number(chartData[0]?.vacantUnlisted || 0);
    const totalOccupied = Number(chartData[0]?.occupiedListed || 0) + Number(chartData[0]?.occupiedUnlisted || 0);
    const totalProperties = totalVacant + totalOccupied;
    const hasData = !isLoading && totalProperties > 0;

    if (isLoading) {
        return (
            <div className="bg-card rounded-lg border border-gray-400 p-5 md:p-6 h-full">
                <h2 className="text-xl md:text-2xl lg:text-[30px] font-bold mb-3">Portfolio</h2>
                <LoadingState message="Loading portfolio..." compact={true} />
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="bg-card rounded-lg border border-gray-400 p-5 md:p-6 h-full">
                <h2 className="text-xl md:text-2xl lg:text-[30px] font-bold mb-3">Portfolio</h2>
                <div className="text-center py-4 text-gray-500">
                    No properties in portfolio
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg border border-gray-400 p-5 md:p-6 h-full">
            <h2 className="text-xl md:text-2xl lg:text-[30px] font-bold mb-3">Portfolio</h2>
            
            {/* Category Labels with Markers */}
            <div className="relative mb-3">
                <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                        <span className="text-[15px] font-semibold">Vacant ({totalVacant})</span>
                        <svg className="ml-1.5" width="10" height="10" viewBox="0 0 12 12">
                            <polygon points="6,0 12,12 0,12" fill="#374151" />
                        </svg>
                    </div>
                    <div className="flex items-center" style={{ marginLeft: `${totalVacant > 0 && totalOccupied > 0 ? (totalVacant / (totalVacant + totalOccupied)) * 100 : 50}%` }}>
                        <svg className="mr-1.5" width="10" height="10" viewBox="0 0 12 12">
                            <polygon points="6,0 12,12 0,12" fill="#374151" />
                        </svg>
                        <span className="text-[15px] font-semibold">Occupied ({totalOccupied})</span>
                    </div>
                </div>
            </div>

            {/* Stacked Bar Chart - CSS Based */}
            <div className="h-10 mb-4 flex items-center">
                <div className="w-full h-8 flex rounded-full overflow-hidden bg-gray-100">
                    {/* Vacant Listed */}
                    {chartData[0].vacantListed > 0 && (
                        <div 
                            className="bg-gray-600 h-full flex items-center justify-center text-white text-xs font-semibold transition-all"
                            style={{ width: `${(chartData[0].vacantListed / totalProperties) * 100}%` }}
                            title={`Vacant Listed: ${chartData[0].vacantListed}`}
                        />
                    )}
                    
                    {/* Vacant Unlisted */}
                    {chartData[0].vacantUnlisted > 0 && (
                        <div 
                            className="h-full flex items-center justify-center text-white text-xs font-semibold transition-all"
                            style={{ 
                                width: `${(chartData[0].vacantUnlisted / totalProperties) * 100}%`,
                                background: 'repeating-linear-gradient(45deg, #6b7280, #6b7280 10px, #4b5563 10px, #4b5563 20px)'
                            }}
                            title={`Vacant Unlisted: ${chartData[0].vacantUnlisted}`}
                        />
                    )}
                    
                    {/* Occupied Listed */}
                    {chartData[0].occupiedListed > 0 && (
                        <div 
                            className="bg-gray-300 h-full flex items-center justify-center text-gray-700 text-xs font-semibold transition-all"
                            style={{ width: `${(chartData[0].occupiedListed / totalProperties) * 100}%` }}
                            title={`Occupied Listed: ${chartData[0].occupiedListed}`}
                        />
                    )}
                    
                    {/* Occupied Unlisted */}
                    {chartData[0].occupiedUnlisted > 0 && (
                        <div 
                            className="h-full flex items-center justify-center text-gray-700 text-xs font-semibold transition-all"
                            style={{ 
                                width: `${(chartData[0].occupiedUnlisted / totalProperties) * 100}%`,
                                background: 'repeating-linear-gradient(45deg, #d1d5db, #d1d5db 10px, #b8bcc4 10px, #b8bcc4 20px)'
                            }}
                            title={`Occupied Unlisted: ${chartData[0].occupiedUnlisted}`}
                        />
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {/* Vacant Section */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-3 h-3 bg-gray-600 rounded"></div>
                        <span className="font-semibold">Listed ({chartData[0]?.vacantListed || 0})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div 
                            className="w-3 h-3 rounded" 
                            style={{ background: 'repeating-linear-gradient(45deg, #6b7280, #6b7280 2px, #4b5563 2px, #4b5563 4px)' }}
                        />
                        <span className="font-semibold">Unlisted ({chartData[0]?.vacantUnlisted || 0})</span>
                    </div>
                </div>

                {/* Occupied Section */}
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <span className="font-semibold">Listed ({chartData[0]?.occupiedListed || 0})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div 
                            className="w-3 h-3 rounded" 
                            style={{ background: 'repeating-linear-gradient(45deg, #d1d5db, #d1d5db 2px, #b8bcc4 2px, #b8bcc4 4px)' }}
                        />
                        <span className="font-semibold">Unlisted ({chartData[0]?.occupiedUnlisted || 0})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioCard;

