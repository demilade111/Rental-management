import { useState } from "react";
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
        queryKey: ["applications", page, limit],
        queryFn: async () => {
            const res = await api.get(`${API_ENDPOINTS.APPLICATIONS.BASE}?page=${page}&limit=${limit}`);
            return res.data.data || res.data;
        },
    });

    // filter out listings that already have an active application
    const availableListings = getAvailableListings(listings, applicationsData.applications);

    // filtering applications by modal
    const filteredApps = filterApplications(applicationsData?.applications || [], searchQuery, filters);

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

    // --- Option 1: send lease directly using listingId ---
    const handleSendLease = async (app) => {
        const listingId = app?.listing?.id;
        if (!listingId) return toast.error("Listing ID not found");

        try {
            const res = await api.get(`${API_ENDPOINTS.LISTINGS.BY_ID(listingId)}/check-leases`);
            const listInfo = res.data.data; // { listingId, hasLease, leaseCount }

            if (!listInfo?.hasLease) {
                setRedirectUrl("/landlord/leases");
                setShowLeaseRedirectModal(true);
                toast.error(`Cannot send lease. Listing doesn't have any lease attached.`);
                return;
            }

            // need to check for both CUSTOM_LEASES ans LEASES
            const leaseRes = await api.get(`${API_ENDPOINTS.CUSTOM_LEASES.BY_LISTING_ID(listingId)}`);
            const lease = leaseRes.data.lease;

            if (!lease) return toast.error("Custom lease not found");
            console.log(app)

            let leaseType = null;

            // generate the sign up link for the contact for that lease.
            if (!lease) {
                const defaultLease = await api.get(`${API_ENDPOINTS.LEASES.BY_LISTING_ID(listingId)}`);

                if (!defaultLease.data.lease) {
                    toast.error("No lease found for this listing");
                    return;
                }

                lease = defaultLease.data.lease;
                leaseType = "STANDARD";
            } else {
                leaseType = "CUSTOM";
            }

            console.log(leaseType)

            const inviteRes = await api.post(`${API_ENDPOINTS.LEASES_INVITE.BASE}/${lease.id}/invite`, {
                tenantId: app.tenantId,
                leaseType: leaseType, // "STANDARD" or "CUSTOM"
            });

            console.log(inviteRes)

            const invite = inviteRes.data.invite;
            navigator.clipboard.writeText(invite.url);
            toast.success("Lease sign link copied!");

            // update tenant + status
            await api.put(`${API_ENDPOINTS.CUSTOM_LEASES.BY_ID(lease.id)}`, {
                tenantId: app.tenantId,
                listingId,
                leaseStatus: "ACTIVE", // still need to be DFAFT until the user sign the contract
            });

            toast.success(`Lease sent for application ${app.id}`);
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

    return (
        <div className="min-h-screen px-4 md:px-8 py-4">
            <PageHeader
                title="Applications"
                subtitle="Manage rental applications"
                total={applicationsData?.pagination?.total || 0}
            />

            <ApplicationSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onGenerateLink={() => setModalOpen(true)}
                onFilter={() => setFilterModalOpen(true)}
            />

            <div className="rounded overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-4 mb-3 bg-gray-900 p-4 text-white font-semibold rounded-2xl text-center divide-x divide-gray-200">
                    <div>Applicant Info</div>
                    <div>Listing Info</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
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
                            />
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">No applications found.</div>
                    )}
                </div>

                <Pagination
                    page={applicationsData?.pagination?.page || 1}
                    totalPages={applicationsData?.pagination?.totalPages || 1}
                    totalItems={applicationsData?.pagination?.total || 0}
                    onPageChange={(newPage) => setPage(newPage)}
                />
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
                onClose={() => setShowLeaseRedirectModal(false)}
                redirectUrl={redirectUrl}
            />
        </div>
    );
};

export default Applications;
