import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import LeaseCard from "./LeaseCard";
import LeaseTabs from "./LeaseTabs";
import PageHeader from "@/components/shared/PageHeader";
import CreateLeaseModal from "./lease-modal/CreateLeaseModal";
import LeaseSearchBar from "./LeaseSearchBar";
import CustomLeases from "./CustomLeases";

import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";

import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";

export default function LeasesPage() {
  const [activeTab, setActiveTab] = useState("standard"); // Changed default to "standard"
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState(["Long term"]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customLeasesTotal, setCustomLeasesTotal] = useState(0);

  // react-query fetch - only fetch when on standard tab
  const {
    data: leases = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leases"],
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.LEASES.BASE);
      const data = res.data;
      return Array.isArray(data) ? data : data.data || [];
    },
    enabled: activeTab === "standard", // Only fetch when on standard tab
  });

  // chip removal
  const removeChip = (label) =>
    setChips((prev) => prev.filter((c) => c !== label));

  // Filtering logic
  const filteredLeases = useMemo(() => {
    return leases.filter((lease) => {
      const matchTab =
        activeTab === "active"
          ? lease.status === "ACTIVE"
          : lease.status === "ENDED";

      const matchSearch =
        lease.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
        lease.propertyAddress?.toLowerCase().includes(search.toLowerCase());

      return matchTab && matchSearch;
    });
  }, [leases, activeTab, search]);

  // Show custom leases if active tab is "custom"
  if (activeTab === "custom") {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="px-4 md:px-8 py-4 flex-shrink-0">
          <PageHeader title="Leases" subtitle="Per property" total={customLeasesTotal} />
          <LeaseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {/* Custom Leases Component */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 md:px-8 pb-4">
          <CustomLeases onTotalChange={setCustomLeasesTotal} />
        </div>
      </div>
    );
  }

  // Calculate total for standard leases
  const standardLeasesTotal = filteredLeases.length;

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
      <div className="flex-shrink-0">
        <PageHeader title="Leases" subtitle="Per property" total={standardLeasesTotal} />

        {/* Tabs */}
        <LeaseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Search + New Lease */}
        <LeaseSearchBar
          search={search}
          setSearch={setSearch}
          onFilter={() => console.log("open filter drawer")}
          onNewLease={() => setShowCreateModal(true)}
          chips={chips}
          removeChip={removeChip}
        />
      </div>

      {/* Content Area - Only table content scrolls */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Loading */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <LoadingState message="Loading leases..." />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex-1 flex items-center justify-center">
            <ErrorState message={error.message} />
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filteredLeases.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState message="No leases found." />
          </div>
        )}

        {/* List - Only this scrolls */}
        {!isLoading && !isError && filteredLeases.length > 0 && (
          <div className="flex-1 overflow-y-auto min-h-0 mt-4 space-y-4 pb-4">
            {filteredLeases.map((lease) => (
              <LeaseCard key={lease.id} lease={lease} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateLeaseModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Switch to custom tab after creating a custom lease
          setActiveTab("custom");
        }}
      />
    </div>
  );
}
