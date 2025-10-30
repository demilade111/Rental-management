import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

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

const ApplicationCard = ({ app, onApprove, onReject }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/applications/${app.id}`);
    };

    return (
        <Card
            onClick={handleClick}
            className="border border-gray-300 hover:shadow-md cursor-pointer transition-shadow mb-3"
        >
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
                <div className="flex justify-center mx-auto">
                    <Badge className={`${getStatusColor(app.status)} whitespace-nowrap text-sm px-3 py-1 text-gray-900 border-0`}>
                        {app.status}
                    </Badge>
                </div>

                {/* Column 4: Actions */}
                <div className="flex gap-6 justify-center mx-auto pr-8">
                    {/* Prevent card navigation when clicking buttons */}
                    <button
                        onClick={(e) => { 
                            e.stopPropagation();
                            onApprove?.(app.id);
                        }}
                        className="text-white bg-gray-900 rounded-full transition"
                        title="Approve"
                    >
                        <Check className="w-6 h-6" />
                    </button>

                    <button
                        onClick={(e) => { 
                            e.stopPropagation();
                            onReject?.(app.id);
                        }}
                        className="text-white bg-gray-900 rounded-full transition"
                        title="Reject"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

            </div>
        </Card>
    );
};

export default ApplicationCard;
