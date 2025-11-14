import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const PropertyAmenities = ({ amenities = [] }) => {
    const [showAllDialog, setShowAllDialog] = useState(false);
    
    // Show only first 6 amenities (2 rows) initially
    const maxDisplayed = 6;
    const hasMore = amenities.length > maxDisplayed;
    const displayedAmenities = hasMore ? amenities.slice(0, maxDisplayed) : amenities;
    
    return (
        <>
            <div className="bg-white border border-gray-400 rounded-lg p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[24px] font-bold">Amenities</h2>
                    {hasMore && (
                        <button 
                            onClick={() => setShowAllDialog(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Read All
                        </button>
                    )}
                </div>

                {amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 content-start">
                        {displayedAmenities.map((amenity) => (
                            <div key={amenity.id} className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-white bg-black rounded-full" />
                                <span className="capitalize text-black">{amenity.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No amenities listed.</p>
                )}
            </div>

            {/* All Amenities Dialog */}
            <Dialog open={showAllDialog} onOpenChange={setShowAllDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[24px] font-bold">All Amenities</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {amenities.map((amenity) => (
                                <div key={amenity.id} className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-white bg-black rounded-full flex-shrink-0" />
                                    <span className="capitalize text-black">{amenity.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PropertyAmenities;