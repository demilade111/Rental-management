import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const getStatusColor = (status) => {
    switch (status) {
        case "ACTIVE":
            return "bg-green-100 text-green-700 border border-green-300";
        case "DRAFT":
            return "bg-gray-200 text-gray-700 border border-gray-300";
        case "EXPIRED":
            return "bg-red-100 text-red-700 border border-red-300";
        case "TERMINATED":
            return "bg-orange-100 text-orange-700 border border-orange-300";
        default:
            return "bg-gray-100 text-gray-700 border border-gray-300";
    }
};

const CustomLeaseCard = ({
    lease,
    onViewFile,
    onEdit,
    onDelete,
    isSelected = false,
    onSelectionChange,
}) => {
    const tenantName = lease.tenant
        ? `${lease.tenant.firstName || ""} ${lease.tenant.lastName || ""}`.trim()
        : "No tenant assigned";
    
    const listingInfo = lease.listing
        ? lease.listing.title || lease.listing.streetAddress || "N/A"
        : "No listing";

    const listingAddress = lease.listing?.streetAddress
        ? `${lease.listing.streetAddress}${lease.listing.city ? `, ${lease.listing.city}` : ""}${lease.listing.state ? `, ${lease.listing.state}` : ""}`
        : "";

    const getStatusDisplayName = (status) => {
        switch (status) {
            case "ACTIVE":
                return "Active";
            case "DRAFT":
                return "Draft";
            case "EXPIRED":
                return "Expired";
            case "TERMINATED":
                return "Terminated";
            default:
                return status || "N/A";
        }
    };

    return (
        <Card className="border border-gray-300 hover:shadow-md cursor-pointer transition-shadow mb-3 p-3">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-4 items-center">
                {/* Checkbox for bulk selection */}
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                            onSelectionChange?.(lease.id, checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="!border-black"
                    />
                </div>

                {/* Column 1: Lease Name */}
                <div className="text-[16px] text-gray-700 truncate">
                    <div className="font-semibold text-gray-900">{lease.leaseName}</div>
                    {lease.createdAt && (
                        <div className="text-sm font-normal text-gray-600 text-wrap">
                            Created {formatDistanceToNow(new Date(lease.createdAt), { addSuffix: true })}
                        </div>
                    )}
                </div>

                {/* Column 2: Listing Info */}
                <div className="text-[16px] font-semibold text-gray-900 truncate border-l border-gray-300 pl-10">
                    <div className="truncate">{listingInfo}</div>
                    {listingAddress && (
                        <div className="text-sm font-normal text-gray-600 truncate">
                            {listingAddress}
                        </div>
                    )}
                </div>

                {/* Column 3: Tenant */}
                <div className="flex justify-center mr-auto border-l border-gray-300 pl-10">
                    <div className="text-center">
                        <div className="text-[16px] font-semibold text-gray-900">{tenantName}</div>
                    </div>
                </div>

                {/* Column 4: Status */}
                <div className="flex justify-center mr-auto border-l border-gray-300 pl-10">
                    <Badge className={`${getStatusColor(lease.leaseStatus)} whitespace-nowrap text-xs px-2 py-1 text-gray-900 border-0`}>
                        {getStatusDisplayName(lease.leaseStatus)}
                    </Badge>
                </div>

                {/* Column 5: Actions */}
                <div className="flex gap-6 justify-center mr-auto border-l border-gray-300 pl-10">
                    <div className="flex gap-3 justify-center">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewFile?.(lease);
                            }}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
                            title="View File"
                            variant="ghost"
                            size="icon"
                        >
                            <FileText className="w-5 h-5 text-white" />
                        </Button>

                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(lease);
                            }}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
                            title="Edit"
                            variant="ghost"
                            size="icon"
                        >
                            <Pencil className="w-5 h-5 text-white" />
                        </Button>

                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(lease);
                            }}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                            title="Delete"
                            variant="ghost"
                            size="icon"
                        >
                            <Trash2 className="w-5 h-5 text-white" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CustomLeaseCard;

