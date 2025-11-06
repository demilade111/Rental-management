// SignLeasePage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import SignaturePad from "react-signature-pad-wrapper";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import { Button } from "@/components/ui/button";
import { FileEdit, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SignLeasePage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuthStore();

    const sigPadRef = useRef(null);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAlreadySigned, setIsAlreadySigned] = useState(false);
    const [isLoadingInvite, setIsLoadingInvite] = useState(true);

    // Check if lease is already signed
    useEffect(() => {
        const checkLeaseStatus = async () => {
            try {
                const res = await api.get(`${API_ENDPOINTS.LEASES_INVITE.BASE}/invite/${token}`);
                if (res.data.invite?.signed) {
                    setIsAlreadySigned(true);
                }
            } catch (err) {
                // If error is about already signed, show that message
                if (err.response?.data?.message?.includes("already been signed")) {
                    setIsAlreadySigned(true);
                } else {
                    toast.error(err.response?.data?.message || "Failed to load lease information");
                }
            } finally {
                setIsLoadingInvite(false);
            }
        };

        if (token) {
            checkLeaseStatus();
        }
    }, [token]);

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

    // Show already signed message
    if (isLoadingInvite) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <p className="text-sm text-gray-500">Loading lease information...</p>
            </div>
        );
    }

    if (isAlreadySigned) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center py-8 px-4">
                <Card className="max-w-md w-full text-center py-10 px-6">
                    <CardContent className="flex flex-col items-center gap-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h1 className="text-2xl font-bold">Lease Already Signed</h1>
                        <p className="text-gray-700">
                            This lease has already been signed. You cannot sign it again.
                        </p>
                        <Button
                            className="mt-4 rounded-2xl"
                            onClick={() => navigate("/tenant/dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
