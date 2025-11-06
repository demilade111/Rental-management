import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { maintenanceApi, MAINTENANCE_STATUS, getStatusDisplayName } from "@/lib/maintenanceApi";
import RentersInsuranceCard from "./RentarsInsuranceCard";
import ExpiringLeasesCard from "./ExpiringLeasesCard";
import AccountingCard from "./AccountingCard";

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  const applications = user?.landlordStats?.applications || [
    { address: "1023 Jervis st, V6T 3A1", time: "8 hours ago", status: "New" },
    { address: "456 Cherry st, V5T 2B4", time: "1 day ago", status: "New" },
    {
      address: "1980 Hasting st, V6T 6A1",
      time: "3 days ago",
      status: "Approved",
    },
    {
      address: "850 Nelson st, V7Y 7F5",
      time: "5 days ago",
      status: "Undecided",
    },
    {
      address: "1603 Pendrell st, V4T 3A2",
      time: "1 week ago",
      status: "Approved",
    },
  ];

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

  useEffect(() => {
    loadMaintenanceRequests();
  }, [loadMaintenanceRequests]);

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
        return "bg-blue-100 text-blue-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Ongoing":
        return "bg-yellow-100 text-yellow-800";
      case "Done":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Undecided":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 p-4 md:p-6 lg:p-8 h-full">
        {/* Main Content Grid */}
        <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <AccountingCard />

          {/* Applicants */}
          <div className="bg-card rounded-lg border border-gray-400 p-4 md:p-6 flex flex-col">
            <h3 className="text-2xl md:text-3xl lg:text-[32px] font-bold mb-10">
              Applicants
            </h3>
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-[400px]">
                <tbody className="max-h-64 overflow-y-auto">
                  {applications.map((app, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-300 last:border-0"
                    >
                      <td className="text-xs sm:text-sm font-semibold text-gray-900 py-2 sm:py-3">
                        {app.address}
                      </td>
                      <td className="text-xs text-gray-500 py-2 sm:py-3 whitespace-nowrap">
                        {app.time}
                      </td>
                      <td className="text-right py-2 sm:py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody> 
              </table>
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
