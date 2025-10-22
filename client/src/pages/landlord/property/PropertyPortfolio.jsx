import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import PropertyTabs from './PropertyTabs';
import PropertySearchBar from './PropertySearchBar';
import PropertyList from './PropertyList';
import LoadingState from '../../../components/shared/LoadingState';
import ErrorState from '../../../components/shared/ErrorState';
import EmptyState from '../../../components/shared/EmptyState';

const PropertyPortfolio = () => {
  const [activeTab, setActiveTab] = useState('rentals');
  const [searchQuery, setSearchQuery] = useState('');
  const token = useAuthStore((state) => state.token);

  const { data: properties = [], isLoading, isError, error } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/listings`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch listings');
      }
      const result = await response.json();
      return result.data || result;
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
      <PropertySearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {isLoading && <LoadingState message="Loading properties..." />}
      {isError && <ErrorState message={error.message} />}
      {!isLoading && !isError && filteredProperties.length === 0 && <EmptyState message="No properties available" />}
      {!isLoading && !isError && filteredProperties.length > 0 && (
        <PropertyList properties={filteredProperties} />
      )}
    </div>
  );
};

export default PropertyPortfolio;
