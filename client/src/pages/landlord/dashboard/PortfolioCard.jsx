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
            return {
                listed: 0,
                occupied: 0,
            };
        }

        // Listed = all listings (ACTIVE status)
        const listed = listings.filter(l => l.status === 'ACTIVE').length || 0;
        
        // Occupied = rented properties (RENTED status) 
        const occupied = listings.filter(l => l.status === 'RENTED').length || 0;

        return {
            listed: Number(listed) || 0,
            occupied: Number(occupied) || 0,
        };
    }, [listings]);

    const totalListed = chartData.listed;
    const totalOccupied = chartData.occupied;
    const totalProperties = totalListed + totalOccupied;
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
                        <span className="text-[15px] font-semibold">Listed ({totalListed})</span>
                        <svg className="ml-1.5" width="10" height="10" viewBox="0 0 12 12">
                            <polygon points="6,0 12,12 0,12" fill="#374151" />
                        </svg>
                    </div>
                    <div className="flex items-center" style={{ marginLeft: `${totalListed > 0 && totalOccupied > 0 ? (totalListed / (totalListed + totalOccupied)) * 100 : 50}%` }}>
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
                    {/* Listed (Vacant) */}
                    {chartData.listed > 0 && (
                        <div 
                            className="bg-gray-600 h-full flex items-center justify-center text-white text-xs font-semibold transition-all"
                            style={{ width: `${(chartData.listed / totalProperties) * 100}%` }}
                            title={`Listed: ${chartData.listed}`}
                        >
                            {chartData.listed}
                        </div>
                    )}
                    
                    {/* Occupied (Rented) */}
                    {chartData.occupied > 0 && (
                        <div 
                            className="bg-gray-300 h-full flex items-center justify-center text-gray-700 text-xs font-semibold transition-all"
                            style={{ width: `${(chartData.occupied / totalProperties) * 100}%` }}
                            title={`Occupied: ${chartData.occupied}`}
                        >
                            {chartData.occupied}
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {/* Listed Section */}
                <div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gray-600 rounded"></div>
                        <span className="font-semibold">Listed ({chartData.listed})</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4.5">Available listings</p>
                </div>

                {/* Occupied Section */}
                <div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <span className="font-semibold">Occupied ({chartData.occupied})</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4.5">Rented properties</p>
                </div>
            </div>
        </div>
    );
};

export default PortfolioCard;

