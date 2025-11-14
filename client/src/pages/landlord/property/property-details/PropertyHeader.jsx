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
                    <h1 className="text-[32px] md:text-3xl font-bold">{property.title}</h1>
                    <p className="text-[16px] text-gray-600 font-semibold mt-1">{property.streetAddress}</p>
                </div>
                {showActions && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Button 
                            variant="outline" 
                            className={`text-[16px] rounded-2xl ${
                                property.status === 'ACTIVE' 
                                    ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50' 
                                    : property.status === 'RENTED' 
                                    ? 'border-orange-600 text-orange-700 hover:bg-orange-50'
                                    : 'border-gray-600 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Check className={`rounded-full text-white ${
                                property.status === 'ACTIVE' 
                                    ? 'bg-emerald-600' 
                                    : property.status === 'RENTED' 
                                    ? 'bg-orange-600'
                                    : 'bg-gray-600'
                            }`} />
                            {property.status === 'ACTIVE' ? 'Listed' : property.status === 'RENTED' ? 'Rented' : 'Draft'}
                        </Button>
                        <div className="flex flex-wrap gap-4">
                            <Button 
                                variant="outline" 
                                className="text-[16px] border-black rounded-2xl"
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