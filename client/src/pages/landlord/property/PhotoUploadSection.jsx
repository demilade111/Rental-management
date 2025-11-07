import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PhotoUploadSection({ images = [], onImagesChange, disabled }) {
    const fileInputRef = useRef(null);
    const sliderRef = useRef(null);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Handle both File objects and URLs
    useEffect(() => {
        const urls = images.map((img) => {
            if (img instanceof File) {
                return { url: URL.createObjectURL(img), file: img, type: 'file' };
            } else if (typeof img === 'string') {
                return { url: img, file: null, type: 'url' };
            }
            return null;
        }).filter(Boolean);

        setPreviewUrls(urls);

        // Cleanup function
        return () => {
            urls.forEach((item) => {
                if (item.type === 'file' && item.url) {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [images]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Add new files to existing images
        const newImages = [...images, ...files];
        onImagesChange(newImages);

        // Reset input to allow selecting same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = (index) => {
        const item = previewUrls[index];
        if (item && item.type === 'file' && item.url) {
            URL.revokeObjectURL(item.url);
        }

        // Remove from images array
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const canScroll = previewUrls.length > 1;
    const scrollBy = 220;
    const scrollLeft = () => sliderRef.current?.scrollBy({ left: -scrollBy, behavior: "smooth" });
    const scrollRight = () => sliderRef.current?.scrollBy({ left: scrollBy, behavior: "smooth" });

    return (
        <div className="w-full space-y-4">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                id="property-photo-input"
                name="photos"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                disabled={disabled}
            />

            {/* Upload placeholder - shown when no images */}
            {previewUrls.length === 0 && (
                <label
                    htmlFor="property-photo-input"
                    className="border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload photos</span>
                </label>
            )}

            {/* Image preview slider - shown when images exist */}
            {previewUrls.length > 0 && (
                <div className="relative">
                    {/* Left scroll button */}
                    {canScroll && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white shadow-md"
                            onClick={scrollLeft}
                            disabled={disabled}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Image slider */}
                    <div
                        ref={sliderRef}
                        className={`flex gap-4 overflow-x-auto scrollbar-hide ${canScroll ? 'px-10' : ''}`}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {previewUrls.map((item, index) => (
                            <div
                                key={index}
                                className="relative flex-shrink-0 w-52 h-36 border rounded-lg overflow-hidden bg-gray-100 group"
                                onClick={() => {
                                    if (!disabled && fileInputRef.current) {
                                        fileInputRef.current.click();
                                    }
                                }}
                            >
                                {/* Remove button */}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 z-10 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(index);
                                    }}
                                    disabled={disabled}
                                >
                                    <X className="h-3 w-3" />
                                </Button>

                                {/* Image preview */}
                                <img
                                    src={item.url}
                                    alt={`Property photo ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right scroll button */}
                    {canScroll && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white shadow-md"
                            onClick={scrollRight}
                            disabled={disabled}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Add more photos button */}
                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                            className="w-full"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Add More Photos
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}