import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import InvoiceDetailsModal from '@/components/shared/InvoiceDetailsModal';

const getStatusBadgeClass = (status) => {
  const baseClasses = 'px-3 py-1 rounded-md text-[14px] font-medium';
  
  switch (status) {
    case 'PAID':
      return `${baseClasses} bg-gray-200 text-gray-800`;
    case 'PENDING':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'FAILED':
    case 'CANCELLED':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-200 text-gray-800`;
  }
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

const TransactionRow = ({ payment, onViewProof, onViewInvoice, isLoading }) => {
  const tenant = payment.tenant;
  const listing = payment.lease?.listing || payment.customLease?.listing;
  const status = getStatusText(payment.status, payment.dueDate);
  const isPaid = payment.status === 'PAID';
  const hasInvoice = payment.invoice;

  // Determine which date to show
  const displayDate = isPaid ? payment.paidDate : payment.dueDate;
  const dateLabel = isPaid ? 'Paid' : 'Due';

  return (
    <Card className="border border-gray-300 hover:shadow-md cursor-pointer transition-shadow mb-3 p-3">
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center">
        {/* Tenant */}
        <div className="text-[16px] text-gray-700 truncate">
          <div className="font-semibold text-gray-900">{tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A'}</div>
          <div className="text-sm font-normal text-gray-600 text-wrap">
            Submitted {format(new Date(payment.createdAt), 'd')} days ago
          </div>
        </div>

        {/* Property */}
        <div className="text-[16px] font-semibold text-gray-900 truncate border-l border-gray-300 pl-4">
          {listing ? (
            <>
              <div className="truncate">{listing.title}</div>
              <div className="text-sm font-normal text-gray-600 truncate">
                {listing.streetAddress}, {listing.city}
              </div>
            </>
          ) : payment.type === 'MAINTENANCE' && payment.notes ? (
            <>
              <div className="truncate text-gray-700">Property Maintenance</div>
              <div className="text-sm font-normal text-gray-600 truncate">
                {payment.notes}
              </div>
            </>
          ) : (
            <span className="text-gray-500">N/A</span>
          )}
        </div>

        {/* Category */}
        <div className="flex justify-center mr-auto border-l border-gray-300 pl-4">
          <div className="text-center">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold text-gray-900 capitalize">
                {payment.type.toLowerCase()}
              </span>
              {hasInvoice && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewInvoice(payment);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="View Invoice Details"
                >
                  <FileText className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="border-l border-gray-300 pl-4 pr-4">
          <div className="text-right">
            <div className="text-[16px] font-semibold text-gray-900">
              ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex justify-center mr-auto border-l border-gray-300 pl-4">
          <div className="text-center">
            {displayDate ? (
              <>
                <div className="text-[16px] font-semibold text-gray-900">
                  {format(new Date(displayDate), 'MMM d, yyyy')}
                </div>
                <div className="text-[12px] text-gray-500">{dateLabel}</div>
              </>
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-center mr-auto border-l border-gray-300 pl-4">
          <Badge className={`${getStatusBadgeClass(payment.status)} whitespace-nowrap text-xs px-2 py-1 text-gray-900 border-0`}>
            {status}
          </Badge>
        </div>

        {/* Action */}
        <div className="flex justify-center mr-auto border-l border-gray-300 pl-4">
          {payment.proofUrl ? (
            // Has receipt uploaded
            isPaid ? (
              // Already approved
              <button
                onClick={() => onViewProof(payment)}
                className="text-gray-900 hover:text-gray-700 text-[14px] font-medium"
              >
                View Receipt
              </button>
            ) : (
              // Awaiting review
              <button
                onClick={() => onViewProof(payment)}
                className="text-blue-600 hover:text-blue-800 text-[14px] font-medium"
              >
                Review Receipt
              </button>
            )
          ) : (
            // No receipt yet
            <span className="text-gray-400 text-[14px]">
              Awaiting payment
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

const TransactionTable = ({ payments, onViewProof, isLoading, hideHeader = false }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const handleViewInvoice = (payment) => {
    setSelectedPayment(payment);
    setInvoiceModalOpen(true);
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 p-12 text-center">
        <p className="text-gray-500 text-[16px]">No payments found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Table Header - Conditionally render */}
        {!hideHeader && (
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] mb-3 bg-gray-900 p-3 text-white font-semibold rounded-2xl gap-4 flex-shrink-0">
            <div className="">Tenant</div>
            <div className="border-l border-gray-300 pl-4">Property</div>
            <div className="border-l border-gray-300 pl-4">Category</div>
            <div className="border-l border-gray-300 pl-4 pr-4 text-right">Amount</div>
            <div className="border-l border-gray-300 pl-4">Date</div>
            <div className="border-l border-gray-300 pl-4">Status</div>
            <div className="border-l border-gray-300 pl-4">Action</div>
          </div>
        )}

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
          {payments.map((payment) => (
            <TransactionRow
              key={payment.id}
              payment={payment}
              onViewProof={onViewProof}
              onViewInvoice={handleViewInvoice}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        payment={selectedPayment}
      />
    </>
  );
};

export default TransactionTable;

