import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  maintenanceApi,
  MAINTENANCE_STATUS,
  MAINTENANCE_PRIORITY,
  getStatusDisplayName,
} from "@/lib/maintenanceApi";
import axios from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import MaintenanceForm from "./MaintenanceForm";
import MaintenanceFilters from "./MaintenanceFilters";
import MaintenanceColumn from "./MaintenanceColumn";

function Maintenance() {
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

  const [formData, setFormData] = useState({
    title: "",
    listingId: "",
    category: "",
    priority: MAINTENANCE_PRIORITY.MEDIUM,
    description: "",
    image: null,
  });

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.LISTINGS.GET_ALL);
        const data = response.data;
        const listings = Array.isArray(data) ? data : data.listing || [];
        setProperties(listings);
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    };

    if (token) {
      fetchListings();
    }
  }, [token]);

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const data = await maintenanceApi.getAllRequests(filters);
        setMaintenanceRequests(data.data || data);
      } catch (err) {
        console.error("Error fetching maintenance requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceRequests();
  }, [token, filters]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.listingId ||
      !formData.category ||
      !formData.description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const requestData = {
        title: formData.title,
        listingId: formData.listingId,
        priority: formData.priority,
        category: formData.category,
        description: formData.description,
      };

      await maintenanceApi.createRequest(requestData);

      alert("Maintenance request created successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        listingId: "",
        category: "",
        priority: MAINTENANCE_PRIORITY.MEDIUM,
        description: "",
        image: null,
      });

      const updatedRequests = await maintenanceApi.getAllRequests(filters);
      setMaintenanceRequests(updatedRequests.data || updatedRequests);
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      alert(
        `Error submitting request: ${
          error.message || "Failed to create request"
        }`
      );
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await maintenanceApi.updateStatus(requestId, newStatus);

      const updatedRequests = await maintenanceApi.getAllRequests(filters);
      setMaintenanceRequests(updatedRequests.data || updatedRequests);

      alert(`Request ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Error updating request: ${error.message}`);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm("Are you sure you want to delete this maintenance request?")) {
      return;
    }

    try {
      await maintenanceApi.deleteRequest(requestId);

      const updatedRequests = await maintenanceApi.getAllRequests(filters);
      setMaintenanceRequests(updatedRequests.data || updatedRequests);

      alert("Request deleted successfully!");
    } catch (error) {
      console.error("Error deleting request:", error);
      alert(`Error deleting request: ${error.message}`);
    }
  };

  const getRequestsByStatus = (status) => {
    return maintenanceRequests.filter((request) => request.status === status);
  };

  const getFilteredRequests = (requests) => {
    if (!search) return requests;

    return requests.filter(
      (request) =>
        request.title.toLowerCase().includes(search.toLowerCase()) ||
        request.description.toLowerCase().includes(search.toLowerCase()) ||
        request.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
        request.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        request.user?.lastName?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const columns = [
    {
      title: getStatusDisplayName(MAINTENANCE_STATUS.OPEN),
      status: MAINTENANCE_STATUS.OPEN,
      actions: ["Cancel", "Accept"],
    },
    {
      title: getStatusDisplayName(MAINTENANCE_STATUS.IN_PROGRESS),
      status: MAINTENANCE_STATUS.IN_PROGRESS,
      actions: ["Reply", "Finish"],
    },
    {
      title: getStatusDisplayName(MAINTENANCE_STATUS.COMPLETED),
      status: MAINTENANCE_STATUS.COMPLETED,
      actions: ["Trash", "View"],
    },
  ];

  const handleActionClick = (action, requestId) => {
    if (action === "Accept") {
      handleStatusUpdate(requestId, MAINTENANCE_STATUS.IN_PROGRESS);
    } else if (action === "Cancel") {
      handleStatusUpdate(requestId, MAINTENANCE_STATUS.CANCELLED);
    } else if (action === "Finish") {
      handleStatusUpdate(requestId, MAINTENANCE_STATUS.COMPLETED);
    } else if (action === "Trash") {
      handleDeleteRequest(requestId);
    } else if (action === "Reply") {
      alert("Reply functionality coming soon!");
    } else if (action === "View") {
      alert("View details functionality coming soon!");
    }
  };

  const handleFilterClick = (filterType) => {
    console.log("Filter clicked:", filterType);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Maintenance</h1>

      <MaintenanceFilters
        search={search}
        onSearchChange={setSearch}
        onFilterClick={handleFilterClick}
      />

      <Button
        size="sm"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2"
      >
        <Plus className="size-4" /> New Request
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const requests = getFilteredRequests(getRequestsByStatus(col.status));

          return (
            <MaintenanceColumn
              key={col.title}
              title={col.title}
              requests={requests}
              loading={loading}
              actions={col.actions}
              onActionClick={handleActionClick}
            />
          );
        })}
      </div>

      {showModal && (
        <MaintenanceForm
          formData={formData}
          properties={properties}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default Maintenance;
