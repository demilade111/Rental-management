import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MAINTENANCE_PRIORITY,
  MAINTENANCE_CATEGORY,
} from "@/lib/maintenanceApi";
import { Textarea } from "@/components/ui/textarea";

const MaintenanceForm = ({
  formData,
  properties,
  onChange,
  onSubmit,
  open,
  setOpen,
  saving,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white dark:bg-gray-900 p-8 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Maintenance Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="e.g. My door is broken"
              minLength={3}
              required
            />
          </div>

          {/* Property & Priority */}
          <div className="grid grid-cols-2 gap-4">
            {/* Property */}
            <div>
              <label className="block text-sm font-medium mb-1">Select property</label>
              <Select
                value={formData.listingId}
                onValueChange={(value) =>
                  onChange({ target: { name: "listingId", value } })
                }
                disabled={properties.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Available properties ( ${properties.length} )`} />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title || property.name || "Untitled Property"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  onChange({ target: { name: "priority", value } })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MAINTENANCE_PRIORITY.LOW}>Low</SelectItem>
                  <SelectItem value={MAINTENANCE_PRIORITY.MEDIUM}>Normal</SelectItem>
                  <SelectItem value={MAINTENANCE_PRIORITY.HIGH}>Important</SelectItem>
                  <SelectItem value={MAINTENANCE_PRIORITY.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                onChange({ target: { name: "category", value } })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MAINTENANCE_CATEGORY.PLUMBING}>Plumbing</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.ELECTRICAL}>Electrical</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.HVAC}>HVAC</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.APPLIANCE}>Appliance</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.STRUCTURAL}>Structural</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.PEST_CONTROL}>Pest Control</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.CLEANING}>Cleaning</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.LANDSCAPING}>Landscaping</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.SECURITY}>Security</SelectItem>
                <SelectItem value={MAINTENANCE_CATEGORY.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              className="border rounded-md w-full p-2"
              placeholder="Describe the issue... (minimum 10 characters)"
              minLength={10}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-muted/10">
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-sm text-muted-foreground">Upload image</span>
              <input
                type="file"
                name="image"
                className="hidden"
                onChange={onChange}
                accept="image/*"
              />
            </label>
          </div>

          {/* Actions */}
          <DialogFooter className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : <><Save className="mr-2" /> Save</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceForm;
