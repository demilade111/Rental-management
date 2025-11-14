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
    const [activeCard, setActiveCard] = useState('listing'); // 'listing', 'maintenance', 'tenancy'

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
                        showActions={activeCard === 'listing'}
                    />

                    <div className="px-4 md:px-8 py-2">
                        {/* Property Details - Only show when listing card is active */}
                        {activeCard === 'listing' && (
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
                        )}

                        {/* Maintenance History - Show when maintenance card is active (ABOVE owner notes) */}
                        {activeCard === 'maintenance' && (
                            <div className="mt-8">
                                <OwnerNotes 
                                    propertyId={id}
                                    activeCard={activeCard}
                                    showOnlyMaintenance={true}
                                />
                            </div>
                        )}

                        {/* Tenancy Info - Show when tenancy card is active (ABOVE owner notes) */}
                        {activeCard === 'tenancy' && (
                            <div className="mt-8 text-center py-12 text-gray-500 bg-white border border-gray-300 rounded-lg">
                                <p>Tenancy information will be displayed here.</p>
                            </div>
                        )}

                        {/* Owner Notes Section */}
                        <div className="mt-8 p-6">
                            <h2 className="text-[32px] font-bold mb-2">Owner Notes (Private Section)</h2>
                            {property.notes && (
                                <>
                                    <p className="text-[16px] text-gray-600 mb-6">{property.notes}</p>
                                    <p className="text-[16px] text-gray-700 mb-6">
                                        Here you can review your property's tenancy history and maintenance history; these details are private and will not be shared with applicants or tenants when the listing is published.
                                    </p>
                                </>
                            )}
                            
                            {/* Three Cards Section - At the bottom */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div
                                    onClick={() => setActiveCard('listing')}
                                    className={`rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                                        activeCard === 'listing'
                                            ? 'bg-black text-white'
                                            : 'bg-white border border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <h3 className="text-[28px] font-bold mb-1">Listing Details</h3>
                                    <p className={`text-[16px] mb-3 ${activeCard === 'listing' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Per Property
                                    </p>
                                    <p className={`text-[13px] ${activeCard === 'listing' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        View your listing details from rental info to amenities
                                    </p>
                                </div>
                                <div
                                    onClick={() => setActiveCard('maintenance')}
                                    className={`rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                                        activeCard === 'maintenance'
                                            ? 'bg-black text-white'
                                            : 'bg-white border border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <h3 className="text-[28px] font-bold mb-1">Maintenance Info</h3>
                                    <p className={`text-[16px] mb-3 ${activeCard === 'maintenance' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Per Property
                                    </p>
                                    <p className={`text-[13px] ${activeCard === 'maintenance' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        View all maintenance requests and history for this property
                                    </p>
                                </div>
                                <div
                                    onClick={() => setActiveCard('tenancy')}
                                    className={`rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                                        activeCard === 'tenancy'
                                            ? 'bg-black text-white'
                                            : 'bg-white border border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <h3 className="text-[28px] font-bold mb-1">Tenancy Info</h3>
                                    <p className={`text-[16px] mb-3 ${activeCard === 'tenancy' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Per Property
                                    </p>
                                    <p className={`text-[13px] ${activeCard === 'tenancy' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Monitor occupancy, current tenant info, tenant turnover, and lease duration
                                    </p>
                                </div>
                            </div>
                        </div>
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