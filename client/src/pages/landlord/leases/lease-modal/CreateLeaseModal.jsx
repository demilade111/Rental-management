import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PROPERTY_CATEGORY_NAMES, PROPERTY_OPTIONS } from "@/constants/propertyTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateLeaseModal({ open, onClose, tenantId, landlordId, listingId, onSuccess }) {
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(1);

    const [selectedListing, setSelectedListing] = useState("");
    const [listingSearchQuery, setListingSearchQuery] = useState("");
    const [listingPopoverOpen, setListingPopoverOpen] = useState(false);
    const [leaseName, setLeaseName] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const handleFile = (e) => setFile(e.target.files[0]);

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep(1);
            setFile(null);
            setLeaseName("");
            setCategory("");
            setType("");
            setDescription("");
            setSelectedListing("");
            setListingSearchQuery("");
            setListingPopoverOpen(false);
            setIsSaving(false);
        }, 200);
    };

    // Fetch active listings
    const { data: listings = [], isLoading: listingsLoading } = useQuery({
        queryKey: ["listings", user?.id],
        queryFn: async () => {
            const res = await api.get(API_ENDPOINTS.LISTINGS.BASE);
            return res.data.listing.filter(l => l.status === "ACTIVE");
        },
    });

    // Filter listings based on search query
    const filteredListings = useMemo(() => {
        if (!listingSearchQuery) return listings;
        const query = listingSearchQuery.toLowerCase();
        return listings.filter((l) => 
            l.title?.toLowerCase().includes(query) ||
            l.streetAddress?.toLowerCase().includes(query) ||
            `${l.title} — ${l.streetAddress}`.toLowerCase().includes(query)
        );
    }, [listings, listingSearchQuery]);

    // Get selected listing display text
    const selectedListingText = useMemo(() => {
        if (!selectedListing) return "";
        const listing = listings.find((l) => l.id === selectedListing);
        return listing ? `${listing.title} — ${listing.streetAddress}` : "";
    }, [selectedListing, listings]);

    // Upload PDF to S3
    const uploadPdfMutation = useMutation({
        mutationFn: async (file) => {
            const encoded = encodeURIComponent(file.name);
            const { data } = await api.get(`${API_ENDPOINTS.UPLOADS.BASE}/s3-url`, {
                params: {
                    fileName: encoded,
                    fileType: file.type,
                    category: "leases",
                }
            });

            const { uploadURL, fileUrl } = data.data;

            await fetch(uploadURL, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            return fileUrl;
        }
    });

    // Save lease metadata
    const createLeaseMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await api.post(API_ENDPOINTS.CUSTOM_LEASES.BASE, payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Custom lease saved");
            queryClient.invalidateQueries(["customleases"]);
            setIsSaving(false);
            handleClose();
            // Call onSuccess callback if provided (e.g., to switch to custom tab)
            if (onSuccess) {
                onSuccess();
            }
        },
        onError: () => {
            toast.error("Failed to submit lease");
            setIsSaving(false);
        },
    });

    // Handle save lease: first upload PDF, then create lease
    const handleSaveLease = () => {
        if (!file) return toast.error("Please upload a PDF first");

        setIsSaving(true);
        uploadPdfMutation.mutate(file, {
            onSuccess: (fileUrl) => {
                createLeaseMutation.mutate({
                    leaseName,
                    propertyCategory: category,
                    propertyType: type,
                    description,
                    fileUrl,
                    tenantId,
                    landlordId: user.id,
                    listingId: selectedListing,
                });
            },
            onError: () => {
                toast.error("Failed to upload PDF");
                setIsSaving(false);
            },
        });
    };

    const isProcessing = isSaving || uploadPdfMutation.isPending || createLeaseMutation.isPending || uploadPdfMutation.isLoading || createLeaseMutation.isLoading;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                className="max-w-xl rounded-2xl p-8"
            >
                {/* STEP 1 ------------------------------------ */}
                {step === 1 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-center text-[22px] font-bold p-6">
                                How would you like to add your lease?
                            </DialogTitle>
                        </DialogHeader>

                        <div
                            onClick={() => toast("Standard Lease Builder coming soon!")}
                            className="cursor-pointer border border-gray-200 rounded-xl p-10 text-center hover:shadow-md transition mb-6"
                        >
                            <p className="text-lg font-semibold">Create with PropEase</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                * Recommended for beginners
                            </p>
                        </div>

                        {/* Upload Custom PDF */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                            <div className="w-10 h-10 bg-gray-200 mx-auto mb-3 rounded" />
                            <p className="text-sm text-gray-700">Add your custom-made lease</p>

                            <Label className="block mt-3">
                                <Button asChild variant="outline">
                                    <span>Choose File</span>
                                </Button>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={handleFile}
                                />
                            </Label>

                            {file && (
                                <p className="mt-2 text-xs text-gray-600">{file.name}</p>
                            )}
                        </div>

                        <Button
                            className="mt-6 w-1/2 mx-auto rounded-2xl py-6"
                            onClick={() => setStep(2)}
                            disabled={!file || isProcessing}
                        >
                            Next
                        </Button>
                    </>
                )}

                {/* STEP 2 ------------------------------------ */}
                {step === 2 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-center text-[22px] font-bold p-4">
                                Custom Lease Details
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Listing Select - Searchable */}
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600">Select Listing</Label>
                                <Popover open={listingPopoverOpen} onOpenChange={setListingPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={listingPopoverOpen}
                                            className="w-full justify-between"
                                            disabled={listings.length === 0}
                                        >
                                            {selectedListingText || (listings.length === 0 ? "No available listings" : "Choose a listing")}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                                        <div className="p-2">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search listings..."
                                                    value={listingSearchQuery}
                                                    onChange={(e) => setListingSearchQuery(e.target.value)}
                                                    className="pl-8"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {filteredListings.length > 0 ? (
                                                <div className="p-1">
                                                    {filteredListings.map((l) => (
                                                        <div
                                                            key={l.id}
                                                            className={cn(
                                                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                                selectedListing === l.id && "bg-accent"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedListing(l.id === selectedListing ? "" : l.id);
                                                                setListingPopoverOpen(false);
                                                                setListingSearchQuery("");
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedListing === l.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <span className="flex-1 truncate">
                                                                {l.title} — {l.streetAddress}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    {listingSearchQuery ? "No listings found." : "No available listings"}
                                                </div>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-900">Custom Lease Name</Label>
                                <Input
                                    placeholder="Lease Name"
                                    value={leaseName}
                                    onChange={(e) => setLeaseName(e.target.value)}
                                />
                            </div>

                            {/* Category + Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div className="space-y-2 w-full">
                                    <Label className="text-gray-900">Property Category</Label>
                                    <Select
                                        value={category}
                                        onValueChange={(val) => {
                                            setCategory(val);
                                            setType("");
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(PROPERTY_CATEGORY_NAMES).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 w-full">
                                    <Label className="text-gray-900">Property Type</Label>
                                    <Select
                                        value={type}
                                        disabled={!category}
                                        onValueChange={setType}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {category && PROPERTY_OPTIONS[category].map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-900">Description</Label>
                                <Textarea
                                    placeholder="Description (optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Back + Save Buttons */}
                        <div className="flex justify-between mt-6 gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 py-6 rounded-2xl"
                                onClick={() => setStep(1)}
                                disabled={isProcessing}
                            >
                                Back
                            </Button>

                            <Button
                                className="flex-1 py-6 rounded-2xl"
                                onClick={handleSaveLease}
                                disabled={!leaseName || !category || !type || !file || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Save Lease"
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
