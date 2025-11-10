import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import LoadingState from '@/components/shared/LoadingState';
import AccountingSearchBar from './AccountingSearchBar';
import SummaryCards from './SummaryCards';
import TransactionTable from './TransactionTable';
import FilterDialog from './FilterDialog';

const Accounting = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    type: 'ALL',
  });
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch payments with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['payments', filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);

      const response = await api.get(`${API_ENDPOINTS.PAYMENTS.BASE}?${params.toString()}`);
      return response.data.data;
    },
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (paymentId) => {
      const response = await api.post(API_ENDPOINTS.PAYMENTS.SEND_REMINDER(paymentId));
      return response.data;
    },
    onSuccess: () => {
      toast.success('Payment reminder sent successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    },
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async ({ paymentId, paymentDetails }) => {
      const response = await api.post(
        API_ENDPOINTS.PAYMENTS.MARK_PAID(paymentId),
        paymentDetails
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Payment marked as paid successfully');
      queryClient.invalidateQueries(['payments']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark payment as paid');
    },
  });

  const handleSendReminder = (paymentId) => {
    sendReminderMutation.mutate(paymentId);
  };

  const handleViewProof = (payment) => {
    // TODO: Implement proof of payment viewing
    toast.info('Proof of payment viewing coming soon');
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterDialog(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
      <div className="flex-shrink-0">
        <PageHeader
          title="Accounting"
          subtitle="Track payments, outstanding balances, and manage financial records"
        />

        <AccountingSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onFilter={() => setShowFilterDialog(true)}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Summary Cards */}
        {data?.summary && <SummaryCards summary={data.summary} />}

        {/* Transaction Table */}
        {isLoading ? (
          <LoadingState message="Loading payments..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load payments</p>
          </div>
        ) : (
          <TransactionTable
            payments={data?.payments || []}
            onSendReminder={handleSendReminder}
            onViewProof={handleViewProof}
            isLoading={sendReminderMutation.isPending}
          />
        )}
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        filters={filters}
        onApplyFilters={applyFilters}
      />
    </div>
  );
};

export default Accounting;

