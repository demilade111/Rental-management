import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { maintenanceApi, MAINTENANCE_STATUS, getStatusDisplayName } from "@/lib/maintenanceApi";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import RentersInsuranceCard from "./RentarsInsuranceCard";
import ExpiringLeasesCard from "./ExpiringLeasesCard";
import AccountingCard from "./AccountingCard";

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const loadMaintenanceRequests = useCallback(async () => {
    setLoadingMaintenance(true);
    try {
      const data = await maintenanceApi.getAllRequests({});
      const requests = data.data || data;
      setMaintenanceRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      setMaintenanceRequests([]);
    } finally {
      setLoadingMaintenance(false);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    setLoadingApplications(true);
    try {
      const res = await api.get(`${API_ENDPOINTS.APPLICATIONS.BASE}?page=1&limit=20`);
      const data = res.data.data || res.data;
      const apps = data.applications || [];
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  useEffect(() => {
    loadMaintenanceRequests();
    loadApplications();
  }, [loadMaintenanceRequests, loadApplications]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    if (diffMonths < 12) return `${diffMonths}m`;
    return `${Math.floor(diffMonths / 12)}y`;
  };

  const getStatusForDisplay = (status) => {
    switch (status) {
      case MAINTENANCE_STATUS.OPEN:
        return "New";
      case MAINTENANCE_STATUS.IN_PROGRESS:
        return "Ongoing";
      case MAINTENANCE_STATUS.COMPLETED:
        return "Done";
      case MAINTENANCE_STATUS.CANCELLED:
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "Approved":
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "Ongoing":
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "Done":
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "Cancelled":
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "Rejected":
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "Undecided":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApplicationStatusForDisplay = (status) => {
    switch (status) {
      case "PENDING":
        return "New";
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status || "New";
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 p-4 md:p-6 lg:p-8 h-full">
        {/* Main Content Grid */}
        <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <AccountingCard />

          {/* Applicants */}
          <div className="bg-card rounded-lg border border-gray-400 p-4 md:p-6 flex flex-col h-[calc((100vh-200px)/2)] min-h-0">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-2xl md:text-3xl lg:text-[32px] font-bold">
                Applicants
              </h3>
              <button
                type="button"
                className="text-sm md:text-base font-semibold hover:underline"
                onClick={() => navigate("/landlord/applications")}
              >
                View All
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 pr-4">
              {loadingApplications ? (
                <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">No applications</div>
              ) : (
                <table className="w-full border-collapse min-w-[400px]">
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => {
                      const listing = app.listing;
                      const address = listing?.streetAddress 
                        ? `${listing.streetAddress}${listing.city ? `, ${listing.city}` : ""}${listing.state ? `, ${listing.state}` : ""}`
                        : listing?.title || "N/A";
                      const timeAgo = formatTimeAgo(app.createdAt);
                      const displayStatus = getApplicationStatusForDisplay(app.status);
                      
                      return (
                        <tr key={app.id} className="border-b border-gray-100">
                          <td className="text-xs sm:text-sm font-semibold text-gray-900 py-2 sm:py-3 max-w-[200px] truncate">
                            {address}
                          </td>
                          <td className="text-xs text-gray-500 py-2 sm:py-3 whitespace-nowrap">
                            {timeAgo}
                          </td>
                          <td className="text-right py-2 sm:py-3">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getStatusColor(
                                displayStatus
                              )}`}
                            >
                              {displayStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <ExpiringLeasesCard />
          <RentersInsuranceCard />
        </div>

        {/* Maintenance Sidebar */}
        <div className="w-full lg:w-1/4 flex flex-col">
          <div className="bg-card rounded-lg border border-gray-400 p-4 md:p-6 flex flex-col h-[calc(100vh-200px)] min-h-0">
            <h3 className="text-2xl md:text-3xl lg:text-[32px] font-bold mb-4 flex-shrink-0">
              Maintenance
            </h3>

            {/* Scrollable table */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-4">
              {loadingMaintenance ? (
                <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
              ) : maintenanceRequests.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">No maintenance requests</div>
              ) : (
                <table className="w-full border-collapse min-w-[300px]">
                  <tbody className="divide-y divide-gray-100">
                    {maintenanceRequests.map((request) => {
                      const displayStatus = getStatusForDisplay(request.status);
                      const listing = request.listing;
                      const address = listing?.streetAddress 
                        ? `${listing.streetAddress}${listing.city ? `, ${listing.city}` : ""}${listing.state ? `, ${listing.state}` : ""}`
                        : listing?.title || "N/A";
                      const timeAgo = formatTimeAgo(request.createdAt);
                      
                      return (
                        <React.Fragment key={request.id}>
                          <tr className="border-b-0">
                            <td className="text-xs sm:text-sm font-semibold text-gray-900 pt-3 max-w-[150px] truncate">
                              {address}
                            </td>
                            <td className="text-xs text-gray-500 text-right pt-3 whitespace-nowrap">
                              {timeAgo}
                            </td>
                            <td className="text-right pt-3">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getStatusColor(
                                  displayStatus
                                )}`}
                              >
                                {displayStatus}
                              </span>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td colSpan="3" className="text-xs text-gray-600 pb-3 max-w-[300px] truncate">
                              {request.title}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 text-center flex-shrink-0">
              <button
                type="button"
                className="text-sm md:text-base font-semibold hover:underline"
                onClick={() => navigate("/landlord/maintenance")}
              >
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
