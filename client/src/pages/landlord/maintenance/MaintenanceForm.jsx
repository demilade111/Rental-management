import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Upload, X } from "lucide-react";
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

// Keep this component outside of MaintenanceForm so it doesn't remount on every parent render
const ImageWithShimmer = React.memo(function ImageWithShimmer({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="h-28 w-40 relative flex-shrink-0 snap-start">
      {!loaded && (
        <div className="h-full w-full rounded-md bg-gray-200 dark:bg-gray-800 shimmer-container">
          <div className="shimmer-bar" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`h-28 w-40 rounded-md object-cover border absolute inset-0 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
});

const MaintenanceForm = ({
  formData,
  properties,
  onChange,
  onSubmit,
  open,
  setOpen,
  saving,
  userRole,
}) => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const sliderRef = useRef(null);
  const inputRef = useRef(null);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setPreviewUrls([]);
      setSelectedFiles([]);
      onChange?.({ target: { name: "images", files: [] } });
      return;
    }

    setSelectedFiles(files);
    // Forward all files to parent under `images`
    onChange?.({ target: { name: "images", files } });

    // Build previews for all selected files
    const urls = files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    // Revoke old urls before replacing
    setPreviewUrls((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return urls;
    });
  };

  const removePreview = (url) => {
    setPreviewUrls((prev) => {
      const remaining = prev.filter((p) => p.url !== url);
      const removed = prev.find((p) => p.url === url);
      if (removed) URL.revokeObjectURL(removed.url);
      return remaining;
    });

    // Sync selected files and notify parent
    setSelectedFiles((prevFiles) => {
      const remainingFiles = prevFiles.filter((f) => {
        const match = previewUrls.find((p) => p.url === url);
        return f.name !== match?.name || f.size !== match?.size;
      });
      onChange?.({ target: { name: "images", files: remainingFiles } });
      return remainingFiles;
    });
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs on unmount
      previewUrls.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previewUrls]);

  const canScroll = previewUrls.length > 1;
  const scrollBy = 220;
  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -scrollBy, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: scrollBy, behavior: "smooth" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white dark:bg-gray-900 rounded-xl">
        <DialogHeader className="px-2 pt-3">
          <DialogTitle>New Maintenance Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 3 w-full max-w-xl max-h-[90vh] overflow-y-auto overflow-x-visible px-2">
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
            <div className={`grid gap-4 ${userRole === "TENANT" ? "grid-cols-1" : "grid-cols-2"}`}>
              {/* Property (Landlord/Admin only) */}
              {userRole !== "TENANT" && (
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
              )}

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
              {/* Always-present hidden input to allow re-opening chooser from previews */}
              <input
                ref={inputRef}
                type="file"
                id="maintenance-image-input"
                name="image"
                className="hidden"
                onChange={handleFilesChange}
                accept="image/*"
                multiple
              />
              {previewUrls.length === 0 && (
                <label htmlFor="maintenance-image-input" className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-muted/10">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-sm text-muted-foreground">Upload image(s)</span>
                </label>
              )}

              {previewUrls.length > 0 && (
                <div className="mt-3 relative">
                  {canScroll && (
                    <div className="absolute -top-8 right-0 flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={scrollLeft}>
                        ◀
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={scrollRight}>
                        ▶
                      </Button>
                    </div>
                  )}
                  <div
                    ref={sliderRef}
                    className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 cursor-pointer"
                    onClick={() => inputRef.current?.click()}
                  >
                    {previewUrls.map((p) => (
                      <div key={p.url} className="relative">
                        <ImageWithShimmer src={p.url} alt={p.name} />
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); removePreview(p.url); }}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white grid place-items-center"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceForm;
