// SignLeasePage.jsx
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";

export default function SignLeasePage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuthStore(); // <-- assumes you store loading state
    const hasRun = useRef(false); // prevents double calls

    useEffect(() => {
        // Wait until the auth store finishes checking token/localStorage
        if (isLoading) return;

        // Not logged in → redirect to signup
        if (!user) {
            navigate(`/signup?redirect=/leases-invite/sign/${token}`);
            return;
        }

        // Prevent double execution in Strict Mode
        if (hasRun.current) return;
        hasRun.current = true;

        const signLease = async () => {
            try {
                await api.post(`${API_ENDPOINTS.LEASES_INVITE.BASE}/sign/${token}`);
                toast.success("Lease signed successfully!");
                navigate("/signing/thank-you");
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to sign lease");
            }
        };

        signLease();
    }, [token, user, isLoading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            Signing your lease...
        </div>
    );
}
