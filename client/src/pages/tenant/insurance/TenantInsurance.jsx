import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, FileText, Calendar, DollarSign, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import { getAllInsurances } from "@/services/insuranceService";
import { format } from "date-fns";
import UploadInsurance from "./UploadInsurance";

const TenantInsurance = () => {
  const navigate = useNavigate();
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const data = await getAllInsurances();
      setInsurances(data.insurances || []);
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
    return "Property";
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (showUpload) {
    return (
      <div className="h-full overflow-auto">
        <UploadInsurance
          onSuccess={() => {
            setShowUpload(false);
            fetchInsurances();
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Renter's Insurance</h1>
            <p className="text-gray-600 mt-1">
              Manage and track your renter's insurance policies
            </p>
          </div>
          <Button onClick={() => setShowUpload(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Insurance
          </Button>
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
        ) : insurances.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Insurance Records
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your renter's insurance certificate to get started
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Insurance
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {insurances.map((insurance) => {
              const daysUntilExpiry = getDaysUntilExpiry(insurance.expiryDate);
              const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
              const isExpired = daysUntilExpiry < 0;

              return (
                <div
                  key={insurance.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {insurance.providerName}
                        </h3>
                        <StatusBadge status={insurance.status} />
                      </div>
                      <p className="text-sm text-gray-600">
                        Policy #{insurance.policyNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start space-x-3">
                      <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Property</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getPropertyName(insurance)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Expiration Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(insurance.expiryDate), "MMM dd, yyyy")}
                        </p>
                        {isExpiringSoon && (
                          <p className="text-xs text-orange-600 mt-1">
                            Expires in {daysUntilExpiry} days
                          </p>
                        )}
                        {isExpired && (
                          <p className="text-xs text-red-600 mt-1">
                            Expired {Math.abs(daysUntilExpiry)} days ago
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Coverage Type</p>
                        <p className="text-sm font-medium text-gray-900">
                          {insurance.coverageType}
                        </p>
                      </div>
                    </div>
                  </div>

                  {insurance.coverageAmount && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Coverage Amount:{" "}
                          <span className="font-medium text-gray-900">
                            ${insurance.coverageAmount.toLocaleString()}
                          </span>
                        </span>
                        {insurance.monthlyCost && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              Monthly Cost:{" "}
                              <span className="font-medium text-gray-900">
                                ${insurance.monthlyCost}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {insurance.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900 mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-red-700">
                        {insurance.rejectionReason}
                      </p>
                    </div>
                  )}

                  {insurance.status === "VERIFIED" && insurance.verifiedAt && (
                    <div className="mt-4 text-xs text-gray-500">
                      Verified on {format(new Date(insurance.verifiedAt), "MMM dd, yyyy")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantInsurance;

