import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import {
  MAINTENANCE_PRIORITY,
  MAINTENANCE_CATEGORY,
} from "@/lib/maintenanceApi";

const MaintenanceForm = ({
  formData,
  properties,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">New Maintenance Request</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="e.g. My door is broken"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Property</label>
              <select
                name="listingId"
                value={formData.listingId}
                onChange={onChange}
                className="border rounded-md w-full p-2"
                required
              >
                <option value="">
                  Select property ({properties.length} available)
                </option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title || property.name || "Untitled Property"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={onChange}
                className="border rounded-md w-full p-2"
                required
              >
                <option value={MAINTENANCE_PRIORITY.LOW}>Low</option>
                <option value={MAINTENANCE_PRIORITY.MEDIUM}>Normal</option>
                <option value={MAINTENANCE_PRIORITY.HIGH}>Important</option>
                <option value={MAINTENANCE_PRIORITY.URGENT}>Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
              className="border rounded-md w-full p-2"
              required
            >
              <option value="">Select category</option>
              <option value={MAINTENANCE_CATEGORY.PLUMBING}>Plumbing</option>
              <option value={MAINTENANCE_CATEGORY.ELECTRICAL}>
                Electrical
              </option>
              <option value={MAINTENANCE_CATEGORY.HVAC}>HVAC</option>
              <option value={MAINTENANCE_CATEGORY.APPLIANCE}>Appliance</option>
              <option value={MAINTENANCE_CATEGORY.STRUCTURAL}>
                Structural
              </option>
              <option value={MAINTENANCE_CATEGORY.PEST_CONTROL}>
                Pest Control
              </option>
              <option value={MAINTENANCE_CATEGORY.CLEANING}>Cleaning</option>
              <option value={MAINTENANCE_CATEGORY.LANDSCAPING}>
                Landscaping
              </option>
              <option value={MAINTENANCE_CATEGORY.SECURITY}>Security</option>
              <option value={MAINTENANCE_CATEGORY.OTHER}>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={4}
              className="border rounded-md w-full p-2"
              placeholder="Describe the issue..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium">Image</label>
            <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-muted/10">
              <Upload className="size-6 mb-2" />
              <span className="text-sm text-muted-foreground">
                Upload image
              </span>
              <input
                type="file"
                name="image"
                className="hidden"
                onChange={onChange}
                accept="image/*"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Close
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
