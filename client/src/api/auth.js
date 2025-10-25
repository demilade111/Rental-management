import { useAuthStore } from "@/store/authStore";

export const fetchWithAuth = async (url, options = {}) => {
    const token = useAuthStore.getState().token; // get latest token
    const headers = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        // Token expired or invalid
        alert("Session expired. Please login again.");
        useAuthStore.getState().logout(); // clear token and redirect to login
        window.location.reload();
        throw new Error("Token expired");
    }

    if (!response.ok) {
        const error = await response.json();
        console.log("Create listing error:", error);

        // Parse details into array
        let parsedDetails = [];
        try {
            parsedDetails = JSON.parse(error.details || "[]");
        } catch (e) {
            console.error("Failed to parse error details", e);
        }

        throw {
            message: error.message || "Failed to create listing",
            details: parsedDetails,
        };
    }

    return response.json();
};
