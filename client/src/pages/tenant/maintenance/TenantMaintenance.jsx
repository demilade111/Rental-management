import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Mic } from "lucide-react";
import {
  maintenanceApi,
  MAINTENANCE_STATUS,
  MAINTENANCE_PRIORITY,
  getStatusDisplayName,
} from "@/lib/maintenanceApi";
import { useAuthStore } from "@/store/authStore";
import axios from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import {
  MaintenanceFilters,
  MaintenanceColumn,
} from "@/pages/landlord/maintenance";
import TenantMaintenanceForm from "./TenantMaintenanceForm";

function TenanceMaintenance() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filters] = useState({
    status: "",
    priority: "",
    category: "",
    listingId: "",
  });

  const { token, user } = useAuthStore();
  useEffect(() => {
    const fetchTenantProperties = async () => {
      try {
        const res = await axios.get("/api/v1/leases");
        const leases = res.data.data || [];
        const tenantListings = leases
          .map((lease) => lease.listing)
          .filter(Boolean);
        setProperties(tenantListings);
      } catch (err) {
        console.error("Error fetching tenant listings:", err);
      }
    };

    if (token) fetchTenantProperties();
  }, [token]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await maintenanceApi.getAllRequests(filters);
        setMaintenanceRequests(data.data || data);
      } catch (err) {
        console.error("Error fetching tenant maintenance requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token, filters]);

  const getRequestsByStatus = (status) =>
    maintenanceRequests.filter((r) => r.status === status);

  const getFilteredRequests = (requests) =>
    !search
      ? requests
      : requests.filter(
          (r) =>
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase())
        );

  const columns = [
    {
      title: getStatusDisplayName(MAINTENANCE_STATUS.OPEN),
      status: MAINTENANCE_STATUS.OPEN,
    },
    {
      title: getStatusDisplayName(MAINTENANCE_STATUS.IN_PROGRESS),
      status: MAINTENANCE_STATUS.IN_PROGRESS,
    },
    {
      title: getStatusDisplayName(MAINTENANCE_STATUS.COMPLETED),
      status: MAINTENANCE_STATUS.COMPLETED,
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-6">
      <h1 className="text-2xl font-bold">My Maintenance Requests</h1>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <MaintenanceFilters
            search={search}
            onSearchChange={setSearch}
            onFilterClick={(f) => console.log("Filter clicked:", f)}
          />
        </div>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-white-100 text-black border border-gray-300 hover:bg-gray-50 w-44 h-12 rounded-2xl p-1"
        >
          <Plus className="size-4 w-7 h-7 bg-black text-white rounded-full p-1" />{" "}
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const requests = getFilteredRequests(getRequestsByStatus(col.status));
          return (
            <MaintenanceColumn
              key={col.title}
              title={col.title}
              requests={requests}
              loading={loading}
              actions={[]}
              onActionClick={() => {}}
            />
          );
        })}
      </div>

      {/* Modal for New Request */}
      {showModal && (
        <TenantMaintenanceForm
          user={user}
          properties={properties}
          onClose={() => setShowModal(false)}
          onRequestCreated={async () => {
            const updated = await maintenanceApi.getAllRequests(filters);
            setMaintenanceRequests(updated.data || updated);
          }}
        />
      )}
    </div>
  );
}

export default TenanceMaintenance;
