import React from "react";
import { DialogTitle, DialogHeader, DialogDescription, Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LeaseRedirectModal = ({ isOpen, onClose, redirectUrl }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md text-center space-y-4">
                <DialogHeader className="pt-4">
                    <DialogTitle className="text-[18px] items-center">No Lease Found</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    This listing doesn’t have any lease attached. You need to create a lease
                    before sending.
                </DialogDescription>
                <div className="flex justify-center gap-4 mt-4">
                    <Button
                        className="bg-gray-900 text-white"
                        onClick={() => {
                            window.location.href = redirectUrl;
                        }}
                    >
                        Go to Leases
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LeaseRedirectModal;
