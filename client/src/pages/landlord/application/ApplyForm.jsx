import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
            // example entry: { employerName: "", jobTitle: "", income: "", duration: "", address: "", proofDocumentUrl: "" }
        ],
        documents: [], // array of uploaded URLs
    });

    // load application meta by publicId (listing info & requirements)
    const { data: applicationMeta, isLoading, isError } = useQuery({
        queryKey: ["applicationPublic", publicId],
        queryFn: async () => {
            const res = await api.get(`${API_ENDPOINTS.APPLICATIONS.BASE}/${publicId}`);
            return res.data.data || res.data;
        },
        enabled: !!publicId,
        staleTime: 1000 * 60 * 5,
    });

    // File upload mutation (single file -> returns { url })
    const uploadMutation = useMutation({
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            // adjust endpoint if your upload route differs
            const res = await api.post(`${API_ENDPOINTS.UPLOADS.BASE}/s3-url`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return res.data.data || res.data;
        },
    });

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await api.post(`${API_ENDPOINTS.UPLOADS.BASE}/${publicId}/submit`, payload);
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
                setForm((f) => ({ ...f, fullName: applicationMeta.fullName || f.fullName }));
            }
            // optionally read requirements from applicationMeta.message if you stored requirements there
            // but that's optional UI behavior
        }
    }, [applicationMeta]);

    if (!publicId) return <Navigate to="/" replace />;

    if (isLoading) {
        // show header + loading body
        return <LoadingState message="Loading application..." />;
    }

    if (isError || !applicationMeta) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Application not found</h2>
                    <p className="text-sm text-gray-600">That application link may be invalid or expired.</p>
                </div>
            </div>
        );
    }

    // ---------- helper handlers ----------
    const updateField = (key, value) => setForm((s) => ({ ...s, [key]: value }));
    const addEmployment = () =>
        setForm((s) => ({ ...s, employmentInfo: [...(s.employmentInfo || []), { employerName: "", jobTitle: "", income: "", duration: "", address: "", proofDocumentUrl: "" }] }));
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

    async function handleFileUpload(file, category = "applications") {
        // 1. Request presigned URL from backend
        const { data } = await api.get("/api/v1/upload/s3-url", {
            params: {
                fileName: file.name,
                fileType: file.type,
                category,
            },
        });

        const { uploadURL, key } = data.data; // <- adjust according to your SuccessResponse
        console.log(data)

        console.log(`${import.meta.env.VITE_REACT_APP_S3_BASE_URL}/${key}`)
        // 2. Upload file to S3
        await fetch(uploadURL, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });


        // 3. Return the key or full URL to store in your form
        return `${import.meta.env.VITE_REACT_APP_S3_BASE_URL}/${key}`;
    }


    const handleAddDocument = async (file) => {
        await handleFileUpload(file, (url) => {
            setForm((s) => ({ ...s, documents: [...(s.documents || []), url] }));
        });
    };

    const handleSubmit = async () => {
        // basic client-side validation (expand as needed)
        if (!form.fullName || !form.email) {
            toast.error("Please provide name and email");
            setStep(1);
            return;
        }

        const payload = {
            // fields similar to backend create schema
            fullName: form.fullName,
            email: form.email,
            phone: form.phone || null,
            dateOfBirth: form.dateOfBirth ? form.dateOfBirth.toISOString() : null,
            monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
            currentAddress: form.currentAddress || null,
            moveInDate: form.moveInDate ? form.moveInDate.toISOString() : null,
            occupants: form.occupantsCount ? { count: Number(form.occupantsCount) } : null,
            pets: form.petsCount ? { count: Number(form.petsCount) } : null,
            documents: form.documents || [],
            references: null,
            message: form.message || null,
            employmentInfo: form.employmentInfo?.map((e) => ({
                employerName: e.employerName,
                jobTitle: e.jobTitle,
                income: e.income ? Number(e.income) : null,
                duration: e.duration || null,
                address: e.address || null,
                proofDocument: e.proofDocumentUrl || null,
            })) || [],
        };

        await submitMutation.mutateAsync(payload);
    };

    // ---------- UI Steps ----------
    return (
        <div className="min-h-screen flex items-start justify-center py-10 px-4 md:px-8">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Apply for {applicationMeta.listing?.title || "property"}</h1>
                    <p className="text-sm text-gray-600">{applicationMeta.listing?.streetAddress}</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 mb-6">
                    <div className={`px-3 py-1 rounded ${step === 1 ? "bg-black text-white" : "bg-gray-100"}`}>1. Personal</div>
                    <div className={`px-3 py-1 rounded ${step === 2 ? "bg-black text-white" : "bg-gray-100"}`}>2. Employment</div>
                    <div className={`px-3 py-1 rounded ${step === 3 ? "bg-black text-white" : "bg-gray-100"}`}>3. Occupants</div>
                    <div className={`px-3 py-1 rounded ${step === 4 ? "bg-black text-white" : "bg-gray-100"}`}>4. Documents</div>
                </div>

                {/* Form Body */}
                <div className="space-y-6">

                    {/* STEP 1: Personal */}
                    {step === 1 && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Full name</Label>
                                    <Input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                                </div>

                                <div>
                                    <Label>Phone</Label>
                                    <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                                </div>

                                <div>
                                    <Label>Date of birth</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full text-left">
                                                {form.dateOfBirth ? format(form.dateOfBirth, "PPP") : "Select date of birth"}
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
                                    <Input value={form.currentAddress} onChange={(e) => updateField("currentAddress", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Employment (repeatable) */}
                    {step === 2 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium">Employment Information</h3>
                                <Button variant="outline" onClick={addEmployment}>Add Employment</Button>
                            </div>

                            <div className="space-y-4">
                                {(form.employmentInfo || []).length === 0 && <p className="text-sm text-gray-500">No employment records yet. Add one.</p>}
                                {(form.employmentInfo || []).map((emp, idx) => (
                                    <div key={idx} className="border p-4 rounded">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <Label>Employer</Label>
                                                <Input value={emp.employerName} onChange={(e) => updateEmployment(idx, "employerName", e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Job title</Label>
                                                <Input value={emp.jobTitle} onChange={(e) => updateEmployment(idx, "jobTitle", e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Income</Label>
                                                <Input type="number" value={emp.income || ""} onChange={(e) => updateEmployment(idx, "income", e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Duration</Label>
                                                <Input value={emp.duration} onChange={(e) => updateEmployment(idx, "duration", e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Address</Label>
                                                <Input value={emp.address} onChange={(e) => updateEmployment(idx, "address", e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Proof document</Label>
                                                <input
                                                    type="file"
                                                    className="mt-1"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        console.log(file)
                                                        const url = await handleFileUpload(file, "applications");
                                                        console.log("Uploaded file URL:", url);

                                                        updateEmployment(idx, "proofDocumentUrl", url);
                                                    }}
                                                />

                                                {emp.proofDocumentUrl && <div className="text-xs text-gray-600 mt-1">Uploaded</div>}
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-3">
                                            <Button variant="ghost" onClick={() => removeEmployment(idx)}>Remove</Button>
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
                                <Input type="number" value={form.occupantsCount} onChange={(e) => updateField("occupantsCount", e.target.value)} />
                            </div>
                            <div>
                                <Label>Number of pets</Label>
                                <Input type="number" value={form.petsCount} onChange={(e) => updateField("petsCount", e.target.value)} />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Additional message</Label>
                                <Textarea value={form.message} onChange={(e) => updateField("message", e.target.value)} />
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
                                        className="mt-2"
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            for (const file of files) {
                                                await handleAddDocument(file);
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <h4 className="font-medium">Uploaded files</h4>
                                    <ul className="list-disc pl-5 mt-2">
                                        {(form.documents || []).map((d, i) => (
                                            <li key={i}><a href={d} className="text-blue-600 underline" target="_blank" rel="noreferrer">{d}</a></li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-gray-50 p-4 rounded">
                                    <h4 className="font-semibold mb-2">Review</h4>
                                    <p><strong>Name:</strong> {form.fullName}</p>
                                    <p><strong>Email:</strong> {form.email}</p>
                                    <p><strong>Phone:</strong> {form.phone}</p>
                                    <p><strong>Occupants:</strong> {form.occupantsCount}</p>
                                    <p><strong>Pets:</strong> {form.petsCount}</p>
                                    <p className="mt-2 text-sm text-gray-600"><strong>Note:</strong> By submitting you agree that the landlord may review your information.</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <div>
                        {step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
                    </div>

                    <div className="flex items-center gap-3">
                        {step < 4 && <Button onClick={() => setStep(step + 1)}>Next</Button>}
                        {step === 4 && (
                            <Button
                                onClick={handleSubmit}
                                disabled={submitMutation.isLoading}
                            >
                                {submitMutation.isLoading ? "Submitting..." : "Submit Application"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {redirectAfterSubmit && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                    {/* small overlay message or redirect */}
                    <div className="bg-white p-4 rounded shadow">Submitted — thank you.</div>
                </div>
            )}
        </div>
    );
};

export default ApplyForm;
