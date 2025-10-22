import React, { useState } from 'react';
import { Search, Plus, SlidersHorizontal, Home, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const PropertyPortfolio = () => {
  const [activeTab, setActiveTab] = useState('rentals');
  const [searchQuery, setSearchQuery] = useState('');

  const properties = [
    {
      id: 1,
      name: 'The Summit',
      address: '1253 Jervis St, Vancouver',
      postal: 'V6Y 3T4',
      rent: '$2,000 / Month',
      deposit: '$1,000',
      petDeposit: '$1,000',
      type: 'Residential: Condo',
      size: '800 sq ft',
      bedrooms: 3,
      bathrooms: 1,
      status: 'Listed',
      availability: 'Vacant'
    },
    {
      id: 2,
      name: 'Cafe',
      address: '1600 Jervis St, Vancouver',
      postal: 'V6Y 3T4',
      rent: '$2,000 / Month',
      deposit: '$1,000',
      petDeposit: null,
      type: 'Commercial: Retail',
      size: '1600 sq ft',
      bedrooms: null,
      bathrooms: null,
      status: 'Listed',
      availability: 'Vacant'
    },
    {
      id: 3,
      name: 'The Summit',
      address: '1253 Jervis St, Vancouver',
      postal: 'V6Y 3T4',
      rent: '$2,000 / Month',
      deposit: '$1,000',
      petDeposit: '$1,000',
      type: 'Residential: Condo',
      size: '800 sq ft',
      bedrooms: 3,
      bathrooms: 1,
      status: 'Unlisted',
      availability: 'Vacant'
    },
    {
      id: 4,
      name: 'The Summit',
      address: '1253 Jervis St, Vancouver',
      postal: 'V6Y 3T4',
      rent: '$2,000 / Month',
      deposit: '$1,000',
      petDeposit: '$1,000',
      type: 'Residential: Condo',
      size: '800 sq ft',
      bedrooms: 3,
      bathrooms: 1,
      status: 'Unlisted',
      availability: 'Vacant'
    },
    {
      id: 5,
      name: 'The Summit',
      address: '1253 Jervis St, Vancouver',
      postal: 'V6Y 3T4',
      rent: '$2,000 / Month',
      deposit: '$1,000',
      petDeposit: '$1,000',
      type: 'Residential: Condo',
      size: '800 sq ft',
      bedrooms: 3,
      bathrooms: 1,
      status: 'Listed',
      availability: 'Vacant'
    }
  ];

  const filteredProperties = properties.filter(prop =>
    prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[32px] font-bold mb-1">Portfolio</h1>
        <p className="text-[16px] text-gray-600">Per Property</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <div className='bg-gray-200 rounded-lg border-2 border-gray-200'>
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'rentals'
              ? 'bg-white text-black'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            Rentals
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'listings'
              ? 'bg-white text-black'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            Listings
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6">
        <div className="relative flex gap-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50/10 border-gray-300"
          />
          <Button variant="outline" size="icon" className="border-gray-200">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-3">
          <Button className="bg-black text-white hover:bg-gray-800 flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            New Listing
          </Button>
        </div>
      </div>

      {/* Property List */}
      <div className="space-y-4">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="p-0 border border-gray-300 hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Property Image */}
              <div className="w-full md:w-48 h-32 bg-gray-100 flex-shrink-0">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Home className="w-12 h-12 text-gray-400" />
                </div>
              </div>

              {/* Property Details - Row Layout */}
              <div className="flex-1 flex flex-col md:flex-row items-start md:items-center p-4 gap-4">
                {/* Name and Address */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1">{property.name}</h3>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  <p className="text-sm text-gray-600">{property.postal}</p>
                </div>

                {/* Financial Info with Icon */}
                <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 md:justify-center">
                  <div className="w-10 h-10 mx-4 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm whitespace-nowrap"><span className="font-bold">Rent:</span> {property.rent}</p>
                    <p className="text-sm whitespace-nowrap"><span className="font-bold">Deposit:</span> {property.deposit}</p>
                    {property.petDeposit && (
                      <p className="text-sm whitespace-nowrap"><span className="font-bold">Pet Deposit:</span> {property.petDeposit}</p>
                    )}
                  </div>
                </div>

                {/* Property Type with Icon */}
                <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 md:justify-center">
                  <div className="w-10 h-10 mx-4 flex items-center justify-center flex-shrink-0">
                    <Home className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold whitespace-nowrap">{property.type}</p>
                    <p className="text-sm whitespace-nowrap"><span className="font-bold">Size:</span> {property.size}</p>
                    {property.bedrooms && (
                      <p className="text-sm whitespace-nowrap">{property.bedrooms} Bedroom | {property.bathrooms} Bath</p>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex flex-row md:flex-col gap-3 md:gap-2 md:justify-center">
                  <div className="flex items-center mx-4 gap-2 text-sm whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-black flex-shrink-0"></div>
                    <span>{property.status}</span>
                  </div>
                  <div className="flex items-center mx-4 gap-2 text-sm whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full border border-black flex-shrink-0"></div>
                    <span>{property.availability}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertyPortfolio;