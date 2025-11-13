import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import FileUploader from "@/components/shared/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  uploadAndExtractInsurance,
  createInsurance,
} from "@/services/insuranceService";

const UploadInsurance = ({ onSuccess, leaseId, customLeaseId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [file, setFile] = useState(null);
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentKey, setDocumentKey] = useState("");

  const [formData, setFormData] = useState({
    providerName: "",
    policyNumber: "",
    coverageType: "",
    coverageAmount: "",
    monthlyCost: "",
    startDate: "",
    expiryDate: "",
    notes: "",
  });

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      setDocumentUrl("");
      setDocumentKey("");
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setUploadProgress(0);

    try {
      const result = await uploadAndExtractInsurance(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
          if (progress === 100) {
            setExtracting(true);
          }
        }
      );

      setDocumentUrl(result.documentUrl);
      setDocumentKey(result.documentKey);

      // Auto-fill form with extracted data
      const extracted = result.extractedData;
      setFormData((prev) => ({
        ...prev,
        providerName: extracted.providerName || prev.providerName,
        policyNumber: extracted.policyNumber || prev.policyNumber,
        coverageType: extracted.coverageType || prev.coverageType,
        coverageAmount: extracted.coverageAmount || prev.coverageAmount,
        monthlyCost: extracted.monthlyCost || prev.monthlyCost,
        startDate: extracted.startDate
          ? extracted.startDate.split("T")[0]
          : prev.startDate,
        expiryDate: extracted.expiryDate
          ? extracted.expiryDate.split("T")[0]
          : prev.expiryDate,
      }));

      toast.success("Document uploaded and processed successfully");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to process document. Please fill in the details manually.");
    } finally {
      setLoading(false);
      setExtracting(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentUrl) {
      toast.error("Please upload an insurance document");
      return;
    }

    if (!formData.providerName || !formData.policyNumber || !formData.coverageType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.startDate || !formData.expiryDate) {
      toast.error("Please provide start and expiry dates");
      return;
    }

    setLoading(true);

    try {
      const insuranceData = {
        leaseId,
        customLeaseId,
        providerName: formData.providerName,
        policyNumber: formData.policyNumber,
        coverageType: formData.coverageType,
        coverageAmount: formData.coverageAmount
          ? parseFloat(formData.coverageAmount)
          : undefined,
        monthlyCost: formData.monthlyCost
          ? parseFloat(formData.monthlyCost)
          : undefined,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        documentUrl,
        documentKey,
        notes: formData.notes || undefined,
      };

      await createInsurance(insuranceData);
      toast.success("Insurance submitted successfully");
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/tenant/insurance");
      }
    } catch (error) {
      console.error("Error creating insurance:", error);
      toast.error(error.response?.data?.message || "Failed to submit insurance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Insurance Document</h2>
        <p className="text-gray-600 mt-1">
          Upload your renter's insurance certificate. We'll automatically extract the key details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Insurance Document</h3>
          <FileUploader
            onFileSelect={handleFileSelect}
            acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
            maxSizeMB={10}
            disabled={loading}
          />

          {loading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {extracting ? "Extracting data..." : "Uploading..."}
                </span>
                <span className="text-gray-900 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Insurance Details Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Insurance Details</h3>
          
          {!documentUrl && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                Upload your insurance document first for automatic data extraction, or fill in the details manually.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="providerName">Provider Name *</Label>
              <Input
                id="providerName"
                name="providerName"
                value={formData.providerName}
                onChange={handleInputChange}
                placeholder="e.g., State Farm"
                required
              />
            </div>

            <div>
              <Label htmlFor="policyNumber">Policy Number *</Label>
              <Input
                id="policyNumber"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleInputChange}
                placeholder="e.g., POL-123456"
                required
              />
            </div>

            <div>
              <Label htmlFor="coverageType">Coverage Type *</Label>
              <Input
                id="coverageType"
                name="coverageType"
                value={formData.coverageType}
                onChange={handleInputChange}
                placeholder="e.g., Standard Renter's Insurance"
                required
              />
            </div>

            <div>
              <Label htmlFor="coverageAmount">Coverage Amount ($)</Label>
              <Input
                id="coverageAmount"
                name="coverageAmount"
                type="number"
                value={formData.coverageAmount}
                onChange={handleInputChange}
                placeholder="e.g., 50000"
              />
            </div>

            <div>
              <Label htmlFor="monthlyCost">Monthly Cost ($)</Label>
              <Input
                id="monthlyCost"
                name="monthlyCost"
                type="number"
                step="0.01"
                value={formData.monthlyCost}
                onChange={handleInputChange}
                placeholder="e.g., 50.00"
              />
            </div>

            <div>
              <Label htmlFor="startDate">Effective Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="expiryDate">Expiration Date *</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information about your insurance policy"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/tenant/insurance")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !documentUrl}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Insurance
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadInsurance;

