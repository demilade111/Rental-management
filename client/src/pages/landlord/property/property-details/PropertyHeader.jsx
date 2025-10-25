import React from 'react';
import { Check, Download, Edit, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PropertyHeader = ({ property }) => {
    return (
        <div className="px-4 md:px-8 py-4">
            <div className="flex flex-col space-y-10">
                <div>
                    <h1 className="text-[32px] md:text-3xl font-bold">{property.name}</h1>
                    <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Button variant="outline" className="text-[16px] border-black rounded-2xl">
                        <Check className="bg-black rounded-full text-white" />
                        Marked Listed
                    </Button>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline" className="text-[16px] border-black rounded-2xl">
                            <Edit />
                            Edit
                        </Button>
                        <Button className="text-[16px] border-black rounded-2xl">
                            <Download />
                            PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="border-0 text-gray-700 shadow-none text-[16px] border-black rounded-2xl"
                        >
                            <Trash2 />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyHeader;