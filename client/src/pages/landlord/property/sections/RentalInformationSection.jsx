import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RENTCYCLE_OPTIONS } from "@/constants/rentCycles";

export const RentalInformationSection = ({
  formData,
  fieldErrors,
  handleChange,
  setFormData,
  isPending,
}) => {
  return (
    <div className="border-b border-gray-300 space-y-6 pb-8">
      <div>
        <label className="block text-sm font-medium mb-2">Rent Cycle</label>
        <select
          name="rentCycle"
          value={formData.rentCycle}
          onChange={handleChange}
          className="w-full text-sm p-2 border border-gray-300 rounded-md"
          required
          disabled={isPending}
        >
          <option value="" disabled>
            Select rent cycle
          </option>
          {RENTCYCLE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {fieldErrors.rentCycle && (
          <p className="mt-1 text-red-400 text-sm">{fieldErrors.rentCycle}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rent</label>
          <Input
            name="rentAmount"
            value={formData.rentAmount}
            onChange={handleChange}
            placeholder="$ 1,200"
            className="w-full text-sm"
            required
            disabled={isPending}
          />
          {fieldErrors.rentAmount && (
            <p className="mt-1 text-red-400 text-sm">
              {fieldErrors.rentAmount}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Security Deposit
          </label>
          <Input
            name="securityDeposit"
            value={formData.securityDeposit}
            onChange={handleChange}
            placeholder="$ 600"
            className="w-full text-sm"
            required
            disabled={isPending}
          />
          {fieldErrors.securityDeposit && (
            <p className="mt-1 text-red-400 text-sm">
              {fieldErrors.securityDeposit}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Available From</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-1/2 justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
                !formData.availableDate && "text-gray-600"
              )}
              disabled={isPending}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.availableDate ? (
                format(formData.availableDate, "PPP")
              ) : (
                <span>Select date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={formData.availableDate}
              onSelect={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  availableDate: date,
                }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {fieldErrors.availableDate && (
          <p className="mt-1 text-red-400 text-sm">
            {fieldErrors.availableDate}
          </p>
        )}
      </div>
    </div>
  );
};
