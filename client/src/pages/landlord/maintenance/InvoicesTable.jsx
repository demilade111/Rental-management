import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Share2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import api from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apiEndpoints";

const InvoicesTable = ({ maintenanceRequestId, refreshTrigger, maintenanceRequest }) => {
    const [invoices, setInvoices] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchInvoices = async (isInitial = false) => {
        try {
            // Only show loading on initial fetch, not on refresh
            if (isInitial) {
                setInitialLoading(true);
            }
            const response = await api.get(
                `${API_ENDPOINTS.INVOICES.BASE}?maintenanceRequestId=${maintenanceRequestId}`
            );
            const invoicesData = response.data?.data || response.data || [];
            
            // Debug: Log received invoices
            console.log(`\n📋 INVOICES TABLE - Maintenance ID: ${maintenanceRequestId}`);
            console.log(`  Received ${invoicesData.length} invoices from backend`);
            invoicesData.forEach((inv, idx) => {
                console.log(
                    `    [${idx}] Amount: $${inv.amount}, SharedWithTenant: ${inv.sharedWithTenant}, SharedWithLandlord: ${inv.sharedWithLandlord}, Creator: ${inv.createdByRole}`
                );
            });
            
            setInvoices(invoicesData);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            setInvoices([]);
        } finally {
            if (isInitial) {
                setInitialLoading(false);
            }
        }
    };

    useEffect(() => {
        if (maintenanceRequestId) {
            fetchInvoices(true); // Initial load
        }
    }, [maintenanceRequestId]);

    // Refresh without loading state
    useEffect(() => {
        if (maintenanceRequestId && refreshTrigger > 0) {
            fetchInvoices(false); // Refresh without loading
        }
    }, [refreshTrigger]);

    const handleDelete = async () => {
        if (!selectedInvoice) return;

        setIsDeleting(true);
        try {
            await api.delete(`${API_ENDPOINTS.INVOICES.BASE}/${selectedInvoice.id}`);
            toast.success("Invoice deleted successfully");
            fetchInvoices(false); // Refresh without loading state
        } catch (error) {
            console.error("Error deleting invoice:", error);
            toast.error(error.response?.data?.message || "Failed to delete invoice");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setSelectedInvoice(null);
        }
    };

    if (initialLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                    <Card
                        key={`invoice-skeleton-${idx}`}
                        className="border border-gray-200 p-3 animate-pulse"
                    >
                        <div className="grid grid-cols-[1fr_120px_80px_80px] gap-4 items-center">
                            <div className="space-y-2">
                                <div className="h-3 w-32 bg-gray-200 rounded-full" />
                                <div className="h-3 w-48 bg-gray-100 rounded-full" />
                            </div>
                            <div className="border-l border-gray-200 pl-4">
                                <div className="h-4 w-16 bg-gray-200 rounded-full" />
                            </div>
                            <div className="border-l border-gray-200 pl-4 flex justify-center">
                                <div className="h-4 w-4 bg-gray-200 rounded-full" />
                            </div>
                            <div className="border-l border-gray-200 pl-4 flex justify-center">
                                <div className="h-8 w-8 bg-gray-100 rounded-xl" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="text-center py-12 text-sm text-gray-500">
                No invoices created yet. Click "Create Invoice" to add one.
            </div>
        );
    }

    return (
        <>
            <div>
                {/* Table Header - Rounded Black Header like Applications */}
                <div className="grid grid-cols-[1fr_120px_80px_80px] gap-4 bg-gray-900 p-3 text-white font-semibold rounded-2xl mb-3">
                    <div>Description</div>
                    <div className="border-l border-gray-600 pl-4">Amount</div>
                    <div className="border-l border-gray-600 pl-4 text-center">Shared</div>
                    <div className="border-l border-gray-600 pl-4 text-center">Actions</div>
                </div>

                {/* Table Body - Card Style Rows */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {invoices.map((invoice, index) => (
                        <Card 
                            key={invoice.id}
                            className="border border-gray-300 hover:shadow-md transition-shadow p-3"
                        >
                            <div className="grid grid-cols-[1fr_120px_80px_80px] gap-4 items-center">
                                <div className="text-gray-900">
                                    <p className="text-sm line-clamp-2">{invoice.description}</p>
                                </div>
                                
                                <div className="border-l border-gray-300 pl-4">
                                    <span className="font-semibold text-gray-900">
                                        ${Number(invoice.amount).toFixed(2)}
                                    </span>
                                </div>
                                
                                <div className="border-l border-gray-300 pl-4 flex justify-center">
                                    {(() => {
                                        const createdByTenant = invoice.createdByRole === "TENANT";
                                        const isShared = createdByTenant
                                            ? invoice.sharedWithLandlord !== false
                                            : invoice.sharedWithTenant;
                                        const sharedLabel = createdByTenant ? "Shared with landlord" : "Shared with tenant";
                                        const hiddenLabel = createdByTenant ? "Hidden from landlord" : "Hidden from tenant";

                                        return isShared ? (
                                            <div className="flex items-center gap-1 text-gray-900" title={sharedLabel}>
                                                <Share2 className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-gray-400" title={hiddenLabel}>
                                                <EyeOff className="h-4 w-4" />
                                            </div>
                                        );
                                    })()}
                                </div>
                                
                                <div className="border-l border-gray-300 pl-4 flex justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                                        title="Delete Invoice"
                                        onClick={() => {
                                            setSelectedInvoice(invoice);
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this invoice? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default InvoicesTable;

