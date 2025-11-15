import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Eye, FileText } from 'lucide-react';
import InvoiceDetailsModal from '@/components/shared/InvoiceDetailsModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const TenantPaymentSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <Card
        key={index}
        className="border border-gray-300 rounded-2xl p-4 shadow-sm"
      >
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 items-center">
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="border-l border-gray-200 pl-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="border-l border-gray-200 pl-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="border-l border-gray-200 pl-4 pr-4">
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
          <div className="border-l border-gray-200 pl-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="border-l border-gray-200 pl-4 flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-xl" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const getStatusBadgeClass = (status, dueDate, hasReceipt) => {
  const baseClasses = 'px-3 py-1 rounded-md text-[14px] font-medium';
  
  if (status === 'PAID') {
    return `${baseClasses} bg-gray-200 text-gray-800`;
  }
  
  if (status === 'PENDING') {
    // If receipt uploaded, show as "Under Review"
    if (hasReceipt) {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    }
    
    // Otherwise check if overdue
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) {
      return `${baseClasses} bg-red-100 text-red-800`; // Overdue
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`; // Outstanding
  }
  
  return `${baseClasses} bg-gray-200 text-gray-800`;
};

const getStatusText = (status, dueDate, hasReceipt) => {
  if (status === 'PAID') return 'Paid';
  if (status === 'PENDING') {
    // If receipt uploaded, show "Under Review"
    if (hasReceipt) return 'Under Review';
    
    // Otherwise check if overdue
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return 'Overdue';
    return 'Outstanding';
  }
  return status;
};

const TenantPaymentTable = ({ payments, isLoading }) => {
    const [uploadingId, setUploadingId] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const handleViewInvoice = (payment) => {
        console.log('🧾 View Invoice clicked for payment:', payment.id);
        console.log('   Invoice data:', payment.invoice);
        console.log('   Maintenance Request:', payment.invoice?.maintenanceRequest);
        setSelectedPayment(payment);
        setInvoiceModalOpen(true);
    };

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

    // Debug: Log payments with invoices
    React.useEffect(() => {
        const paymentsWithInvoices = paymentList.filter(p => p.invoice);
        if (paymentsWithInvoices.length > 0) {
            console.log(`\n💳 ${paymentsWithInvoices.length} payments have invoices:`);
            paymentsWithInvoices.forEach((p, idx) => {
                console.log(`  [${idx}] ${p.type} - $${p.amount} - Invoice ID: ${p.invoice?.id?.slice(-8)}`);
            });
        }
    }, [paymentList]);

    return (
        <div className="h-full flex flex-col">
            {/* Table Header - Always visible */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr] mb-3 bg-gray-900 p-3 text-white font-semibold rounded-2xl gap-4 flex-shrink-0">
                <div>Date</div>
                <div className="border-l border-gray-300 pl-4">Note</div>
                <div className="border-l border-gray-300 pl-4">Category</div>
                <div className="border-l border-gray-300 pl-4 pr-4 text-right">Amount</div>
                <div className="border-l border-gray-300 pl-4">Status</div>
                <div className="border-l border-gray-300 pl-4">Actions</div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {isLoading ? (
                    <TenantPaymentSkeleton />
                ) : paymentList.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">No payment records found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                    {paymentList.map((payment) => {
                    const listing = payment.lease?.listing || payment.customLease?.listing;
                    const hasReceipt = !!payment.proofUrl;
                    const status = getStatusText(payment.status, payment.dueDate, hasReceipt);
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
                                <div className="border-l border-gray-300 pl-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[16px] font-semibold text-gray-900 capitalize">
                                            {payment.type.toLowerCase()}
                                        </span>
                                        {payment.invoice && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewInvoice(payment);
                                                }}
                                                className="p-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gray-900 transition-all cursor-pointer"
                                                title="View Invoice Details"
                                            >
                                                <FileText className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="text-[16px] font-semibold text-gray-900 border-l border-gray-300 pl-4 pr-4 text-right">
                                    ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>

                                {/* Status */}
                                <div className="flex items-center border-l border-gray-300 pl-4">
                                    <span className={getStatusBadgeClass(payment.status, payment.dueDate, hasReceipt)}>
                                        {status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                                    {hasReceipt ? (
                                        <Button
                                            size="sm"
                                            variant={isPaid ? "outline" : "default"}
                                            onClick={() => handleViewReceipt(payment.proofUrl)}
                                            className={`text-xs ${!isPaid ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}`}
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View Receipt
                                        </Button>
                                    ) : (
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
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                    })}
                    </div>
                )}
            </div>
            
            {/* Invoice Details Modal */}
            <InvoiceDetailsModal
                open={invoiceModalOpen}
                onClose={() => setInvoiceModalOpen(false)}
                payment={selectedPayment}
            />
        </div>
    );
};

export default TenantPaymentTable;

