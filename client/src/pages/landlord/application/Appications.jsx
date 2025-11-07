import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import api from "@/lib/axios";
import GenerateApplicationDialog from "./GenerateApplicationModal";
import ApplicationCard from "./ApplicationCard";
import LoadingState from "@/components/shared/LoadingState";
import ApplicationSearchBar from "./ApplicationSearchBar";
import PageHeader from "@/components/shared/PageHeader";
import FilterApplicationDialog from "./FilterApplicationDialog";
import { toast } from "sonner";
import { filterApplications } from "@/utils/filterApplications";
import { getAvailableListings } from "@/utils/getAvailableListings";
import ApplicationDetailsDialog from "./ApplicationDetailsDialog";
import LeaseRedirectModal from "./LeaseRedirectModal";
import { useAuthStore } from "@/store/authStore";
import Pagination from "@/components/shared/Pagination";
import BulkDeleteActionBar from "@/components/shared/BulkDeleteActionBar";
import { Checkbox } from "@/components/ui/checkbox";

// Shadcn/ui imports for modal
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Applications = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({ status: "", startDate: "", endDate: "" });
    const [showLeaseRedirectModal, setShowLeaseRedirectModal] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState(null);

    // State for Shadcn modal
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteUrl, setInviteUrl] = useState("");
    
    // State for bulk selection
    const [selectedItems, setSelectedItems] = useState(new Set());

    const { user } = useAuthStore();

    // Fetch listings
    const { data: listings = [], isLoading: listingsLoading } = useQuery({
        queryKey: ["listings", user?.id],
        queryFn: async () => {
            const res = await api.get(API_ENDPOINTS.LISTINGS.BASE);
            return res.data.listing;
        },
    });

    // Fetch applications
    const { data: applicationsData = {}, refetch: refetchApplications, isLoading: appsLoading } = useQuery({
        queryKey: ["applications", user?.id, page, limit],
        queryFn: async () => {
            const res = await api.get(`${API_ENDPOINTS.APPLICATIONS.BASE}?page=${page}&limit=${limit}`);
            // console.log(res.data)
            return res.data.data || res.data;
        },
    });

    // filter out listings that already have an active application
    const availableListings = getAvailableListings(listings, applicationsData.applications);

    // filtering applications by modal (frontend filtering)
    // Note: filterApplications always filters out non-ACTIVE listings, so filteredApps may be less than API total
    const filteredApps = filterApplications(applicationsData?.applications || [], searchQuery, filters);
    
    // Clear selection when filters or page change
    useEffect(() => {
        setSelectedItems(new Set());
    }, [searchQuery, filters.status, filters.startDate, filters.endDate, page]);
    
    // Check if user has applied explicit filters (search, status, dates)
    // Note: listing status filter (ACTIVE only) is always applied by filterApplications, so we don't count it
    const hasExplicitFilters = searchQuery.trim() !== "" || filters.status || filters.startDate || filters.endDate;
    
    // Calculate pagination totals
    // Since filterApplications always filters by listing status (ACTIVE only), we need to use filtered count
    // The displayed total should always match what's actually shown (filteredApps)
    const filteredTotal = filteredApps.length;
    const apiTotal = applicationsData?.pagination?.total || 0;
    
    // Always use filtered count for display total to match what's actually displayed
    // This ensures the total matches the visible items (since filterApplications always filters by ACTIVE)
    const displayTotal = filteredTotal;
    
    // For totalPages: When explicit filters are applied, calculate based on filtered count
    // When no explicit filters, use API total for proper pagination (but total will still show filtered count)
    const displayTotalPages = hasExplicitFilters 
        ? Math.ceil(filteredTotal / limit) || 1
        : Math.ceil(apiTotal / limit) || 1;
    
    // When explicit filters are applied, always show page 1 since we're filtering current page's data
    const displayPage = hasExplicitFilters ? 1 : (applicationsData?.pagination?.page || 1);

    // Mutation to update status
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await api.patch(`${API_ENDPOINTS.APPLICATIONS.BASE}/${id}/status`, { status });
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Application status updated");
            refetchApplications();
        },
        onError: () => toast.error("Failed to update status"),
    });

    const handleApprove = (id) => updateStatusMutation.mutate({ id, status: "APPROVED" });
    const handleReject = (id) => updateStatusMutation.mutate({ id, status: "REJECTED" });

    const handleSendLease = async (app) => {
        const listingId = app?.listing?.id;
        if (!listingId) return toast.error("Listing ID not found");

        try {
            const res = await api.get(`${API_ENDPOINTS.LISTINGS.BY_ID(listingId)}/check-leases`);
            const listInfo = res.data.data;

            if (!listInfo?.hasLease) {
                setRedirectUrl("/landlord/leases");
                setShowLeaseRedirectModal(true);
                setSelectedApplication(app); // Store the app to get listing name
                toast.error(`Cannot send lease. Listing doesn't have any lease attached.`);
                return;
            }

            let leaseRes = await api.get(`${API_ENDPOINTS.CUSTOM_LEASES.BY_LISTING_ID(listingId)}`);
            let lease = leaseRes.data.lease;
            let leaseType = "CUSTOM";

            if (!lease) {
                const defaultLease = await api.get(`${API_ENDPOINTS.LEASES.BY_LISTING_ID(listingId)}`);
                if (!defaultLease.data.lease) {
                    toast.error("No lease found for this listing");
                    return;
                }
                lease = defaultLease.data.lease;
                leaseType = "STANDARD";
            }

            const inviteRes = await api.post(`${API_ENDPOINTS.LEASES_INVITE.BASE}/${lease.id}/invite`, {
                tenantId: app.tenantId,
                leaseType,
            });

            const invite = inviteRes.data.invite;

            // Show modal instead of copying
            setInviteUrl(invite.url);
            setInviteModalOpen(true);

            // update tenant + status
            await api.put(`${API_ENDPOINTS.CUSTOM_LEASES.BY_ID(lease.id)}`, {
                tenantId: app.tenantId,
                listingId,
                leaseStatus: "ACTIVE",
            });

        } catch (err) {
            console.error(err);
            toast.error("Failed to check lease");
        }
    };

    const handleDelete = (id) => toast.success(`Application ${id} deleted`);
    const handleView = (app) => {
        setSelectedApplication(app);
        setDialogOpen(true);
    };

    // Handle selection change
    const handleSelectionChange = (id, checked) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            // Select all visible applications
            const allIds = new Set(filteredApps.map(app => app.id));
            setSelectedItems(allIds);
        } else {
            // Deselect all
            setSelectedItems(new Set());
        }
    };

    // Check if all visible items are selected
    const allSelected = filteredApps.length > 0 && filteredApps.every(app => selectedItems.has(app.id));
    const someSelected = filteredApps.some(app => selectedItems.has(app.id)) && !allSelected;

    // Handle bulk delete
    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids) => {
            const res = await api.post(`${API_ENDPOINTS.APPLICATIONS.BULK_DELETE}`, { ids });
            return res.data;
        },
        onSuccess: (data) => {
            const count = selectedItems.size;
            toast.success(data.message || data.data?.message || `Successfully deleted ${count} application(s)`);
            setSelectedItems(new Set());
            refetchApplications();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete applications");
        },
    });

    const handleBulkDelete = (ids) => {
        bulkDeleteMutation.mutate(Array.from(ids));
    };

    const handleClearSelection = () => {
        setSelectedItems(new Set());
    };

    return (
        <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
            <div className="flex-shrink-0">
                <PageHeader
                    title="Applications"
                    subtitle="Manage rental applications"
                    total={displayTotal}
                />

                <ApplicationSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onGenerateLink={() => setModalOpen(true)}
                    onFilter={() => setFilterModalOpen(true)}
                />
            </div>

            <div className="rounded overflow-hidden flex-1 flex flex-col min-h-0">
                {/* Table Header */}
                <div className={`grid grid-cols-[auto_1fr_1fr_1fr_1fr] mb-3 bg-gray-900 p-3 text-white font-semibold rounded-2xl gap-4 flex-shrink-0`}>
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={allSelected}
                            onCheckedChange={handleSelectAll}
                            className="data-[state=checked]:bg-white data-[state=checked]:border-white"
                        />
                    </div>
                    <div className="text-center">Applicant Info</div>
                    <div className="text-center border-l border-gray-200 pl-10">Listing Info</div>
                    <div className="text-center border-l border-gray-200 pl-10">Status</div>
                    <div className="text-center border-l border-gray-200 pl-10">Actions</div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {listingsLoading || appsLoading ? (
                        <LoadingState message="Loading applications..." />
                    ) : filteredApps.length > 0 ? (
                        filteredApps.map((app) => (
                            <ApplicationCard
                                key={app.id}
                                app={app}
                                onApprove={handleApprove}
                                onSendLease={handleSendLease}
                                onReject={handleReject}
                                onDelete={handleDelete}
                                onView={handleView}
                                isSelected={selectedItems.has(app.id)}
                                onSelectionChange={handleSelectionChange}
                            />
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">No applications found.</div>
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
                            // When explicit filters are applied, pagination is disabled since we only have current page data
                        }}
                    />
                </div>
            </div>

            {listings.length > 0 && (
                <GenerateApplicationDialog
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    listings={availableListings}
                    onGenerated={() => {
                        setModalOpen(false);
                        refetchApplications();
                    }}
                />
            )}

            <FilterApplicationDialog
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={(data) => setFilters(data)}
            />

            <ApplicationDetailsDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                application={selectedApplication}
            />

            <LeaseRedirectModal
                isOpen={showLeaseRedirectModal}
                onClose={() => {
                    setShowLeaseRedirectModal(false);
                    setSelectedApplication(null);
                }}
                redirectUrl={redirectUrl}
                listingName={selectedApplication?.listing?.title || selectedApplication?.listing?.streetAddress || "N/A"}
            />

            {/* Shadcn modal for invite URL */}
            <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                <DialogContent className="sm:max-w-lg p-8">
                    <DialogHeader>
                        <DialogTitle>Lease Sign Link</DialogTitle>
                        <DialogDescription>
                            Share this link with the tenant to sign the lease.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <Input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={inviteUrl}
                            readOnly
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(inviteUrl);
                                toast.success("Copied!");
                            }}
                            className="rounded-2xl"
                        >
                            Copy
                        </Button>
                        <Button className="rounded-2xl" variant="secondary" onClick={() => setInviteModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Action Bar */}
            <BulkDeleteActionBar
                selectedItems={Array.from(selectedItems)}
                onDelete={handleBulkDelete}
                onClearSelection={handleClearSelection}
                resourceName="applications"
                isDeleting={bulkDeleteMutation.isPending}
            />
        </div>
    );
};

export default Applications;
