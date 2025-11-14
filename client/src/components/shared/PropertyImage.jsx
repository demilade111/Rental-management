import { useState, useEffect } from "react";
import { Home } from "lucide-react";
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";

const PropertyImage = ({ image, alt = "Property", className = "" }) => {
    const [resolvedSrc, setResolvedSrc] = useState();
    const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);

    const rawSrc = image?.url || image;

    useEffect(() => {
        let cancelled = false;
        async function resolve() {
            if (!rawSrc) {
                setResolvedSrc(undefined);
                setLoading(false);
                return;
            }
            try {
                const u = new URL(rawSrc);
                const isS3Unsigned = u.hostname.includes('s3.') && !rawSrc.includes('X-Amz-Signature');
                if (!isS3Unsigned) {
                    if (!cancelled) {
                        setResolvedSrc(encodeURI(rawSrc));
                        setLoading(false);
                    }
                    return;
                }
                const key = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
                if (!key) {
                    if (!cancelled) {
                        setResolvedSrc(encodeURI(rawSrc));
                        setLoading(false);
                    }
                    return;
                }
                const resp = await api.get(`${API_ENDPOINTS.UPLOADS.BASE}/s3-download-url`, { params: { key } });
                const signed = resp.data?.data?.downloadURL || resp.data?.downloadURL;
                if (!cancelled) {
                    setResolvedSrc(signed || encodeURI(rawSrc));
                    setLoading(false);
                }
            } catch {
                if (!cancelled) {
                    setResolvedSrc(encodeURI(rawSrc));
                    setLoading(false);
                }
            }
        }
        setLoading(true);
        setErrored(false);
        resolve();
        return () => { cancelled = true; };
    }, [rawSrc]);

    if (!rawSrc || errored) {
        return (
            <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center ${className}`}>
                <Home className="w-12 h-12 text-gray-400" />
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Shimmer Loading State */}
            {loading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200">
                    <div className="absolute inset-0 shimmer-effect"></div>
                </div>
            )}
            {/* Image with Smooth Fade-in */}
            <img
                src={resolvedSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                    loading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                }`}
                onLoad={() => setLoading(false)}
                onError={() => { setErrored(true); setLoading(false); }}
            />
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .shimmer-effect {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.6) 40%,
                        rgba(255, 255, 255, 0.8) 50%,
                        rgba(255, 255, 255, 0.6) 60%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    animation: shimmer 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default PropertyImage;

