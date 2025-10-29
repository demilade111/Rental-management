// pages/ApplyForm.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";


const ApplyForm = () => {
    const { publicId } = useParams();
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // Fetch application template
    const { data: application, isLoading } = useQuery({
        queryKey: ["publicApplication", publicId],
        queryFn: async () => {
            const res = await api.get(`${API_ENDPOINTS.APPLICATIONS.BASE}/${publicId}`);
            return res.data.data;
        },
    });

    useEffect(() => {
        if (application) {
            // Initialize formData
            const initial = {
                fullName: application.existingData?.fullName || "",
                email: application.existingData?.email || "",
                phone: application.existingData?.phone || "",
                message: "",
                documents: {},
            };
            // Init documents based on requirements
            application.requirements?.forEach((req) => {
                initial.documents[req] = "";
            });
            setFormData(initial);
        }
    }, [application]);

    if (isLoading) return <div>Loading...</div>;
    if (!application) return <div>Application not found</div>;

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleDocumentChange = (field, value) => {
        setFormData({
            ...formData,
            documents: { ...formData.documents, [field]: value },
        });
    };

    const handleSubmit = async () => {
        try {
            await api.put(`/applications/public/${publicId}`, formData);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Failed to submit application");
        }
    };

    if (submitted)
        return (
            <div className="max-w-xl mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold">Application Submitted!</h1>
                <p>Thank you for applying. The landlord will review your application shortly.</p>
            </div>
        );

    return (
        <div className="max-w-xl mx-auto p-4 space-y-4">
            <h1 className="text-xl font-bold">Apply for {application.listing.title}</h1>
            <p>{application.listing.streetAddress}, {application.listing.city}</p>

            <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
            />
            <Input
                label="Email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
            />
            <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
            />
            <Textarea
                label="Message to Landlord"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
            />

            {/* Dynamic Document Requirements */}
            {application.requirements?.map((req) => (
                <div key={req}>
                    <Input
                        label={req
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        value={formData.documents[req] || ""}
                        placeholder="Paste document URL here"
                        onChange={(e) => handleDocumentChange(req, e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                        Please upload the document and paste the URL.
                    </p>
                </div>
            ))}

            <Button onClick={handleSubmit} className="w-full">
                Submit Application
            </Button>
        </div>
    );
}

export default ApplyForm;
