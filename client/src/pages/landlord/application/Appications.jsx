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
import { useListingLeaseCheck } from "@/services/listingServices";
import LeaseRedirectModal from "./LeaseRedirectModal";
import { useAuthStore } from "@/store/authStore";
import Pagination from "@/components/shared/Pagination";

const Applications = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); // items per page
    const [modalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        startDate: "",
        endDate: "",
    });
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

    // Fetch applications - no refetching on search typing
    const { data: applicationsData = {}, refetch: refetchApplications, isLoading: appsLoading } = useQuery({
        queryKey: ["applications", page, limit],
        queryFn: async () => {
            const res = await api.get(`${API_ENDPOINTS.APPLICATIONS.BASE}?page=${page}&limit=${limit}`);
            return res.data.data || res.data;
        },
    });

    const { data: listInfo, isLoading } = useListingLeaseCheck(selectedListingId);

    // filter out listings that already have an active application
    const availableListings = getAvailableListings(listings, applicationsData.applications);

    // filtering applications by modal
    const filteredApps = filterApplications(applicationsData?.applications || [], searchQuery, filters);

    // Mutation to update status
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await api.patch(`${API_ENDPOINTS.APPLICATIONS.BASE}/${id}/status`, { status });
            return res.data.data; // assuming your controller returns { data: result }
        },
        onSuccess: (updatedApp) => {
            toast.success(`Application ${updatedApp.application.status.toLowerCase()}`);
            // Option 1: refetch the whole applications list
            refetchApplications();
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to update status");
        },
    });

    const handleApprove = (id) => updateStatusMutation.mutate({ id, status: "APPROVED" });
    const handleReject = (id) => updateStatusMutation.mutate({ id, status: "REJECTED" });
    const handleSendLease = (app) => {

        setSelectedListingId(app?.listing.id); // triggers hook
        // console.log(leaseInfo)

        if (!listInfo?.hasLease) {
            setRedirectUrl("/landlord/leases");
            setShowLeaseRedirectModal(true);
            toast.error(`Cannot send lease. Listing doesn't have any lease attcahed it.`);
            return;
        }
        // proceed to send lease
        toast.success(`Lease sent for application ${app.id}`);
    };

    const handleDelete = (id) => {
        toast.success(`Application ${id} deleted`);
    };

    const handleView = (app) => {
        setSelectedApplication(app);
        setDialogOpen(true);
    };

    return (
        <div className="min-h-screen px-4 md:px-8 py-4">
            <PageHeader title="Applications" subtitle="Manage rental applications" total={applicationsData?.pagination?.total || 0} />

            {/* Search Bar */}
            <ApplicationSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onGenerateLink={() => setModalOpen(true)}
                onFilter={() => setFilterModalOpen(true)}
            />

            {/* Applications Table */}
            <div className="rounded overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-4 mb-3 bg-gray-900 p-4 text-white font-semibold rounded-2xl text-center divide-x divide-gray-200">
                    <div className="flex items-center justify-center px-4">Applicant Info</div>
                    <div className="flex items-center justify-center px-4">Listing Info</div>
                    <div className="flex items-center justify-center px-4">Status</div>
                    <div className="flex items-center justify-center px-4">Actions</div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {listingsLoading || appsLoading ? (
                        // Show loading state only for table body
                        <LoadingState message="Loading applications..." />
                    ) : (
                        filteredApps.length > 0 ? (
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
                        )
                    )}
                </div>

                <Pagination
                    page={applicationsData?.pagination?.page || 1}
                    totalPages={applicationsData?.pagination?.totalPages || 1}
                    totalItems={applicationsData?.pagination?.total || 0}
                    onPageChange={(newPage) => setPage(newPage)}
                />

            </div>

            {/* Generate Application Dialog */}
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

            {/* Filter Applications Dialog */}
            <FilterApplicationDialog
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={(data) => setFilters(data)}
            />

            {/* Application Details Dialog */}
            <ApplicationDetailsDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                application={selectedApplication}
            />

            {/* lease redirect modal */}
            <LeaseRedirectModal
                isOpen={showLeaseRedirectModal}
                onClose={() => setShowLeaseRedirectModal(false)}
                redirectUrl={redirectUrl}
            />
        </div>

    );
};

export default Applications;
