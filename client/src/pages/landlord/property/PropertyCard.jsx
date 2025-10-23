import React from 'react';
import { Card } from '@/components/ui/card';
import { Home, DollarSign } from 'lucide-react';
import { getPropertyCategory, PROPERTY_CATEGORY_NAMES, PROPERTY_OPTIONS } from '@/constants/propertyTypes';

const PropertyCard = ({ property }) => {
    return (
        <Card className="p-0 border border-gray-300 hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                <div className="w-full md:w-48 h-28 bg-gray-100 flex-shrink-0">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Home className="w-12 h-12 text-gray-400" />
                    </div>
                </div>

                {/* Property Details */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center p-4 gap-4 md:gap-6">
                    {/* Name and Address */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1">{property.title}</h3>
                        <p className="text-xs text-gray-600">{property.streetAddress}</p>
                        <p className="text-xs text-gray-600">{property.zipCode}</p>
                    </div>

                    {/* Financial Info */}
                    <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 md:justify-start">
                        <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm whitespace-nowrap">
                                <span className="font-bold">Rent:</span> $ {property.rentAmount}
                            </p>
                            <p className="text-sm whitespace-nowrap">
                                <span className="font-bold">Deposit:</span> $ {property.securityDeposit}
                            </p>
                            {property.petDeposit && (
                                <p className="text-sm whitespace-nowrap">
                                    <span className="font-bold">Pet Deposit:</span> $ {property.petDeposit}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Property Type */}
                    <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 md:justify-start">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <Home className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm whitespace-nowrap">
                                <span className="font-bold">
                                    {PROPERTY_CATEGORY_NAMES[getPropertyCategory(property.propertyType)]}:{" "}
                                </span>
                                {
                                    // Find the matching label for this propertyType
                                    Object.values(PROPERTY_OPTIONS)
                                        .flat()
                                        .find((t) => t.value === property.propertyType)?.label || property.propertyType
                                }
                            </p>


                            <p className="text-sm whitespace-nowrap">
                                <span className="font-bold">Size:</span> {property.totalSquareFeet} sq ft
                            </p>
                            {property.bedrooms && (
                                <p className="text-sm whitespace-nowrap">
                                    {property.bedrooms} Bedroom | {property.bathrooms} Bath
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex flex-row md:flex-col gap-3 md:gap-2 w-full md:w-auto md:flex-1 md:justify-center">
                        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <div className="w-2 h-2 rounded-full bg-black flex-shrink-0"></div>
                            <span>listed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <div className="w-2 h-2 rounded-full border border-black flex-shrink-0"></div>
                            <span>occupied</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PropertyCard;
