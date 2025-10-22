import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AmenitiesSection } from './AmenitiesSection';
import PhotoUploadSection from './PhotoUploadSection';

const NewListingModal = ({ isOpen, onClose }) => {
    const [date, setDate] = React.useState(null);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">New Listing</DialogTitle>
                        <Button variant="outline" className="border-gray-300">
                            Save as Draft
                        </Button>
                    </div>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6">
                    <div className="space-y-6 pb-6">
                        {/* property details section */}
                        <div className="border-b border-gray-300 space-y-6 pb-8">
                            <div>
                                <label className="block text-sm font-medium mb-2">Property Title</label>
                                <Input placeholder="Enter property name" className="w-full" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Property Type</label>
                                <select className="w-full text-gray-600 text-sm p-2 border border-gray-300 rounded-md" defaultValue="">
                                    <option value="" disabled>Select property type</option>
                                    <option>Residential: House</option>
                                    <option>Commercial: Retail</option>
                                    <option>Commercial: Office</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Property Owner</label>
                                <Input placeholder="Enter full legal name" className="w-full" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Bedrooms</label>
                                    <Input type="number" placeholder="0" className="w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Bathrooms</label>
                                    <Input type="number" placeholder="0" className="w-full" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Total Square Feet</label>
                                    <Input type="number" className="w-full" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Year Built</label>
                                    <Input type="number" className="w-full" />
                                </div>
                            </div>
                        </div>

                        {/* property address section */}
                        <div className="border-b border-gray-300 space-y-6 pb-8">
                            <div>
                                <label className="block text-sm font-medium mb-2">Country</label>
                                <select className="w-full text-sm p-2 border border-gray-300 rounded-md">
                                    <option value="" disabled>Select country</option>
                                    <option>Canada</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">State</label>
                                    <select className="w-full p-2 text-sm border border-gray-300 rounded-md">
                                        <option value="" disabled>Select state</option>
                                        <option>BC</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <select className="w-full text-sm p-2 border border-gray-300 rounded-md">
                                        <option value="" disabled>Select city</option>
                                        <option>Vancouver</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Street Address</label>
                                <textarea
                                    className="w-full text-sm p-2 border border-gray-300 bg-gray-100 rounded-md min-h-[120px]"
                                    placeholder="Enter full address.."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">ZIP</label>
                                <Input className="w-1/2" />
                            </div>
                        </div>

                        {/* rental information section */}
                        <div className="border-b border-gray-300 space-y-6 pb-8">
                            <div>
                                <label className="block text-sm font-medium mb-2">Rent Cycle</label>
                                <select className="w-full text-sm p-2 border border-gray-300 rounded-md">
                                    <option value="" disabled>Select rent cycle</option>
                                    <option>Month to Month</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rent</label>
                                    <Input placeholder="$ 1,200" className="w-full text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Security Deposit</label>
                                    <Input placeholder="$ 600" className="w-full text-sm" />
                                </div>
                            </div>

                            {/* available date picker */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Available From</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-1/2 justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
                                                !date && "text-gray-600"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* property description section */}
                        <div className="border-b border-gray-300 space-y-6 pb-8">
                            <div>
                                <label className="block text-sm font-medium mb-2">Property Description</label>
                                <textarea
                                    className="w-full p-2 text-sm border border-gray-300 bg-gray-100 rounded-md min-h-[120px]"
                                    placeholder="Describe your property, its features and amenities etc.."
                                />
                            </div>
                        </div>

                        {/* amenities section */}
                        <div className="border-b border-gray-300 space-y-6 pb-8">
                            <label className="block text-sm font-medium mb-2">Amenities</label>
                            <AmenitiesSection />
                        </div>

                        {/* photos upload section */}
                        <div className="border-b border-gray-300 space-y-6 pb-8">
                            <label className="block text-sm font-medium mb-2">Photos</label>
                            <PhotoUploadSection />
                        </div>

                        {/* contact infos section */}
                        <div className="border-b border-gray-300 space-y-6 pb-8">
                            <label className="block text-sm font-medium mb-2">Contact Information</label>
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <Input placeholder="Enter your name or property manager" className="w-full" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                <Input placeholder="555-000-1122" type="number" className="w-full" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <Input placeholder="contact@example.com" type="email" className="w-full" />
                            </div>
                        </div>

                        {/* property notes section */}
                        <div className="pb-8">
                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    className="w-full p-2 text-sm border border-gray-300 bg-gray-100 rounded-md min-h-[120px]"
                                    placeholder="Leave a not about this listing that only you can see.."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="bg-black text-white hover:bg-gray-800">
                        Add Property
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewListingModal;