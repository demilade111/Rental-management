// SignLeasePage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import SignaturePad from "react-signature-pad-wrapper";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";

export default function SignLeasePage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuthStore();

    const sigPadRef = useRef(null);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            navigate(`/signup?redirect=/leases-invite/sign/${token}`);
        }
    }, [isLoading, user, navigate, token]);

    const handleSubmit = async () => {
        if (!sigPadRef.current) {
            return toast.error("Signature pad not ready.");
        }

        if (sigPadRef.current.isEmpty()) {
            return toast.error("Please provide your signature.");
        }

        setIsSubmitting(true);

        try {
            // Get data URL of the signature
            const signatureDataURL = sigPadRef.current.toDataURL("image/png");

            // Send to backend
            await api.post(`${API_ENDPOINTS.LEASES_INVITE.BASE}/sign/${token}`, {
                signature: signatureDataURL,
            });

            toast.success("Lease signed successfully!");
            navigate("/signing/thank-you");
        } catch (err) {
            console.error("Sign error:", err);
            toast.error(err.response?.data?.message || "Failed to sign lease");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearSignature = () => {
        sigPadRef.current?.clear();
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center py-8 px-4">
            {/* PDF Viewer */}
            <div className="w-full max-w-3xl h-[600px] bg-gray-200 rounded border shadow mb-6 overflow-hidden">
                <iframe
                    src="/lease-agreement-sample.pdf"
                    className="w-full h-full"
                    title="Lease Agreement"
                    onLoad={() => setPdfLoaded(true)}
                />
            </div>

            {!pdfLoaded && (
                <p className="text-sm text-gray-500 mb-4">Loading lease document...</p>
            )}

            {/* Signature Pad */}
            <div className="mb-6 w-full max-w-md mt-10">
                <div
                    style={{
                        width: "100%",
                        maxWidth: 400,
                        border: "1px solid #000",
                        borderRadius: 8,
                        overflow: "hidden",
                    }}
                >
                    <SignaturePad
                        ref={sigPadRef}
                        options={{
                            penColor: "black",
                            backgroundColor: "white",
                        }}
                        canvasProps={{
                            width: 400, // match the container width
                            height: 150,
                            style: { display: "block", width: "100%", height: "150px" }, // ensures it stretches correctly
                        }}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={clearSignature}
                    className="rounded-2xl"
                >
                    Clear
                </Button>

                <Button
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 flex items-center gap-2 disabled:opacity-70"
                >
                    <FileEdit size={18} />
                    {isSubmitting ? "Signing..." : "Sign Lease"}
                </Button>
            </div>
        </div>
    );
}
