import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Home, DollarSign } from 'lucide-react';
import { getPropertyCategory, PROPERTY_CATEGORY_NAMES, PROPERTY_OPTIONS } from '@/constants/propertyTypes';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apiEndpoints';
import { Checkbox } from '@/components/ui/checkbox';

// Thumbnail with signed URL resolving + shimmer and graceful fallback
const ListingThumbnail = ({ images, alt }) => {
    const [resolvedSrc, setResolvedSrc] = useState();
    const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);

    // Derive raw source from various shapes
    const rawSrc = (() => {
        if (!images) return undefined;
        if (typeof images === 'string') return images;
        if (Array.isArray(images) && images.length > 0) {
            const first = images[0];
            if (typeof first === 'string') return first;
            if (first && typeof first === 'object') {
                if (first instanceof File) return undefined;
                return first.url || first.fileUrl || first.src || undefined;
            }
        }
        return undefined;
    })();

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
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Home className="w-12 h-12 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
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

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();
    
    const handleClick = () => {
        navigate(`/landlord/portfolio/${property.id}`);
    };

    return (
        <Card onClick={handleClick} className="p-0 border border-gray-300 hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-28 bg-gray-100 flex-shrink-0 overflow-hidden">
                    <ListingThumbnail images={property?.images} alt={property.title || property.name || 'Listing image'} />
                </div>

                {/* Property Details */}
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center p-4 gap-4 md:gap-6">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1">{property.title}</h3>
                        <p className="text-xs text-gray-600">{property.streetAddress}</p>
                        <p className="text-xs text-gray-600">{property.zipCode}</p>
                    </div>

                    {/* Financial Info */}
                    <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 md:justify-start">
                        <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm whitespace-nowrap">
                                <span className="font-bold">Rent:</span> $ {property.rentAmount}
                            </p>
                            <p className="text-sm whitespace-nowrap">
                                <span className="font-bold">Deposit:</span> $ {property.securityDeposit}
                            </p>
                            {property.petDeposit > 0 && (
                                <p className="text-sm whitespace-nowrap">
                                    <span className="font-bold">Pet Deposit:</span> $ {property.petDeposit}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Property Type */}
                    <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 md:justify-start">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <Home className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm whitespace-nowrap">
                                <span className="font-bold">
                                    {PROPERTY_CATEGORY_NAMES[getPropertyCategory(property.propertyType)]}:{" "}
                                </span>
                                {
                                    // Find the matching label for this propertyType
                                    Object.values(PROPERTY_OPTIONS)
                                        .flat()
                                        .find((t) => t.value === property.propertyType)?.label || property.propertyType
                                }
                            </p>


                            <p className="text-sm whitespace-nowrap">
                                <span className="font-bold">Size:</span> {property.totalSquareFeet} sq ft
                            </p>
                            {property.bedrooms && (
                                <p className="text-sm whitespace-nowrap">
                                    {property.bedrooms} Bedroom | {property.bathrooms} Bath
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex flex-row md:flex-col gap-3 md:gap-2 w-full md:w-auto md:flex-1 md:justify-center">
                        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                property.status === 'ACTIVE' 
                                    ? 'bg-green-500' 
                                    : 'bg-green-500/30'
                            }`}></div>
                            <span>listed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                property.status === 'RENTED' 
                                    ? 'bg-orange-500' 
                                    : 'bg-orange-500/30'
                            }`}></div>
                            <span>occupied</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PropertyCard;
