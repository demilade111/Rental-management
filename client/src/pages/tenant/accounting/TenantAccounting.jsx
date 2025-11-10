import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apiEndpoints';
import LoadingState from '@/components/shared/LoadingState';
import TenantPaymentTable from './TenantPaymentTable';
import TenantPaymentSummary from './TenantPaymentSummary';
import Pagination from '@/components/shared/Pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon, X, Search } from 'lucide-react';
import { format } from 'date-fns';

const TenantAccounting = () => {
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Fetch all tenant payments once
    const { data: paymentsData = [], isLoading: loadingPayments } = useQuery({
        queryKey: ['tenant-payments'],
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

    // Client-side filtering - instant search
    const filteredPayments = useMemo(() => {
        let filtered = paymentsData;

        // Filter by search term
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter((payment) => {
                const listing = payment.lease?.listing || payment.customLease?.listing;
                const inNotes = payment.notes?.toLowerCase().includes(lowerSearch);
                const inTitle = listing?.title?.toLowerCase().includes(lowerSearch);
                const inAddress = listing?.streetAddress?.toLowerCase().includes(lowerSearch);
                const inCity = listing?.city?.toLowerCase().includes(lowerSearch);
                const inType = payment.type?.toLowerCase().includes(lowerSearch);
                const inAmount = payment.amount?.toString().includes(lowerSearch);
                
                return inNotes || inTitle || inAddress || inCity || inType || inAmount;
            });
        }

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((payment) => payment.status === statusFilter);
        }

        // Filter by type
        if (typeFilter !== 'ALL') {
            filtered = filtered.filter((payment) => payment.type === typeFilter);
        }

        // Filter by date range (based on dueDate or paidDate)
        if (startDate || endDate) {
            filtered = filtered.filter((payment) => {
                // Use paidDate if paid, otherwise use dueDate
                const paymentDate = payment.status === 'PAID' && payment.paidDate 
                    ? new Date(payment.paidDate)
                    : new Date(payment.dueDate);
                
                let matchDateRange = true;
                
                if (startDate) {
                    matchDateRange = matchDateRange && paymentDate >= startDate;
                }
                
                if (endDate) {
                    // Adjust end date to include the entire day
                    const adjustedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
                    matchDateRange = matchDateRange && paymentDate < adjustedEnd;
                }
                
                return matchDateRange;
            });
        }

        return filtered;
    }, [paymentsData, searchTerm, statusFilter, typeFilter, startDate, endDate]);

    // Check if user has applied explicit filters
    const hasExplicitFilters = searchTerm.trim() !== "" || 
        statusFilter !== "ALL" || 
        typeFilter !== "ALL" ||
        startDate !== null ||
        endDate !== null;

    // Calculate pagination totals
    const filteredTotal = filteredPayments.length;
    const apiTotal = paymentsData.length;

    // For display: use filtered count when filters are active, otherwise use API total
    const displayTotal = hasExplicitFilters ? filteredTotal : apiTotal;
    const displayTotalPages = Math.ceil(displayTotal / limit);
    const displayPage = hasExplicitFilters ? 1 : page;

    // Paginate filtered payments
    const paginatedPayments = useMemo(() => {
        return filteredPayments.slice((displayPage - 1) * limit, displayPage * limit);
    }, [filteredPayments, displayPage, limit]);

    // Fetch payment summary
    const { data: summary = {}, isLoading: loadingSummary } = useQuery({
        queryKey: ['tenant-payment-summary'],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.PAYMENTS.SUMMARY);
            const data = response.data;
            
            // Handle different response structures
            if (data.data) return data.data;
            return data || {};
        },
        enabled: !!user,
    });

    // Only show full page loading on initial load (when summary is loading)
    if (loadingSummary) {
        return (
            <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
                <LoadingState message="Loading payment information..." />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
            {/* Header */}
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Payments</h1>
                <p className="text-gray-600 mt-1">View your rent payments, deposits, and transaction history</p>
            </div>

            {/* Summary Cards */}
            <div className="flex-shrink-0 mb-6">
                <TenantPaymentSummary summary={summary} />
            </div>

            {/* Search and Filters */}
            <div className="flex-shrink-0 mb-4 flex flex-col md:flex-row gap-3 md:justify-between">
                {/* Left: Search */}
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-300"
                    />
                </div>

                {/* Right: Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING">Outstanding</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Type Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="RENT">Rent</SelectItem>
                            <SelectItem value="UTILITIES">Utilities</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Start Date */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full sm:w-[150px] justify-start text-left font-normal ${!startDate ? "text-gray-400" : ""}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "MMM d") : "Start Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="p-0">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                    setStartDate(date);
                                    if (endDate && date > endDate) {
                                        setEndDate(null);
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    {/* End Date */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full sm:w-[150px] justify-start text-left font-normal ${!endDate ? "text-gray-400" : ""}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "MMM d") : "End Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="p-0">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                disabled={(date) => startDate && date < startDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Clear Date Filter Button */}
                    {(startDate || endDate) && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStartDate(null);
                                setEndDate(null);
                            }}
                            className="w-full sm:w-auto"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Container with Pagination */}
            <div className="rounded overflow-hidden flex-1 flex flex-col min-h-0">
                {/* Payment Table */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <TenantPaymentTable payments={paginatedPayments} isLoading={loadingPayments} />
                </div>

                {/* Pagination - Below table */}
                {displayTotal > 0 && (
                    <div className="flex-shrink-0 mt-4">
                        <Pagination
                            page={displayPage}
                            totalPages={displayTotalPages || 1}
                            totalItems={displayTotal}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantAccounting;

