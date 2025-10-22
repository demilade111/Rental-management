import React from 'react';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PropertySearchBar = ({ searchQuery, setSearchQuery }) => (
    <div className="flex flex-col md:flex-row gap-3 mb-6 md:justify-between">
        <div className="flex gap-3 flex-1 md:max-w-md">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50/10 border-gray-300"
                />
            </div>
            <Button variant="outline" size="icon" className="border-gray-200">
                <SlidersHorizontal className="w-4 h-4" />
            </Button>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            New Listing
        </Button>
    </div>
);

export default PropertySearchBar;
