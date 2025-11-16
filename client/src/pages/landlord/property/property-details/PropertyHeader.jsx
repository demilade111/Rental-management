import React from 'react';
import { Check, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PropertyHeader = ({ 
    property, 
    onEdit,
    onDelete, 
    isDeleting = false,
    showActions = true 
}) => {
    return (
        <div className="px-4 md:px-8 py-4">
            <div className="flex flex-col space-y-10">
                <div>
                    <h1 className="text-[32px] md:text-3xl font-bold text-primary">{property.title}</h1>
                    <p className="text-[16px] text-gray-600 font-semibold mt-1">{property.streetAddress}</p>
                </div>
                {showActions && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Button 
                            className={`text-[16px] rounded-2xl border ${
                                property.status === 'ACTIVE'
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
                                    : property.status === 'RENTED'
                                    ? 'bg-orange-500 text-white hover:bg-orange-500/90 border-orange-500'
                                    : 'bg-gray-500 text-white hover:bg-gray-500/90 border-gray-500'
                            }`}
                        >
                            <Check className={`rounded-full ${
                                property.status === 'ACTIVE'
                                    ? 'text-primary bg-white'
                                    : property.status === 'RENTED'
                                    ? 'text-orange-600 bg-white'
                                    : 'text-gray-600 bg-white'
                            }`} />
                            {property.status === 'ACTIVE' ? 'Listed' : property.status === 'RENTED' ? 'Rented' : 'Draft'}
                        </Button>
                        <div className="flex flex-wrap gap-4">
                            <Button 
                                className="text-[16px] rounded-2xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 border border-primary"
                                onClick={onEdit}
                                disabled={isDeleting}
                            >
                                <Edit />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                className="border-0 text-red-600 hover:text-red-700 shadow-none text-[16px] rounded-2xl"
                                onClick={onDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyHeader;