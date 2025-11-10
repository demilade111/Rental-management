import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FilterDialog = ({ open, onOpenChange, filters, onApplyFilters }) => {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  // Initialize filters when dialog opens
  useEffect(() => {
    if (open && filters) {
      setStatus(filters.status || 'ALL');
      setType(filters.type || 'ALL');
    }
  }, [open, filters]);

  const handleApply = () => {
    onApplyFilters({
      status,
      type,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setStatus('ALL');
    setType('ALL');
    onApplyFilters({
      status: 'ALL',
      type: 'ALL',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm space-y-4 p-8">
        <DialogHeader>
          <DialogTitle className="text-[18px]">Filter Payments</DialogTitle>
        </DialogHeader>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Payment Status</label>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-full border rounded-md">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Payment Type</label>
          <Select
            value={type}
            onValueChange={setType}
          >
            <SelectTrigger className="w-full border rounded-md">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="RENT">Rent</SelectItem>
              <SelectItem value="DEPOSIT">Deposit</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="REFUND">Refund</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between gap-3 pt-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-1/2 rounded-xl"
          >
            Reset
          </Button>

          <Button
            onClick={handleApply}
            className="bg-black text-white hover:bg-gray-800 w-1/2 rounded-xl"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;

