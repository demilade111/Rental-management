import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import LoadingState from "@/components/shared/LoadingState";
import { toast } from "sonner";

/**
 * Multi-step application form for public applicants
 *
 * Steps:
 * 1. Personal
 * 2. Employment (repeatable)
 * 3. Occupants / Pets / Notes
 * 4. Documents + Review + Submit
 *
 * This uses:
 * - GET /api/v1/applications/:publicId  (already exists)
 * - POST /api/v1/upload                 (to upload files; should return { url })
 * - POST /api/v1/applications/:publicId/submit  (new endpoint - see backend sample below)
 */

const ApplyForm = () => {
  const { publicId } = useParams();

  const [step, setStep] = useState(1);
  const [redirectAfterSubmit, setRedirectAfterSubmit] = useState(false);

  // form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: null,
    currentAddress: "",
    moveInDate: null,
    monthlyIncome: "",
    occupantsCount: 0,
    petsCount: 0,
    message: "",
    employmentInfo: [
      // example entry: { employerName: "", jobTitle: "", income: "", duration: "", address: "", proofDocumentFile: null }
    ],
    documents: [], // array of File objects to upload
  });

  // load application meta by publicId (listing info & requirements)
  const {
    data: applicationMeta,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["applicationPublic", publicId],
    queryFn: async () => {
      const res = await api.get(
        `${API_ENDPOINTS.APPLICATIONS.BASE}/${publicId}`
      );
      return res.data.data || res.data;
    },
    enabled: !!publicId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // (Deprecated) old mutation removed — we now use presigned URL endpoints directly via GET

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(
        `${API_ENDPOINTS.UPLOADS.BASE}/${publicId}/submit`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Application submitted — landlord will be notified.");
      setRedirectAfterSubmit(true);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to submit application.");
    },
  });

  useEffect(() => {
    // when metadata loads, prefill some fields (if the "application" was created with placeholder info)
    if (applicationMeta) {
      if (applicationMeta.fullName && applicationMeta.fullName !== "N/A") {
        setForm((f) => ({
          ...f,
          fullName: applicationMeta.fullName || f.fullName,
        }));
      }
      // optionally read requirements from applicationMeta.message if you stored requirements there
      // but that's optional UI behavior
    }
  }, [applicationMeta]);

  useEffect(() => {
    console.log(
      "🔄 Form state updated - documents:",
      form.documents?.length || 0,
      form.documents?.map((d) => d.name)
    );
  }, [form.documents]);

  useEffect(() => {
    if (step === 4) {
      console.log("Step 4 rendered, documents:", form.documents?.length || 0);
    }
  }, [step, form.documents]);

  if (!publicId) return <Navigate to="/" replace />;

  if (isLoading) {
    // show header + loading body
    return <LoadingState message="Loading application..." />;
  }

  if (isError || !applicationMeta) {
    // Extract error message from API response
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.details ||
      error?.message ||
      "That application link may be invalid or expired.";

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Application Error</h2>
          <p className="text-sm text-gray-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // ---------- helper handlers ----------
  const updateField = (key, value) => setForm((s) => ({ ...s, [key]: value }));
  const addEmployment = () =>
    setForm((s) => ({
      ...s,
      employmentInfo: [
        ...(s.employmentInfo || []),
        {
          employerName: "",
          jobTitle: "",
          income: "",
          duration: "",
          address: "",
          proofDocumentFile: null,
        },
      ],
    }));
  const updateEmployment = (index, field, value) =>
    setForm((s) => {
      const arr = [...(s.employmentInfo || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...s, employmentInfo: arr };
    });
  const removeEmployment = (index) =>
    setForm((s) => {
      const arr = [...(s.employmentInfo || [])];
      arr.splice(index, 1);
      return { ...s, employmentInfo: arr };
    });

  const handleAddDocument = (file) => {
    console.log("➕ Adding file:", file.name);
    setForm((s) => {
      const newDocs = [...(s.documents || []), file];
      console.log(
        "✅ Updated documents array:",
        newDocs.length,
        "files:",
        newDocs.map((d) => d.name)
      );
      return { ...s, documents: newDocs };
    });
  };

  async function uploadFileToS3(file) {
    const endpoint = "/api/v1/upload/application-proof-url";
    const { data } = await api.get(endpoint, {
      params: {
        fileName: file.name,
        fileType: file.type,
      },
    });

    const { uploadURL, fileUrl } = data.data;

    await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return fileUrl;
  }

  const handleSubmit = async () => {
    if (!form.fullName || !form.email) {
      toast.error("Please provide name and email");
      setStep(1);
      return;
    }

    try {
      // Upload all documents to S3 first
      const documentUrls = await Promise.all(
        (form.documents || []).map((file) => uploadFileToS3(file))
      );

      // Upload all employment proof documents to S3
      const employmentInfoWithUrls = await Promise.all(
        (form.employmentInfo || []).map(async (e) => {
          let proofDocument = null;
          if (e.proofDocumentFile) {
            proofDocument = await uploadFileToS3(e.proofDocumentFile);
          }
          return {
            employerName: e.employerName,
            jobTitle: e.jobTitle,
            income: e.income ? Number(e.income) : null,
            duration: e.duration || null,
            address: e.address || null,
            proofDocument,
          };
        })
      );

      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth ? form.dateOfBirth.toISOString() : null,
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
        currentAddress: form.currentAddress || null,
        moveInDate: form.moveInDate ? form.moveInDate.toISOString() : null,
        occupants: form.occupantsCount
          ? { count: Number(form.occupantsCount) }
          : null,
        pets: form.petsCount ? { count: Number(form.petsCount) } : null,
        documents: documentUrls,
        references: null,
        message: form.message || null,
        employmentInfo: employmentInfoWithUrls,
      };

      await submitMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files. Please try again.");
    }
  };

  // ---------- UI Steps ----------
  return (
    <div className="min-h-screen flex items-start justify-center py-10 px-4 md:px-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            Apply for {applicationMeta.listing?.title || "property"}
          </h1>
          <p className="text-sm text-gray-600">
            {applicationMeta.listing?.streetAddress}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`px-3 py-1 rounded ${
              step === 1 ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            1. Personal
          </div>
          <div
            className={`px-3 py-1 rounded ${
              step === 2 ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            2. Employment
          </div>
          <div
            className={`px-3 py-1 rounded ${
              step === 3 ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            3. Occupants
          </div>
          <div
            className={`px-3 py-1 rounded ${
              step === 4 ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            4. Documents
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-6">
          {/* STEP 1: Personal */}
          {step === 1 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full name</Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Date of birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full text-left">
                        {form.dateOfBirth
                          ? format(form.dateOfBirth, "PPP")
                          : "Select date of birth"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={form.dateOfBirth}
                        onSelect={(d) => updateField("dateOfBirth", d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-2">
                  <Label>Current Address</Label>
                  <Input
                    value={form.currentAddress}
                    onChange={(e) =>
                      updateField("currentAddress", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Employment (repeatable) */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Employment Information</h3>
                <Button variant="outline" onClick={addEmployment}>
                  Add Employment
                </Button>
              </div>

              <div className="space-y-4">
                {(form.employmentInfo || []).length === 0 && (
                  <p className="text-sm text-gray-500">
                    No employment records yet. Add one.
                  </p>
                )}
                {(form.employmentInfo || []).map((emp, idx) => (
                  <div key={idx} className="border p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Employer</Label>
                        <Input
                          value={emp.employerName}
                          onChange={(e) =>
                            updateEmployment(
                              idx,
                              "employerName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Job title</Label>
                        <Input
                          value={emp.jobTitle}
                          onChange={(e) =>
                            updateEmployment(idx, "jobTitle", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Income</Label>
                        <Input
                          type="number"
                          value={emp.income || ""}
                          onChange={(e) =>
                            updateEmployment(idx, "income", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={emp.duration}
                          onChange={(e) =>
                            updateEmployment(idx, "duration", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={emp.address}
                          onChange={(e) =>
                            updateEmployment(idx, "address", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label>Proof document</Label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="mt-1"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            updateEmployment(idx, "proofDocumentFile", file);
                          }}
                        />

                        {emp.proofDocumentFile && (
                          <div className="text-xs text-gray-600 mt-1">
                            {emp.proofDocumentFile.name} selected
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="ghost"
                        onClick={() => removeEmployment(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Occupants / Pets / Message */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Number of occupants</Label>
                <Input
                  type="number"
                  value={form.occupantsCount}
                  onChange={(e) =>
                    updateField("occupantsCount", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Number of pets</Label>
                <Input
                  type="number"
                  value={form.petsCount}
                  onChange={(e) => updateField("petsCount", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Additional message</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Documents & Review */}
          {step === 4 && (
            <div>
              <div className="space-y-3">
                <div>
                  <Label>Upload documents (ID, payslips etc.)</Label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="mt-2"
                    onChange={(e) => {
                      console.log("onChange FIRED!");
                      const files = Array.from(e.target.files || []);
                      console.log(
                        "📁 Files selected in input:",
                        files.length,
                        files.map((f) => f.name)
                      );
                      files.forEach((file) => {
                        console.log("Calling handleAddDocument for:", file.name);
                        handleAddDocument(file);
                      });
                    }}
                  />
                </div>

                <div>
                  <h4 className="font-medium">Selected files</h4>
                  {form.documents && form.documents.length > 0 ? (
                    <ul className="list-disc pl-5 mt-2">
                      {form.documents.map((file, i) => (
                        <li key={i} className="text-gray-700">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      No files selected yet
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Review</h4>
                  <p>
                    <strong>Name:</strong> {form.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {form.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {form.phone}
                  </p>
                  <p>
                    <strong>Occupants:</strong> {form.occupantsCount}
                  </p>
                  <p>
                    <strong>Pets:</strong> {form.petsCount}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    <strong>Note:</strong> By submitting you agree that the
                    landlord may review your information.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 4 && (
              <Button onClick={() => setStep(step + 1)}>Next</Button>
            )}
            {step === 4 && (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending
                  ? "Submitting..."
                  : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {redirectAfterSubmit && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          {/* small overlay message or redirect */}
          <div className="bg-white p-4 rounded shadow">
            Submitted — thank you.
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyForm;
