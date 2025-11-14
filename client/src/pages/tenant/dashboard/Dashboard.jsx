import { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { Button } from "../../../components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { Badge } from "@/components/ui/badge";
import { Upload, Bell, Check } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Get current month and year
  const currentMonth = format(new Date(), 'MMMM');
  const currentYear = format(new Date(), 'yyyy');

  // Fetch tenant's payments
  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['tenant-payments-dashboard'],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.PAYMENTS.BASE);
      const data = response.data;
      
      // Handle different response structures
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.payments && Array.isArray(data.payments)) return data.payments;
      
      return [];
    },
    enabled: !!user,
  });

  // Find current month's rent payment
  const currentMonthRent = payments.find((payment) => {
    if (payment.type !== 'RENT') return false;
    
    const paymentDate = new Date(payment.dueDate);
    const now = new Date();
    
    return (
      paymentDate.getMonth() === now.getMonth() &&
      paymentDate.getFullYear() === now.getFullYear() &&
      payment.status === 'PENDING'
    );
  });

  // Fetch tenant's maintenance requests
  const { data: maintenanceRequests = [], isLoading: loadingMaintenance } = useQuery({
    queryKey: ['tenant-maintenance'],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.MAINTENANCE.BASE);
      const data = response.data;
      
      // Handle different response structures
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.requests && Array.isArray(data.requests)) return data.requests;
      
      return [];
    },
    enabled: !!user,
  });

  // Get most recent maintenance requests (max 3)
  const recentMaintenance = maintenanceRequests
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Upload receipt mutation
  const uploadReceiptMutation = useMutation({
    mutationFn: async ({ paymentId, file }) => {
      // Get presigned URL
      const uploadUrlResponse = await api.get('/api/v1/upload/payment-receipt-upload-url', {
        params: {
          fileName: file.name,
          fileType: file.type,
        },
      });

      const { uploadURL, fileUrl } = uploadUrlResponse.data.data;

      // Upload to S3
      await fetch(uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // Update payment with proof URL
      const response = await api.post(`/api/v1/payments/${paymentId}/upload-receipt`, {
        proofUrl: fileUrl,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-payments-dashboard']);
      toast.success('Payment receipt uploaded successfully!');
      setUploadingReceipt(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload receipt');
      setUploadingReceipt(false);
    },
  });

  const handleFileSelect = (event) => {
    if (!currentMonthRent) {
      toast.error('No current month rent payment found');
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      setUploadingReceipt(true);
      uploadReceiptMutation.mutate({ paymentId: currentMonthRent.id, file });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-gray-200 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800'; // OPEN
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          {currentMonth} Rent Summary
        </h1>

        {/* Outstanding Balance Card */}
        <div className="bg-white rounded-2xl border border-gray-300 p-6 md:p-8 mb-6 md:mb-8">
          {loadingPayments ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : currentMonthRent ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-2">Outstanding balance</h2>
                <p className="text-4xl md:text-5xl font-bold">
                  ${Number(currentMonthRent.amount).toFixed(2)}
                </p>
              </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium">In transit</span>
                  </div>
                  <input
                    type="file"
                    id="rent-receipt-upload"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                    disabled={uploadingReceipt}
                  />
                  <Button 
                    className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-2xl"
                    onClick={() => document.getElementById('rent-receipt-upload').click()}
                    disabled={uploadingReceipt || currentMonthRent.proofUrl}
                  >
                    <Upload size={16} className="mr-2" />
                    {uploadingReceipt ? 'Uploading...' : 'Upload Payment Proof'}
                  </Button>
                </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-medium">No rent payment due this month</p>
              <p className="text-sm mt-2">Your rent is paid or no payment scheduled</p>
            </div>
          )}
        </div>

        {/* Two Column Section - Notice & Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Notice Card */}
          <div className="bg-white rounded-2xl border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold">Notice</h2>
              <Bell size={24} className="text-black fill-black" />
            </div>
            
            <div className="flex flex-col gap-6">
              {loadingMaintenance ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-8 bg-gray-100 rounded w-24"></div>
                    </div>
                  ))}
                </>
              ) : recentMaintenance.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No recent notices</p>
                </div>
              ) : (
                recentMaintenance.map((request) => (
                  <div key={request.id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm md:text-base flex-1">
                        Your maintenance request for <span className="font-bold">"{request.title}"</span> has been {request.status === 'COMPLETED' ? 'completed' : 'updated'}.
                      </p>
                    <Button variant="outline" size="sm" className="bg-gray-200 text-black hover:bg-gray-300 border-0 flex-shrink-0 rounded-2xl">
                      Maintenance
                    </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Maintenance Card */}
          <div className="bg-white rounded-2xl border border-gray-300 p-6">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Maintenance</h2>
            <div className="flex flex-col gap-6">
              {loadingMaintenance ? (
                <>
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-100 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-full"></div>
                    </div>
                  ))}
                </>
              ) : recentMaintenance.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No maintenance requests</p>
                </div>
              ) : (
                recentMaintenance.map((request) => (
                  <div key={request.id}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-base">{request.listing?.streetAddress || 'Property'}</p>
                      <div className="flex items-center gap-4 text-xs whitespace-nowrap">
                        <span className="text-gray-400">
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true }).replace(' ago', '')}
                        </span>
                        <span className="font-semibold text-black">
                          {request.status === 'OPEN' ? 'New' : request.status === 'IN_PROGRESS' ? 'Ongoing' : 'Done'}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold text-sm md:text-base mb-2">
                      {request.title}
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm line-clamp-2">
                      {request.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Insurance Section */}
        <div className="bg-white rounded-2xl border border-gray-300 p-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">Insurance</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Insurance Status:</span> Active
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Insurance Type:</span> Tenant Liability Insurance
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Expiration Date:</span> Nov 15, 2025
              </p>
              <Button className="mt-4 bg-black text-white hover:bg-gray-800 rounded-2xl">
                View Policy
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Insurance Status:</span> Expiring in 30 days
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Insurance Type:</span> Personal Property Insurance
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Expiration Date:</span> Oct 7, 2025
              </p>
              <Button className="mt-4 bg-black text-white hover:bg-gray-800 rounded-2xl">
                View Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
