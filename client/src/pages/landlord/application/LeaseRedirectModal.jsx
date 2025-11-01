import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LeaseRedirectModal = ({ isOpen, onClose, redirectUrl }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md text-center space-y-4">
                <h3 className="text-xl font-bold">No Lease Found</h3>
                <p>
                    This listing doesn’t have any lease attached. You need to create a lease
                    before sending.
                </p>
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
