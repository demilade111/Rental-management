import React from 'react';
import { Check, X } from 'lucide-react';

const PropertyAmenities = () => {
    const amenities = [
        { name: 'Air Conditioning', available: true },
        { name: 'Heating', available: false },
        { name: 'Pet Friendly', available: true },
        { name: 'Parking', available: true },
        { name: 'Laundry In-Unit', available: false },
        { name: 'Cat Friendly', available: true },
        { name: 'Dishwasher', available: false },
        { name: 'Laundry In Building', available: false },
        { name: 'Dog Friendly', available: false },
    ];

    return (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[24px] font-bold">Amenities</h2>
                <button className="text-sm text-gray-600 hover:text-black">Read All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {amenity.available ? (
                            <Check className="w-5 h-5 text-white bg-black rounded-full" />
                        ) : (
                            <X className="w-5 h-5 text-gray-300" />
                        )}
                        <span className={amenity.available ? 'text-black' : 'text-gray-400'}>
                            {amenity.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyAmenities;