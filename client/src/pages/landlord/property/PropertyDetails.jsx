import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import PropertyHeader from './property-details/PropertyHeader';
import PropertyImages from './property-details/PropertyImages';
import PropertyDescription from './property-details/PropertyDescription';
import RentalInformation from './property-details/RentalInformation';
import PropertyDetailsCard from './property-details/PropertyDetailsCard';
import PropertyAmenities from './property-details/PropertyAmenities';
import ContactInfo from './property-details/ContactInfo';
import AddressCard from './property-details/AddressCard';
import NeighbourhoodScore from './property-details/NeighbourhoodScore';
import OwnerNotes from './property-details/OwnerNotes';

// Mock property data
const mockProperty = {
    id: '1',
    name: 'Villa Cardelo',
    address: '302-1580 Haro St Vancouver, BC',
    fullAddress: '302-1580 Haro St Vancouver V6Y 3T4 BC, Canada',
    description: "Stands as West Vancouver's newest and tallest residential landmark, Residence offers a stunning Mountain, Park, and unobstructed Ocean views of the ocean, city, and mountains. The expansive 345 sq ft. Inside...",
    term: 'Long Term',
    rent: '$ 3,000 / Month',
    available: '01 October 2025',
    deposit: '$ 1,500',
    type: 'Condo',
    yearBuilt: '2008',
    size: '955 sq ft',
    bedrooms: '2',
    bathrooms: '1',
    ownerName: 'Dante Yilmaz',
    ownerPhone: '+1 222-333-4455',
    ownerEmail: 'danteyilmaz@gmail.com',
    images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
    ]
};

const PropertyDetails = () => {
    const [property] = useState(mockProperty);

    return (
        <div className="min-h-screen bg-white">
            <PropertyHeader property={property} />

            <div className="px-4 md:px-8 py-2">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Force the image container to be half of the screen height */}
                        <div className="h-[50vh]">
                            <PropertyImages images={property.images} />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:gap-6">
                            <div className="sm:flex-1">
                                <RentalInformation
                                    term={property.term}
                                    rent={property.rent}
                                    available={property.available}
                                    deposit={property.deposit}
                                />
                            </div>
                            <div className="sm:flex-1">
                                <PropertyDetailsCard
                                    type={property.type}
                                    yearBuilt={property.yearBuilt}
                                    size={property.size}
                                    bedrooms={property.bedrooms}
                                    bathrooms={property.bathrooms}
                                />
                            </div>
                        </div>

                        <PropertyAmenities />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Make this section the same height as the image section */}
                        <div className="h-[50vh] flex flex-col justify-between">
                            <div className="flex-1 overflow-auto">
                                <PropertyDescription description={property.description} />
                            </div>
                            <div className="mt-4">
                                <ContactInfo
                                    ownerName={property.ownerName}
                                    ownerPhone={property.ownerPhone}
                                    ownerEmail={property.ownerEmail}
                                />
                            </div>
                        </div>

                        <AddressCard fullAddress={property.fullAddress} />
                        <NeighbourhoodScore />
                    </div>
                </div>
                
                <OwnerNotes />
            </div>
        </div>
    );
};

export default PropertyDetails;