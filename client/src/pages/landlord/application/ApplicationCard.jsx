import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Send, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const getStatusColor = (status) => {
    switch (status) {
        case "APPROVED":
            return "bg-green-100 text-green-700 border border-green-300";
        case "REJECTED":
            return "bg-red-100 text-red-700 border border-red-300";
        case "CANCELLED":
            return "bg-gray-200 text-gray-700 border border-gray-300";
        default:
            return "bg-orange-100 text-blue-700 border border-blue-300";
    }
};

const ApplicationCard = ({ app, onApprove, onReject, onSendLease, onDelete, onView }) => {
    const navigate = useNavigate();
    const [isSending, setIsSending] = useState(false);

    const handleSendLeaseClick = async (e) => {
        e.stopPropagation();
        setIsSending(true);
        try {
            await onSendLease?.(app); // Call parent handler
        } finally {
            setIsSending(false);
        }
    };

    const handleViewClick = (e) => {
        e.stopPropagation();
        onView?.(app);
    };

    return (
        <Card className="border border-gray-300 hover:shadow-md cursor-pointer transition-shadow mb-3 p-3">
            <div className="grid grid-cols-4 gap-4 items-center justify-items-start">
                {/* Column 1: Applicant Info */}
                <div className="text-[16px] text-gray-700 truncate pl-10">
                    {app.fullName}
                    {app.createdAt && (
                        <div className="text-sm font-normal text-gray-600 text-wrap">
                            Submitted {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                        </div>
                    )}
                </div>

                {/* Column 2: Listing Info */}
                <div className="text-[16px] font-semibold text-gray-900 truncate pl-10">
                    {app.listing.title}
                    {app.listing.streetAddress && (
                        <div className="text-sm font-normal text-wrap text-gray-600">
                            {app.listing.streetAddress}
                        </div>
                    )}
                </div>

                {/* Column 3: Status */}
                <div className="flex justify-center mr-auto">
                    <Badge className={`${getStatusColor(app.status)} whitespace-nowrap text-sm px-3 py-1 text-gray-900 border-0`}>
                        {app.status}
                    </Badge>
                </div>

                {/* Column 4: Actions */}
                <div className="flex gap-6 justify-center mr-auto">
                    <div className="flex gap-3 justify-center">
                        {["PENDING", "NEW"].includes(app.status) && (
                            <Button
                                onClick={handleViewClick}
                                className="flex items-center gap-2 sm:w-28 rounded-xl bg-gray-900"
                            >
                                <Eye /> View
                            </Button>
                        )}

                        {app.status === "APPROVED" && (
                            <Button
                                onClick={handleSendLeaseClick}
                                className="flex items-center gap-2 sm:w-28 rounded-xl bg-gray-900"
                                disabled={isSending}
                            >
                                <Send />
                                {isSending ? "Sending..." : "Send Lease"}
                            </Button>
                        )}

                        {app.status === "REJECTED" && (
                            <Button
                                onClick={() => onDelete?.(app.id)}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-500 sm:w-28 rounded-xl"
                            >
                                <Trash2 /> Delete
                            </Button>
                        )}

                        {app.status !== "APPROVED" && app.status !== "REJECTED" && app.status !== "PENDING" && (
                            <>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApprove?.(app.id);
                                    }}
                                    className="text-white bg-gray-900 rounded-2xl px-6 transition"
                                    title="Approve"
                                >
                                    <Check className="w-6 h-6" />
                                </Button>

                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onReject?.(app.id);
                                    }}
                                    className="text-white rounded-2xl px-6 transition bg-red-500 hover:bg-red-500"
                                    title="Reject"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ApplicationCard;
