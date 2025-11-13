import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Filter, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/shared/StatusBadge";
import { getAllInsurances } from "@/services/insuranceService";
import { format } from "date-fns";
import InsuranceDetailsModal from "./InsuranceDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LandlordInsurance = () => {
  const [insurances, setInsurances] = useState([]);
  const [filteredInsurances, setFilteredInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const data = await getAllInsurances();
      setInsurances(data.insurances || []);
      setFilteredInsurances(data.insurances || []);
    } catch (error) {
      console.error("Error fetching insurances:", error);
      toast.error("Failed to load insurance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  useEffect(() => {
    let filtered = [...insurances];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((ins) => ins.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ins) =>
          ins.tenant?.firstName?.toLowerCase().includes(query) ||
          ins.tenant?.lastName?.toLowerCase().includes(query) ||
          ins.policyNumber?.toLowerCase().includes(query) ||
          ins.providerName?.toLowerCase().includes(query) ||
          getPropertyName(ins).toLowerCase().includes(query)
      );
    }

    setFilteredInsurances(filtered);
  }, [searchQuery, statusFilter, insurances]);

  const getPropertyName = (insurance) => {
    if (insurance.lease?.listing?.streetAddress) {
      return insurance.lease.listing.streetAddress;
    }
    if (insurance.lease?.propertyAddress) {
      return insurance.lease.propertyAddress;
    }
    if (insurance.customLease?.leaseName) {
      return insurance.customLease.leaseName;
    }
    return "N/A";
  };

  const getTenantName = (insurance) => {
    if (insurance.tenant?.firstName && insurance.tenant?.lastName) {
      return `${insurance.tenant.firstName} ${insurance.tenant.lastName}`;
    }
    return insurance.tenant?.email || "Unknown Tenant";
  };

  const handleViewDetails = (insurance) => {
    setSelectedInsurance(insurance);
    setShowDetailsModal(true);
  };

  const handleModalClose = () => {
    setShowDetailsModal(false);
    setSelectedInsurance(null);
    fetchInsurances(); // Refresh data after modal closes
  };

  const getStatusCount = (status) => {
    if (status === "ALL") return insurances.length;
    return insurances.filter((ins) => ins.status === status).length;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Renter's Insurance</h1>
            <p className="text-gray-600 mt-1">
              Manage and track your tenants' insurance status
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by tenant name, policy number, property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                All ({getStatusCount("ALL")})
              </SelectItem>
              <SelectItem value="PENDING">
                Pending ({getStatusCount("PENDING")})
              </SelectItem>
              <SelectItem value="VERIFIED">
                Active ({getStatusCount("VERIFIED")})
              </SelectItem>
              <SelectItem value="EXPIRING_SOON">
                Expiring Soon ({getStatusCount("EXPIRING_SOON")})
              </SelectItem>
              <SelectItem value="EXPIRED">
                Expired ({getStatusCount("EXPIRED")})
              </SelectItem>
              <SelectItem value="REJECTED">
                Rejected ({getStatusCount("REJECTED")})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading insurance records...</p>
            </div>
          </div>
        ) : filteredInsurances.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Insurance Records Found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search or filters"
                : "No tenants have submitted insurance yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInsurances.map((insurance) => (
                  <tr
                    key={insurance.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetails(insurance)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getTenantName(insurance)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {insurance.providerName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getPropertyName(insurance)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {insurance.policyNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={insurance.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(insurance.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(insurance);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedInsurance && (
        <InsuranceDetailsModal
          insurance={selectedInsurance}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default LandlordInsurance;

