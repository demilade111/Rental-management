import React from 'react';

const PropertyDetailsCard = ({ type, yearBuilt, size, bedrooms, bathrooms }) => {
    return (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
            <h2 className="text-[24px] font-bold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 gap-2">
                <div>
                    <p className="text-[16px] text-gray-600">
                        <span className='font-semibold'>Residential</span>: {type}
                    </p>
                </div>
                <div>
                    <p className="text-[16px] text-gray-600">
                        <span className='font-semibold'>Year Build</span>: {yearBuilt}
                    </p>
                </div>
                <div>
                    <p className="text-[16px] text-gray-600">
                        <span className='font-semibold'>Size</span>: {size}
                    </p>
                </div>
                <div>
                    <p className="text-[16px] text-gray-600">
                        {bedrooms} Bedroom | {bathrooms} Bathroom
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsCard;