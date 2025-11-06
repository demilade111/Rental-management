import React, { useMemo, useState } from 'react';
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
import PageHeader from '@/components/shared/PageHeader';
import { Checkbox } from '@/components/ui/checkbox';
import Pagination from '@/components/shared/Pagination';
import BulkDeleteActionBar from '@/components/shared/BulkDeleteActionBar';
import { toast } from 'sonner';

const PropertyPortfolio = () => {
  const [activeTab, setActiveTab] = useState("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  const {
    data: properties = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["listings", user?.id],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.LISTINGS.BASE);
      const data = response.data;
      return Array.isArray(data) ? data : data.listing || data.data || [];
    },
  });

  const filteredProperties = properties.filter((prop) => {
    const q = searchQuery.toLowerCase();

    // Filter by search query
    const matchesSearch =
      prop.name?.toLowerCase().includes(q) ||
      prop.title?.toLowerCase().includes(q) ||
      prop.address?.toLowerCase().includes(q) ||
      prop.location?.toLowerCase().includes(q) ||
      prop.propertyName?.toLowerCase().includes(q);

    // Filter by status based on activeTab
    let matchesStatus = true;
    if (activeTab === "listings") {
      matchesStatus = prop.status === "ACTIVE"; // Default listings
    } else if (activeTab === "rentals") {
      matchesStatus = prop.status === "RENTED"; // Rentals tab
    }

    return matchesSearch && matchesStatus;
  });


  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const displayTotal = filteredProperties.length;
  const displayTotalPages = Math.max(1, Math.ceil(displayTotal / limit));
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProperties.slice(start, start + limit);
  }, [filteredProperties, page, limit]);

  // Selection / Bulk delete
  const [selectedItems, setSelectedItems] = useState(new Set());
  const onSelectionChange = (id, checked) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(paginated.map((p) => p.id)));
    } else {
      setSelectedItems(new Set());
    }
  };
  const allSelected = paginated.length > 0 && paginated.every((p) => selectedItems.has(p.id));
  const someSelected = !allSelected && paginated.some((p) => selectedItems.has(p.id));

  const handleBulkDelete = async (idsParam) => {
    const ids = Array.isArray(idsParam) && idsParam.length > 0 ? idsParam : Array.from(selectedItems);
    if (ids.length === 0) return;
    try {
      for (const id of ids) {
        await api.delete(API_ENDPOINTS.LISTINGS.BY_ID(id));
      }
      toast.success('Listings deleted');
      setSelectedItems(new Set());
    } catch (e) {
      toast.error('Failed to delete listings');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
      <div className="flex-shrink-0">
        <PageHeader title="Portfolio" subtitle="Per Property" total={displayTotal} />

        <PropertyTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <PropertySearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewListing={() => setIsModalOpen(true)}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading && <LoadingState message="Loading properties..." />}
        {isError && <ErrorState message={error.message} />}
        {!isLoading && !isError && filteredProperties.length === 0 && (
          <EmptyState message="No properties available" />
        )}
        {!isLoading && !isError && filteredProperties.length > 0 && (
          <>
            {/* Header row for select all */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 flex items-center justify-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    className="!border-black"
                  />
                </div>
                <span className="text-sm text-gray-700">Select all</span>
              </div>
            </div>

            <PropertyList
              properties={paginated}
              selectedItems={selectedItems}
              onSelectionChange={onSelectionChange}
            />
          </>
        )}
      </div>

      <div className="flex-shrink-0 mt-4">
        <Pagination
          page={page}
          totalPages={displayTotalPages}
          totalItems={displayTotal}
          onPageChange={setPage}
        />
      </div>

      <BulkDeleteActionBar
        selectedItems={Array.from(selectedItems)}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedItems(new Set())}
        resourceName="listings"
        isDeleting={false}
        confirmMessage="Delete selected listings? This cannot be undone."
      />

      <NewListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PropertyPortfolio;
