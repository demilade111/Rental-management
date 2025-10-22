import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudUpload } from "lucide-react";

export default function PhotoUploadSection() {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full mx-auto border border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
            {/* Top Icon */}
            <CloudUpload className="w-12 h-12 text-gray-400" />

            {/* Middle Text */}
            <p className="text-center text-gray-600">
                {file ? file.name : "Choose photo of your property"}
            </p>

            {/* Bottom Button */}
            <label htmlFor="file-upload">
                <Input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <Button variant="outline" className="w-full">
                    {file ? "Change Photo" : "Choose Photo"}
                </Button>
            </label>
        </div>
    );
}
