import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import LeaseCard from "./LeaseCard";
import LeaseTabs from "./LeaseTabs";
import PageHeader from "@/components/shared/PageHeader";
import CreateLeaseModal from "./lease-modal/CreateLeaseModal";
import LeaseSearchBar from "./LeaseSearchBar";

import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";

import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";

export default function LeasesPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState(["Long term"]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // react-query fetch
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

  return (
    <div className="min-h-screen px-4 md:px-8 py-4">
      <PageHeader title="Leases" subtitle="Per property" />

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

      {/* Loading */}
      {isLoading && <LoadingState message="Loading leases..." />}

      {/* Error */}
      {isError && <ErrorState message={error.message} />}

      {/* Empty */}
      {!isLoading && !isError && filteredLeases.length === 0 && (
        <EmptyState message="No leases found." />
      )}

      {/* List */}
      {!isLoading && !isError && filteredLeases.length > 0 && (
        <div className="mt-6 space-y-4">
          {filteredLeases.map((lease) => (
            <LeaseCard key={lease.id} lease={lease} />
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateLeaseModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
