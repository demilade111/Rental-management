import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudUpload } from "lucide-react";

export default function PhotoUploadSection({ images = [], onImagesChange, disabled }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const newImage = URL.createObjectURL(file);
            onImagesChange([...images, newImage]);
        }
    };

    return (
        <div className="w-full mx-auto border border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            {/* Top Icon */}
            <CloudUpload className="w-12 h-12 text-gray-400" />

            {/* Middle Text */}
            <p className="text-center text-gray-600">
                {images.length > 0 ? `${images.length} photo(s) selected` : "Choose photo of your property"}
            </p>

            {/* Bottom Button */}
            <label htmlFor="file-upload">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => onImagesChange(Array.from(e.target.files))}
                />
                <Button onClick={() => fileInputRef.current.click()} variant="outline" className="w-full" disabled={disabled}>
                    {images.length > 0 ? "Change Photo" : "Choose Photo"}
                </Button>
            </label>
        </div>
    );
}