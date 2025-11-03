import { useState } from "react";
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
import { PROPERTY_CATEGORY_NAMES, PROPERTY_OPTIONS } from "@/constants/propertyTypes";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Label } from "@/components/ui/label";

export default function CreateLeaseModal({ open, onClose, tenantId, landlordId, listingId }) {
    const [file, setFile] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState("");
    const [step, setStep] = useState(1);

    const [selectedListing, setSelectedListing] = useState("");
    const [leaseName, setLeaseName] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [description, setDescription] = useState("");

    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const handleFile = (e) => setFile(e.target.files[0]);

    const handleClose = () => {
        onClose(); // triggers shadcn close animation
        setTimeout(() => {
            setStep(1);
            setFile(null);
            setLeaseName("");
            setCategory("");
            setType("");
            setDescription("");
            setUploadedUrl("");
        }, 200);
    };

    // Fetch listings
    const { data: listings = [], isLoading: listingsLoading } = useQuery({
        queryKey: ["listings", user?.id],
        queryFn: async () => {
            const res = await api.get(API_ENDPOINTS.LISTINGS.BASE);
            const activeListings = res.data.listing.filter(l => l.status === "ACTIVE");

            return activeListings;
        },
    });

    // Upload PDF to S3
    const uploadPdfMutation = useMutation({
        mutationFn: async (file) => {
            const encoded = encodeURIComponent(file.name);

            const { data } = await api.get(
                `${API_ENDPOINTS.UPLOADS.BASE}/s3-url`,
                {
                    params: {
                        fileName: encoded,
                        fileType: file.type,
                        category: "leases",
                    }
                }
            );

            const { uploadURL, fileUrl } = data.data;

            await fetch(uploadURL, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            return fileUrl;
        },
        onSuccess: (key) => {
            setUploadedUrl(key);
            toast.success("PDF uploaded successfully");
            setStep(2);
        },
        onError: () => toast.error("Failed to upload PDF"),
    });

    // Save metadata
    const createLeaseMutation = useMutation({
        mutationFn: async (payload) => {
            // console.log(API_ENDPOINTS.CUSTOM_LEASES.BASE)
            // console.log(payload)
            const res = await api.post(
                API_ENDPOINTS.CUSTOM_LEASES.BASE,
                payload
            );
            return res.data;
        },
        onSuccess: () => {
            toast.success("Custom lease saved");
            queryClient.invalidateQueries(["customleases"]);
            handleClose();
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to submit application.");
        },
    });

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
                            onClick={() => {
                                toast("Standard Lease Builder coming soon!");
                            }}
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
                            onClick={() => uploadPdfMutation.mutate(file)}
                            disabled={!file || uploadPdfMutation.isPending}
                        >
                            {uploadPdfMutation.isPending ? "Uploading..." : "Save and Continue"}
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
                            <div className="space-y-2">
                                <Label className="text-gray-900">Custom Lease Name</Label>
                                <Input
                                    placeholder="Lease Name"
                                    value={leaseName}
                                    onChange={(e) => setLeaseName(e.target.value)}
                                />
                            </div>

                            {/* Listing Select */}
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600">Select Listing</Label>
                                <Select
                                    value={selectedListing}
                                    onValueChange={setSelectedListing}
                                    disabled={listings.length === 0}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                listings.length === 0
                                                    ? "No available listings"
                                                    : selectedListing === ""
                                                        ? "Choose a listing"
                                                        : undefined
                                            }
                                        />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {listings.length > 0 ? (
                                            listings.map((l) => (
                                                <SelectItem key={l.id} value={l.id}>
                                                    {l.title} — {l.streetAddress}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-gray-500 text-sm text-center">
                                                No available listings
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category + Type */}
                            <div className="w-full">
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
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
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
                                                {category &&
                                                    PROPERTY_OPTIONS[category].map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
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

                        <Button
                            className="mt-6 w-full py-6 rounded-2xl"
                            onClick={() =>
                                createLeaseMutation.mutate({
                                    leaseName,
                                    propertyCategory: category,
                                    propertyType: type,
                                    description,
                                    fileUrl: uploadedUrl,
                                    tenantId,
                                    landlordId: user.id,
                                    listingId: selectedListing,
                                })
                            }
                            disabled={!leaseName || !category || !type}
                        >
                            {createLeaseMutation.isPending ? "Saving..." : "Save Lease"}
                        </Button>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
