import React, { useState } from 'react';
import PropertyHeader from './property-details/PropertyHeader';
import PropertyImages from './property-details/PropertyImages';
import PropertyDescription from './property-details/PropertyDescription';
import RentalInformation from './property-details/RentalInformation';
import PropertyDetailsCard from './property-details/PropertyDetailsCard';
import PropertyAmenities from './property-details/PropertyAmenities';
import ContactInfo from './property-details/ContactInfo';
import AddressCard from './property-details/AddressCard';
import NeighbourhoodScore from './property-details/NeighbourhoodScore';
import OwnerNotes from './property-details/OwnerNotes';
import NewListingModal from './NewListingModal';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apiEndpoints';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { getRentCycleLabel } from '@/constants/rentCycles';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const { data: property, isLoading, isError, error } = useQuery({
        queryKey: ['property', id],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.LISTINGS.BY_ID(id));
            return response.data.data;
        },
    });

    // Show edit modal
    const handleEdit = () => {
        setShowEditModal(true);
    };

    // Show delete confirmation dialog
    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    // Confirm and execute delete
    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(API_ENDPOINTS.LISTINGS.BY_ID(id));
            toast.success('Property deleted successfully');
            
            // Invalidate queries and navigate back
            queryClient.invalidateQueries(['listings']);
            navigate('/landlord/portfolio');
        } catch (error) {
            console.error('Error deleting property:', error);
            toast.error('Failed to delete property');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    console.log('Fetched property:', property);

    return (
        <div className="h-full overflow-y-auto bg-white">

            {isLoading && <LoadingState message="Loading property details..." />}
            {isError && <ErrorState message={error.message} />}
            {!isLoading && !isError && !property && <EmptyState message="Property not found" />}
            {!isLoading && !isError && property && (
                <>
                    <PropertyHeader 
                        property={property}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                    />

                    <div className="px-4 md:px-8 py-2">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="flex flex-col gap-6 h-full">
                                {/* Property Images */}
                                <div className="h-[400px]">
                                    <PropertyImages images={property.images} />
                                </div>

                                {/* Rental Info and Property Details - Side by Side */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <RentalInformation
                                        term={getRentCycleLabel(property.rentCycle)}
                                        rent={property.rentAmount}
                                        available={property.availableDate}
                                        deposit={property.securityDeposit}
                                    />
                                    <PropertyDetailsCard
                                        type={property.propertyType}
                                        yearBuilt={property.yearBuilt}
                                        size={property.totalSquareFeet}
                                        bedrooms={property.bedrooms}
                                        bathrooms={property.bathrooms}
                                    />
                                </div>

                                {/* Property Amenities - flex-1 to fill remaining space */}
                                <div className="flex-1">
                                    <PropertyAmenities amenities={property.amenities} />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-3 h-full">
                                {/* Property Description */}
                                <PropertyDescription description={property.description} />
                                
                                {/* Contact Info */}
                                <ContactInfo
                                    ownerName={property.propertyOwner}
                                    ownerPhone={property.phoneNumber}
                                    ownerEmail={property.email}
                                />

                                {/* Address with Map */}
                                <div className="mt-3">
                                    <AddressCard fullAddress={property.fullAddress} zipCode={property.zipCode} />
                                </div>
                                
                                {/* Neighbourhood Score */}
                                <NeighbourhoodScore />
                            </div>
                        </div>

                        <OwnerNotes notes={property.notes} />
                    </div>
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this property? This action cannot be undone.
                            All data associated with this property will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Property Modal */}
            <NewListingModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                initialData={property}
                propertyId={id}
            />
        </div>
    );
};

export default PropertyDetails;