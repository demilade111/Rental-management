import React from 'react';
import { Check, X } from 'lucide-react';

const PropertyAmenities = ({ amenities = [] }) => {
    
    return (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[24px] font-bold">Amenities</h2>
                <button className="text-sm text-gray-600 hover:text-black">Read All</button>
            </div>

            {amenities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {amenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-white bg-black rounded-full" />
                            <span className="capitalize text-black">{amenity.name}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-sm">No amenities listed.</p>
            )}
        </div>
    );
};

export default PropertyAmenities;