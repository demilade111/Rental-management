import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersVertical } from "lucide-react";

const AccountingFilter = ({ filter, setFilter }) => {
  const [open, setOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState(filter);

  const handleApply = () => {
    setFilter(tempFilter);
    setOpen(false);
  };

  const handleReset = () => {
    setTempFilter("");
    setFilter("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 sm:w-auto w-full"
        >
          <SlidersVertical className="w-4 h-4" />
          <span className="hidden sm:inline"></span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter by</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={tempFilter} onValueChange={setTempFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Outstanding Balances">Outstanding Balances</SelectItem>
              <SelectItem value="Overdue Payments">Overdue Payments</SelectItem>
              <SelectItem value="Paid Amounts (Month)">Paid Amounts</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountingFilter;
