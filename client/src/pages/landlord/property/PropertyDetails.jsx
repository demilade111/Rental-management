import React, { useState } from 'react';
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
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apiEndpoints';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { getRentCycleLabel } from '@/constants/rentCycles';

const PropertyDetails = () => {
    const { id } = useParams();

    const { data: property, isLoading, isError, error } = useQuery({
        queryKey: ['property', id],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.LISTINGS.BY_ID(id));
            return response.data.data;
        },
    });

    console.log('Fetched property:', property);

    return (
        <div className="min-h-screen bg-white">

            {isLoading && <LoadingState message="Loading property details..." />}
            {isError && <ErrorState message={error.message} />}
            {!isLoading && !isError && !property && <EmptyState message="Property not found" />}
            {!isLoading && !isError && property && (
                <>
                    <PropertyHeader property={property} />

                    <div className="px-4 md:px-8 py-2">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Force the image container to be half of the screen height */}
                                <div className="h-[50vh]">
                                    <PropertyImages images={property.images} />
                                </div>

                                <div className="flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:gap-6">
                                    <div className="sm:flex-1">
                                        <RentalInformation
                                            term={getRentCycleLabel(property.rentCycle)}
                                            rent={property.rentAmount}
                                            available={property.availableDate}
                                            deposit={property.securityDeposit}
                                        />
                                    </div>
                                    <div className="sm:flex-1">
                                        <PropertyDetailsCard
                                            type={property.propertyType}
                                            yearBuilt={property.yearBuilt}
                                            size={property.totalSquareFeet}
                                            bedrooms={property.bedrooms}
                                            bathrooms={property.bathrooms}
                                        />
                                    </div>
                                </div>

                                <PropertyAmenities amenities={property.amenities} />
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
                                            ownerName={property.propertyOwner}
                                            ownerPhone={property.phoneNumber}
                                            ownerEmail={property.email}
                                        />
                                    </div>
                                </div>

                                <AddressCard fullAddress={property.fullAddress} />
                                <NeighbourhoodScore />
                            </div>
                        </div>

                        <OwnerNotes notes={property.notes} />
                    </div>
                </>
            )}
        </div>
    );
};

export default PropertyDetails;