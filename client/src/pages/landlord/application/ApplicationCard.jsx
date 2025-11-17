import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Send, Trash2, X, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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

const ApplicationCard = ({ 
    app, 
    onApprove, 
    onReject, 
    onSendLease, 
    onDelete, 
    onView,
    isSelected = false,
    onSelectionChange,
}) => {
    const navigate = useNavigate();
    const [isSending, setIsSending] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // "APPROVE" | "REJECT" | "DELETE"

    const isPlaceholderApp = app.fullName === "N/A" && app.email === "na@example.com" && !app.tenantId;
    const canDeleteApplication = app.status === "REJECTED" || (app.status === "NEW" && isPlaceholderApp);

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
        <Card className="border border-gray-300 hover:shadow-md cursor-default transition-shadow mb-1 p-3">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-4 items-center">
                {/* Checkbox for bulk selection */}
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                            onSelectionChange?.(app.id, checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="!border-black"
                    />
                </div>
                
                {/* Column 1: Applicant Info */}
                <div className="text-sm sm:text-base text-gray-700 truncate">
                    {app.fullName}
                    {app.createdAt && (
                        <div className="text-xs sm:text-sm font-normal text-gray-600 text-wrap">
                            Submitted {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                        </div>
                    )}
                </div>

                {/* Column 2: Listing Info */}
                <div className="text-sm sm:text-base font-semibold text-gray-900 truncate border-l border-gray-300 pl-4">
                    {app.listing.title}
                    {app.listing.streetAddress && (
                        <div className="text-xs sm:text-sm font-normal text-wrap text-gray-600">
                            {app.listing.streetAddress}
                        </div>
                    )}
                </div>

                {/* Column 3: Created */}
                <div className="text-sm sm:text-base text-gray-700 border-l border-gray-300 pl-4">
                    {app.createdAt ? (
                        <>
                            <div>{format(new Date(app.createdAt), "MMM d, yyyy")}</div>
                            <div className="text-xs text-gray-500">
                                {format(new Date(app.createdAt), "h:mm a")}
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </div>

                {/* Column 4: Status */}
                <div className="flex justify-center mr-auto border-l border-gray-300 pl-4">
                    <Badge className={`${getStatusColor(app.status)} whitespace-nowrap text-[11px] px-2.5 py-0.5 text-gray-900 border-0`}>
                        {app.status}
                    </Badge>
                </div>

                {/* Column 5: Actions */}
                <div className="flex gap-6 justify-center mr-auto border-l border-gray-300 pl-4">
                    <div className="flex gap-3 justify-center">
                        {["PENDING", "NEW", "APPROVED"].includes(app.status) && (
                            <>
                                <Button
                                    onClick={handleViewClick}
                                    className="flex items-center gap-2 sm:w-28 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <Eye /> View
                                </Button>
                                {app.publicId && app.status === "PENDING" && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex items-center gap-2 sm:w-32 rounded-xl border-gray-300"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(`${window.location.origin}/apply/${app.publicId}`);
                                            toast.success("Application link copied");
                                        }}
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Link
                                    </Button>
                                )}
                            </>
                        )}

                        {app.status === "APPROVED" && (
                            <Button
                                onClick={handleSendLeaseClick}
                                className="flex items-center gap-2 sm:w-32 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                                disabled={isSending}
                            >
                                <Send />
                                {isSending ? "Sending..." : "Send Lease"}
                            </Button>
                        )}

                        {canDeleteApplication && (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingAction({ type: "DELETE", id: app.id });
                                }}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-500 sm:w-32 rounded-xl disabled:opacity-70"
                                disabled={isConfirming}
                            >
                                <Trash2 /> {isPlaceholderApp ? "Remove Link" : "Delete"}
                            </Button>
                        )}

                        {app.status !== "APPROVED" && app.status !== "REJECTED" && app.status !== "PENDING" && (
                            <>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingAction({ type: "APPROVE", id: app.id });
                                    }}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-6 transition disabled:opacity-70"
                                    disabled={isConfirming}
                                    title="Approve"
                                >
                                    <Check className="w-6 h-6" />
                                </Button>

                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingAction({ type: "REJECT", id: app.id });
                                    }}
                                    className="text-white rounded-2xl px-6 transition bg-red-500 hover:bg-red-500 disabled:opacity-70"
                                    disabled={isConfirming}
                                    title="Reject"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && !isConfirming && setPendingAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction?.type === "APPROVE"
                                ? "Approve Application"
                                : pendingAction?.type === "DELETE"
                                ? isPlaceholderApp ? "Remove Application Link" : "Delete Application"
                                : "Reject Application"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction?.type === "DELETE"
                                ? isPlaceholderApp
                                    ? "This will remove the generated application link so you can create a new one."
                                    : `Are you sure you want to delete ${app.fullName}'s application? This action cannot be undone.`
                                : `Are you sure you want to ${
                                      pendingAction?.type === "APPROVE" ? "approve" : "reject"
                                  } ${app.fullName}'s application for ${app.listing.title}?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isConfirming} className="rounded-2xl">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isConfirming}
                            className={`rounded-2xl ${
                                pendingAction?.type === "APPROVE" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-red-600 hover:bg-red-600"
                            }`}
                            onClick={() => {
                                if (!pendingAction) return;
                                setIsConfirming(true);
                                const action =
                                    pendingAction.type === "APPROVE"
                                        ? onApprove
                                        : pendingAction.type === "REJECT"
                                        ? onReject
                                        : onDelete;
                                Promise.resolve(action?.(pendingAction.id))
                                    .finally(() => {
                                        setIsConfirming(false);
                                        setPendingAction(null);
                                    });
                            }}
                        >
                            {isConfirming ? "Processing..." : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default ApplicationCard;
