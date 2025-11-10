import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AccountingSearchBar = ({
  searchQuery,
  setSearchQuery,
  onFilter,
}) => (
  <div className="flex flex-col md:flex-row gap-3 mb-6 md:justify-between">
    {/* Search + Filter */}
    <div className="flex gap-3 flex-1 md:max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search.."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-300"
        />
      </div>

      <Button
        variant="outline"
        size="icon"
        className="border-gray-200"
        onClick={onFilter}
      >
        <SlidersHorizontal className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

export default AccountingSearchBar;

