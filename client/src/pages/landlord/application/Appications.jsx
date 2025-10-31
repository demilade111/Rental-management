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

const Applications = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        startDate: "",
        endDate: "",
    });

    // Fetch listings
    const { data: listings = [], isLoading: listingsLoading } = useQuery({
        queryKey: ["listings"],
        queryFn: async () => {
            const res = await api.get(API_ENDPOINTS.LISTINGS.BASE);
            return res.data.listing;
        },
    });

    // Fetch applications - no refetching on search typing
    const { data: applications = [], refetch: refetchApplications, isLoading: appsLoading } = useQuery({
        queryKey: ["applications"],
        queryFn: async () => {
            const res = await api.get(API_ENDPOINTS.APPLICATIONS.BASE);
            return res.data.data || res.data;
        },
    });

    // Filter Applications
    const filteredApps = applications.filter((app) => {
        const matchSearch =
            app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchStatus = filters.status
            ? app.status === filters.status
            : true;

        const submissionDate = new Date(app.createdAt);

        const matchStart = filters.startDate
            ? submissionDate >= new Date(filters.startDate)
            : true;

        const matchEnd = filters.endDate
            ? submissionDate <= new Date(filters.endDate)
            : true;

        return matchSearch && matchStatus && matchStart && matchEnd;
    });

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
    const handleSendLease = (id) => {
        toast.success(`Lease sent for application ${id}`);
    };
    const handleDelete = (id) => {
        toast.success(`Application ${id} deleted`);
    };

    return (
        <div className="min-h-screen px-4 md:px-8 py-4">
            <PageHeader title="Applications" subtitle="Manage rental applications" />

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
                            />
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">No applications found.</div>
                    )
                )}
            </div>

            {/* Generate Application Dialog */}
            {listings.length > 0 && (
                <GenerateApplicationDialog
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    listings={listings}
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
        </div>

    );
};

export default Applications;
