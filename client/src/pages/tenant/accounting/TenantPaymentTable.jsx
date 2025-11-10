import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Eye, FileText } from 'lucide-react';
import LoadingState from '@/components/shared/LoadingState';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

const getStatusBadgeClass = (status, dueDate) => {
  const baseClasses = 'px-3 py-1 rounded-md text-[14px] font-medium';
  
  if (status === 'PAID') {
    return `${baseClasses} bg-gray-200 text-gray-800`;
  }
  
  if (status === 'PENDING') {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) {
      return `${baseClasses} bg-red-100 text-red-800`; // Overdue
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`; // Outstanding
  }
  
  return `${baseClasses} bg-gray-200 text-gray-800`;
};

const getStatusText = (status, dueDate) => {
  if (status === 'PAID') return 'Paid';
  if (status === 'PENDING') {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return 'Overdue';
    return 'Outstanding';
  }
  return status;
};

const TenantPaymentTable = ({ payments, isLoading }) => {
    const [uploadingId, setUploadingId] = useState(null);
    const queryClient = useQueryClient();

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
            queryClient.invalidateQueries(['tenant-payments']);
            queryClient.invalidateQueries(['tenant-payment-summary']);
            toast.success('Payment receipt uploaded successfully!');
            setUploadingId(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to upload receipt');
            setUploadingId(null);
        },
    });

    const handleFileSelect = (paymentId, event) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadingId(paymentId);
            uploadReceiptMutation.mutate({ paymentId, file });
        }
    };

    const handleViewReceipt = async (proofUrl) => {
        try {
            const response = await api.get('/api/v1/upload/payment-receipt-download-url', {
                params: { fileUrl: proofUrl },
            });
            const { downloadURL } = response.data.data;
            window.open(downloadURL, '_blank');
        } catch (error) {
            toast.error('Failed to load receipt');
        }
    };

    // Ensure payments is an array
    const paymentList = Array.isArray(payments) ? payments : [];

    return (
        <div className="h-full overflow-y-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr] mb-3 bg-gray-900 p-3 text-white font-semibold rounded-2xl gap-4 flex-shrink-0 sticky top-0 z-10">
                <div>Date</div>
                <div className="border-l border-gray-300 pl-4">Note</div>
                <div className="border-l border-gray-300 pl-4">Category</div>
                <div className="border-l border-gray-300 pl-4">Amount</div>
                <div className="border-l border-gray-300 pl-4">Status</div>
                <div className="border-l border-gray-300 pl-4">Actions</div>
            </div>

            {/* Table Content */}
            {isLoading ? (
                <LoadingState message="Loading payments..." compact={true} />
            ) : paymentList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No payment records found</p>
                </div>
            ) : (
                <div className="space-y-3">
                {paymentList.map((payment) => {
                    const listing = payment.lease?.listing || payment.customLease?.listing;
                    const status = getStatusText(payment.status, payment.dueDate);
                    const isPaid = payment.status === 'PAID';
                    const displayDate = isPaid ? payment.paidDate : payment.dueDate;
                    const dateLabel = isPaid ? 'Paid' : 'Due';

                    return (
                        <Card key={payment.id} className="border border-gray-300 hover:shadow-md transition-shadow p-4">
                            <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 items-center">
                                {/* Date */}
                                <div>
                                    <div className="text-[16px] font-semibold text-gray-900">
                                        {displayDate ? format(new Date(displayDate), 'MMM dd, yyyy') : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600">{dateLabel}</div>
                                </div>

                                {/* Note */}
                                <div className="text-[16px] text-gray-900 border-l border-gray-300 pl-4 min-w-0">
                                    {payment.notes ? (
                                        <div className="truncate" title={payment.notes}>{payment.notes}</div>
                                    ) : listing ? (
                                        <div className="min-w-0">
                                            <div className="truncate font-semibold" title={listing.title}>{listing.title}</div>
                                            <div className="text-sm font-normal text-gray-600 truncate" title={`${listing.streetAddress}, ${listing.city}`}>
                                                {listing.streetAddress}, {listing.city}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm">No note</span>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="text-[16px] font-semibold text-gray-900 capitalize border-l border-gray-300 pl-4">
                                    {payment.type.toLowerCase()}
                                </div>

                                {/* Amount */}
                                <div className="text-[16px] font-semibold text-gray-900 border-l border-gray-300 pl-4">
                                    ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>

                                {/* Status */}
                                <div className="flex items-center border-l border-gray-300 pl-4">
                                    <span className={getStatusBadgeClass(payment.status, payment.dueDate)}>
                                        {status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                                    {isPaid && payment.proofUrl ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewReceipt(payment.proofUrl)}
                                            className="text-xs"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View Receipt
                                        </Button>
                                    ) : !isPaid ? (
                                        <>
                                            <input
                                                type="file"
                                                id={`receipt-${payment.id}`}
                                                className="hidden"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => handleFileSelect(payment.id, e)}
                                                disabled={uploadingId === payment.id}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => document.getElementById(`receipt-${payment.id}`).click()}
                                                disabled={uploadingId === payment.id}
                                                className="text-xs bg-black text-white hover:bg-gray-800"
                                            >
                                                {uploadingId === payment.id ? (
                                                    'Uploading...'
                                                ) : (
                                                    <>
                                                        <Upload className="w-3 h-3 mr-1" />
                                                        Upload Receipt
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400">No receipt</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
                </div>
            )}
        </div>
    );
};

export default TenantPaymentTable;

