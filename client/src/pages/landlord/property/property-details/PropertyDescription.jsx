import React from 'react';

const PropertyDescription = ({ description }) => {
    return (
        <div className="p-6">
            <h2 className="text-[20px] font-bold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed text-[16px]">{description}</p>
        </div>
    );
};

export default PropertyDescription;