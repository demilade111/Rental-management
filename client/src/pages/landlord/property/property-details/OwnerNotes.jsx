import React from 'react';

const OwnerNotes = ({ notes }) => {
    const cards = [
        {
            title: 'Listing Details',
            subtitle: 'Per Property',
            description: 'View your listing details from rental info to amenities',
            isActive: true
        },
        {
            title: 'Maintenance Info',
            subtitle: 'Per Property',
            description: 'Monitor occupancy, tenant turnover, and lease duration at a glance',
            isActive: false
        },
        {
            title: 'Tenancy Info',
            subtitle: 'Per Property',
            description: 'Monitor occupancy, current tenant info, tenant turnover, and lease duration at a glance',
            isActive: false
        }
    ];

    return (
        <div className="mt-8 p-6">
            <h2 className="text-[32px] font-bold mb-2">Owner Notes (Private Section)</h2>
            <p className="text-[16px] text-gray-600 mb-6">{ notes }</p>
            <p className="text-[16px] text-gray-700 mb-6">
                Here you can review your property's tenancy history and maintenance history; these details are private and will not be shared with applicants or tenants when the listing is published.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                            card.isActive
                                ? 'bg-black text-white'
                                : 'bg-white border border-gray-200'
                        }`}
                    >
                        <h3 className="text-[28px] font-bold mb-1">{card.title}</h3>
                        <p className={`text-[16px] mb-3 ${card.isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                            {card.subtitle}
                        </p>
                        <p className={`text-[13px] ${card.isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                            {card.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OwnerNotes;