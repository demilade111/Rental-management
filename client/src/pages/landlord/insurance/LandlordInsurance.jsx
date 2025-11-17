import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, SlidersHorizontal, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
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
import PageHeader from "@/components/shared/PageHeader";

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
  };

  const getStatusCount = (status) => {
    if (status === "ALL") return insurances.length;
    return insurances.filter((ins) => ins.status === status).length;
  };

  // Insurance Row Component
  const InsuranceRow = ({ insurance }) => {
    return (
      <Card 
        className="border border-gray-300 hover:shadow-md cursor-pointer transition-shadow mb-1 p-3"
        onClick={() => handleViewDetails(insurance)}
      >
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_120px] gap-4 items-center">
          {/* Tenant */}
          <div className="text-[16px] text-gray-700 truncate">
            <div className="font-semibold text-gray-900">{getTenantName(insurance)}</div>
            <div className="text-sm font-normal text-gray-600 text-wrap">
              {insurance.providerName || "N/A"}
            </div>
          </div>

          {/* Property */}
          <div className="text-[16px] font-semibold text-gray-900 truncate border-l border-gray-300 pl-4">
            <div className="truncate">{getPropertyName(insurance)}</div>
          </div>

          {/* Policy ID */}
          <div className="text-[16px] font-mono text-gray-900 truncate border-l border-gray-300 pl-4">
            {insurance.policyNumber || "N/A"}
          </div>

          {/* Status */}
          <div className="flex justify-center mr-auto border-l border-gray-300 pl-4">
            <StatusBadge status={insurance.status} />
          </div>

          {/* Submitted */}
          <div className="text-[16px] text-gray-900 border-l border-gray-300 pl-4">
            {format(new Date(insurance.createdAt), "MMM d, yyyy")}
          </div>

          {/* Actions */}
          <div className="flex justify-end border-l border-gray-300 pl-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(insurance);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground rounded-xl"
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Skeleton Component
  const InsuranceTableSkeleton = () => (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-card border border-gray-300 rounded-2xl p-3">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_120px] gap-4 items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="border-l border-gray-200 pl-4">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="border-l border-gray-200 pl-4">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="border-l border-gray-200 pl-4">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="border-l border-gray-200 pl-4">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="border-l border-gray-200 pl-4">
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
        <PageHeader
          title="Renter's Insurance"
          subtitle="Manage and track your tenants' insurance status"
          total={filteredInsurances.length}
        />

      <div className="pb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by tenant name, policy number, property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-primary-foreground border-gray-300"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="border-gray-200 bg-primary-foreground"
            onClick={() => {}}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-primary-foreground border-gray-300">
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
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Table Header - Always visible */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_120px] mb-3 bg-primary p-3 text-primary-foreground font-semibold rounded-2xl gap-4 flex-shrink-0">
          <div>Tenant</div>
          <div className="border-l border-primary-foreground/20 pl-4">Property</div>
          <div className="border-l border-primary-foreground/20 pl-4">Policy ID</div>
          <div className="border-l border-primary-foreground/20 pl-4">Status</div>
          <div className="border-l border-primary-foreground/20 pl-4">Submitted</div>
          <div className="border-l border-primary-foreground/20 pl-4">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <InsuranceTableSkeleton />
          ) : filteredInsurances.length === 0 ? (
            <div className="bg-card rounded-2xl border border-gray-300 p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">
                No Insurance Records Found
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== "ALL"
                  ? "Try adjusting your search or filters"
                  : "No tenants have submitted insurance yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredInsurances.map((insurance) => (
                <InsuranceRow key={insurance.id} insurance={insurance} />
              ))}
            </div>
          )}
        </div>
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

