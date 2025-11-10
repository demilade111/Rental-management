import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import api from "@/lib/axios";
import StandardLeaseCard from "./StandardLeaseCard";
import LoadingState from "@/components/shared/LoadingState";
import StandardLeaseSearchBar from "./StandardLeaseSearchBar";
import FilterStandardLeaseDialog from "./FilterStandardLeaseDialog";
import Pagination from "@/components/shared/Pagination";
import BulkDeleteActionBar from "@/components/shared/BulkDeleteActionBar";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import CreateLeaseModal from "./lease-modal/CreateLeaseModal";

const StandardLeases = ({ onTotalChange }) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ status: "", startDate: "", endDate: "" });
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedLease, setSelectedLease] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());

    const queryClient = useQueryClient();

    // Fetch standard leases
    const { data: standardLeases = [], isLoading, refetch } = useQuery({
        queryKey: ["leases"],
        queryFn: async () => {
            const res = await api.get(API_ENDPOINTS.LEASES.BASE);
            const data = res.data;
            return Array.isArray(data) ? data : data.data || [];
        },
    });

    // Filter standard leases by search and filters (frontend filtering)
    const filteredLeases = standardLeases.filter((lease) => {
        // Search filter
        const tenantName = `${lease.tenant?.firstName || ''} ${lease.tenant?.lastName || ''}`.toLowerCase();
        const landlordName = `${lease.landlord?.firstName || ''} ${lease.landlord?.lastName || ''}`.toLowerCase();
        const matchSearch =
            !searchQuery.trim() ||
            tenantName.includes(searchQuery.toLowerCase()) ||
            landlordName.includes(searchQuery.toLowerCase()) ||
            lease.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lease.listing?.streetAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lease.propertyAddress?.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchStatus = !filters.status || lease.leaseStatus === filters.status;

        // Date range filter (based on startDate)
        let matchDateRange = true;
        if (filters.startDate || filters.endDate) {
            const leaseDate = new Date(lease.startDate);
            if (filters.startDate) {
                const startDate = new Date(filters.startDate);
                matchDateRange = matchDateRange && leaseDate >= startDate;
            }
            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                matchDateRange = matchDateRange && leaseDate <= endDate;
            }
        }

        return matchSearch && matchStatus && matchDateRange;
    });

    // Check if user has applied explicit filters (search or filter criteria)
    const hasExplicitFilters = searchQuery.trim() !== "" || 
        filters.status !== "" || 
        filters.startDate !== "" || 
        filters.endDate !== "";

    // Calculate pagination totals
    const filteredTotal = filteredLeases.length;
    const apiTotal = standardLeases.length;

    // For display: use filtered count when filters are active, otherwise use API total
    const displayTotal = hasExplicitFilters ? filteredTotal : apiTotal;
    const displayTotalPages = Math.ceil(displayTotal / limit);
    const displayPage = hasExplicitFilters ? 1 : page;

    // Notify parent of total change
    useEffect(() => {
        if (onTotalChange) {
            onTotalChange(displayTotal);
        }
    }, [displayTotal, onTotalChange]);

    // Paginate filtered leases
    const paginatedLeases = filteredLeases.slice((displayPage - 1) * limit, displayPage * limit);

    // Clear selection and reset page when filters or search change
    useEffect(() => {
        setSelectedItems(new Set());
        setPage(1);
    }, [searchQuery, filters]);
    
    // Clear selection when page changes
    useEffect(() => {
        setSelectedItems(new Set());
    }, [page]);

    // Handle selection
    const handleSelectionChange = (leaseId, checked) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(leaseId);
            } else {
                newSet.delete(leaseId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(new Set(paginatedLeases.map((lease) => lease.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const allSelected = paginatedLeases.length > 0 && paginatedLeases.every((lease) => selectedItems.has(lease.id));
    const someSelected = paginatedLeases.some((lease) => selectedItems.has(lease.id)) && !allSelected;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (leaseId) => {
            await api.delete(`${API_ENDPOINTS.LEASES.BASE}/${leaseId}`);
        },
        onSuccess: () => {
            toast.success("Lease deleted successfully");
            queryClient.invalidateQueries(["leases"]);
            setDeleteDialogOpen(false);
            setSelectedLease(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete lease");
        },
    });

    // Bulk delete mutation
    const bulkDeleteMutation = useMutation({
        mutationFn: async (leaseIds) => {
            await api.post(API_ENDPOINTS.LEASES.BULK_DELETE, { ids: leaseIds });
        },
        onSuccess: () => {
            toast.success(`${selectedItems.size} lease(s) deleted successfully`);
            queryClient.invalidateQueries(["leases"]);
            setSelectedItems(new Set());
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete leases");
        },
    });

    // Handlers
    const handleViewDetails = (lease) => {
        setSelectedLease(lease);
        setViewDetailsOpen(true);
    };

    const handleDelete = (lease) => {
        setSelectedLease(lease);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedLease) {
            deleteMutation.mutate(selectedLease.id);
        }
    };

    const handleBulkDelete = () => {
        bulkDeleteMutation.mutate(Array.from(selectedItems));
    };

    const handleClearSelection = () => {
        setSelectedItems(new Set());
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setFilterModalOpen(false);
    };

    const handleResetFilters = () => {
        setFilters({ status: "", startDate: "", endDate: "" });
    };

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                {/* Search Bar */}
                <div className="flex-shrink-0 mb-4">
                    <StandardLeaseSearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onFilterClick={() => setFilterModalOpen(true)}
                        onNewLease={() => setShowCreateModal(true)}
                        filters={filters}
                        onResetFilters={handleResetFilters}
                    />
                </div>

                {/* Select All Checkbox */}
                <div className="flex-shrink-0 flex items-center gap-3 mb-2">
                    <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        className="!border-black"
                        indeterminate={someSelected}
                    />
                    <span className="text-sm text-gray-600">
                        {allSelected ? "Deselect all" : "Select all"}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                        <LoadingState message="Loading standard leases..." />
                    ) : paginatedLeases.length > 0 ? (
                        paginatedLeases.map((lease) => (
                            <StandardLeaseCard
                                key={lease.id}
                                lease={lease}
                                onViewDetails={handleViewDetails}
                                onDelete={handleDelete}
                                isSelected={selectedItems.has(lease.id)}
                                onSelectionChange={handleSelectionChange}
                                onRefresh={refetch}
                            />
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">No standard leases found.</div>
                    )}
                </div>

                {/* Pagination - Inside table container */}
                <div className="flex-shrink-0 mt-4">
                    <Pagination
                        page={displayPage}
                        totalPages={displayTotalPages}
                        totalItems={displayTotal}
                        onPageChange={(newPage) => {
                            if (!hasExplicitFilters) {
                                setPage(newPage);
                            }
                        }}
                    />
                </div>
            </div>

            {/* Bulk Delete Action Bar */}
            {selectedItems.size > 0 && (
                <BulkDeleteActionBar
                    selectedItems={Array.from(selectedItems)}
                    onDelete={handleBulkDelete}
                    onClearSelection={handleClearSelection}
                    resourceName="leases"
                    isDeleting={bulkDeleteMutation.isPending}
                />
            )}

            {/* Filter Dialog */}
            <FilterStandardLeaseDialog
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                filters={filters}
                onApply={handleApplyFilters}
            />

            {/* Create Lease Modal */}
            <CreateLeaseModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    refetch();
                    setShowCreateModal(false);
                }}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lease</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this lease? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Details Dialog */}
            <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-8">
                    <DialogHeader>
                        <DialogTitle>Lease Details</DialogTitle>
                        <DialogDescription>
                            View complete lease information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLease && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tenant</p>
                                    <p className="text-sm">{selectedLease.tenant?.firstName} {selectedLease.tenant?.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Landlord</p>
                                    <p className="text-sm">{selectedLease.landlord?.firstName} {selectedLease.landlord?.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Property</p>
                                    <p className="text-sm">{selectedLease.listing?.title || selectedLease.propertyAddress}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="text-sm capitalize">{selectedLease.leaseStatus?.toLowerCase()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Start Date</p>
                                    <p className="text-sm">{new Date(selectedLease.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">End Date</p>
                                    <p className="text-sm">{new Date(selectedLease.endDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Rent Amount</p>
                                    <p className="text-sm">${selectedLease.rentAmount?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Payment Frequency</p>
                                    <p className="text-sm capitalize">{selectedLease.paymentFrequency?.toLowerCase()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StandardLeases;

