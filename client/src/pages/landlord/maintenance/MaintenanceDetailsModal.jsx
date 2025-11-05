import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCategoryDisplayName, getPriorityDisplayName } from "@/lib/maintenanceApi";
import axios from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";

const MaintenanceDetailsModal = ({ request, open, onClose }) => {
    const sliderRef = useRef(null);
    const canScroll = (request?.images || []).length > 1;
    const scrollBy = 220;
    const scrollLeft = () => sliderRef.current?.scrollBy({ left: -scrollBy, behavior: "smooth" });
    const scrollRight = () => sliderRef.current?.scrollBy({ left: scrollBy, behavior: "smooth" });

    // Translate vertical mouse wheel to horizontal scroll on the images strip only
    const handleWheel = (e) => {
        const el = sliderRef.current;
        if (!el) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            const before = el.scrollLeft;
            el.scrollLeft += e.deltaY;
            if (el.scrollLeft !== before) e.preventDefault();
        }
    };

    useEffect(() => {
        // Reset scroll position when modal opens so first image isn't clipped
        if (open && sliderRef.current) {
            sliderRef.current.scrollLeft = 0;
        }
    }, [open]);

    const imageUrls = useMemo(
        () => (request?.images || []).map((img) => img.url || img),
        [request]
    );
    const [resolvedUrls, setResolvedUrls] = useState([]);

    useEffect(() => {
        let cancelled = false;
        async function resolveUrls() {
            if (!imageUrls.length) {
                setResolvedUrls([]);
                return;
            }
            try {
                const results = await Promise.all(
                    imageUrls.map(async (rawUrl) => {
                        const url = typeof rawUrl === "string" ? rawUrl : String(rawUrl);
                        // Try to derive S3 key from URL to request a signed download URL if needed
                        try {
                            const u = new URL(url);
                            // key is everything after the first '/'
                            const key = u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
                            if (!key) return url;
                            const resp = await axios.get(`${API_ENDPOINTS.UPLOADS.BASE}/s3-download-url`, {
                                params: { key },
                            });
                            const signed = resp.data?.data?.downloadURL || resp.data?.downloadURL;
                            return signed || encodeURI(url);
                        } catch (e) {
                            // Fallback to original URL (works for public buckets)
                            return encodeURI(url);
                        }
                    })
                );
                if (!cancelled) setResolvedUrls(results);
            } catch {
                if (!cancelled) setResolvedUrls(imageUrls);
            }
        }
        resolveUrls();
        return () => {
            cancelled = true;
        };
    }, [imageUrls]);

    const ImageWithShimmer = ({ src, alt }) => {
        const [loaded, setLoaded] = useState(false);
        return (
            <div className="h-28 w-40 relative flex-shrink-0 snap-start">
                {!loaded && (
                    <div className="h-full w-full rounded-md bg-gray-200 dark:bg-gray-800 shimmer-container">
                        <div className="shimmer-bar" />
                    </div>
                )}
                <img
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    className={`h-28 w-40 rounded-md object-cover border absolute inset-0 ${loaded ? "opacity-100" : "opacity-0"}`}
                />
            </div>
        );
    };

    if (!request) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
            <DialogContent className="bg-white dark:bg-gray-900 rounded-xl">
                <DialogHeader className="px-2 pt-3">
                    <DialogTitle className="text-base md:text-lg">Maintenance Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-3 w-full max-w-xl max-h-[90vh] overflow-y-auto px-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <div className="text-sm">{request.title}</div>
                    </div>

                    <div className="grid gap-4 grid-cols-1">
                        <div>
                            <label className="block text-sm font-medium mb-1">Property</label>
                            <div className="text-sm">{request.listing?.title || "Unknown Property"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>
                                <div className="text-sm">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            request.priority === "URGENT"
                                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                : request.priority === "HIGH"
                                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                        }`}
                                    >
                                        {getPriorityDisplayName(request.priority)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <div className="text-sm">{getCategoryDisplayName(request.category)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <div className="text-sm whitespace-pre-wrap">{request.description}</div>
                    </div>

                    {resolvedUrls.length > 0 && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium mb-1">Image(s)</label>
                                {canScroll && (
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={scrollLeft}>◀</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={scrollRight}>▶</Button>
                                    </div>
                                )}
                            </div>
                            <div
                                ref={sliderRef}
                                className="flex gap-3 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 w-full"
                                style={{ overscrollBehaviorX: "contain", touchAction: "pan-x" }}
                                onWheel={handleWheel}
                            >
                                {resolvedUrls.map((url) => (
                                    <ImageWithShimmer key={url} src={url} alt="maintenance" />
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MaintenanceDetailsModal;


