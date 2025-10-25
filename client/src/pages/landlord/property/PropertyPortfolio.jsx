import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import PropertyTabs from './PropertyTabs';
import PropertySearchBar from './PropertySearchBar';
import PropertyList from './PropertyList';
import LoadingState from '../../../components/shared/LoadingState';
import ErrorState from '../../../components/shared/ErrorState';
import EmptyState from '../../../components/shared/EmptyState';
import NewListingModal from './NewListingModal';
import api from '../../../lib/axios';
import API_ENDPOINTS from '../../../lib/apiEndpoints';

const PropertyPortfolio = () => {
  const [activeTab, setActiveTab] = useState('rentals');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = useAuthStore((state) => state.token);

  const { data: properties = [], isLoading, isError, error } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.LISTINGS.BASE);
      return response.data.data || response.data;
    },
    enabled: !!token
  });

  const filteredProperties = properties.filter((prop) => {
    const q = searchQuery.toLowerCase();
    return (
      prop.name?.toLowerCase().includes(q) ||
      prop.title?.toLowerCase().includes(q) ||
      prop.address?.toLowerCase().includes(q) ||
      prop.location?.toLowerCase().includes(q) ||
      prop.propertyName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold mb-1">Portfolio</h1>
        <p className="text-[16px] text-gray-600">Per Property</p>
      </div>

      <PropertyTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <PropertySearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewListing={() => setIsModalOpen(true)}
      />

      {isLoading && <LoadingState message="Loading properties..." />}
      {isError && <ErrorState message={error.message} />}
      {!isLoading && !isError && filteredProperties.length === 0 && <EmptyState message="No properties available" />}
      {!isLoading && !isError && filteredProperties.length > 0 && (
        <PropertyList properties={filteredProperties} />
      )}

      <NewListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PropertyPortfolio;
