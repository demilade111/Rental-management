import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ApplicationDetailsDialog = ({ open, onClose, application }) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                className="max-h-[90vh] overflow-y-auto sm:max-w-2xl p-10 pt-12"
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl mb-4">Application Details</DialogTitle>
                </DialogHeader>

                {!application ? (
                    <p className="text-gray-500">No data loaded</p>
                ) : (
                    <div className="space-y-6 text-gray-800">

                        {/* TOP SECTION: 2-COLUMN BALANCED LAYOUT */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="flex flex-col justify-between h-full space-y-8">
                                {/* Listing Info */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-gray-900">Listing Information</h3>
                                    <div className="ml-4 border-l-2 pl-3 border-l-gray-300">
                                        <p><b>Title:</b> {application?.listing?.title}</p>
                                        <p><b>Address:</b> {application?.listing?.streetAddress}</p>
                                    </div>
                                </div>

                                {/* Rental Info */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-gray-900">Rental Details</h3>
                                    <div className="ml-4 border-l-2 pl-3 border-l-gray-300">
                                        <p><b>Move-in Date:</b> {application.moveInDate || "Not selected"}</p>
                                        <p><b>Occupants:</b> {application.occupantsCount ?? "Not provided"}</p>
                                        <p><b>Pets:</b> {application.petsCount ?? "Not provided"}</p>
                                        <p><b>Monthly Income:</b> {application.monthlyIncome || "Not provided"}</p>
                                        <p><b>Status:</b> {application.status}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col justify-between h-full space-y-4">
                                {/* Applicant Info */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-gray-900">Applicant Information</h3>
                                    <div className="ml-4 border-l-2 pl-3 border-l-gray-300">
                                        <p><b>Name:</b> {application.fullName}</p>
                                        <p><b>Email:</b> {application.email}</p>
                                        <p><b>Phone:</b> {application.phone || "No phone provided"}</p>
                                        <p><b>Date of Birth:</b> {application.dateOfBirth || "Not provided"}</p>
                                        <p><b>Current Address:</b> {application.currentAddress || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM SECTION: Employment History */}
                        {Array.isArray(application.employmentInfo) && application.employmentInfo.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900">Employment History</h3>
                                <div className="space-y-3">
                                    {application.employmentInfo.map((job, idx) => (
                                        <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                                            <p><b>Employer:</b> {job.employerName}</p>
                                            <p><b>Job Title:</b> {job.jobTitle}</p>
                                            <p><b>Duration:</b> {job.duration}</p>
                                            <p><b>Income:</b> {job.income}</p>
                                            <p><b>Address:</b> {job.address}</p>
                                            {job.proofDocument && (
                                                <a
                                                    href={job.proofDocument}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 underline text-sm block mt-1"
                                                >
                                                    View Proof Document
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* BOTTOM SECTION: Documents */}
                        {Array.isArray(application.documents) && application.documents.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Documents</h3>
                                <div className="space-y-2">
                                    {application.documents.map((url, index) => {
                                        const filename = url.split("/").pop();
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between border rounded-lg p-2 bg-gray-50"
                                            >
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline text-sm break-all"
                                                >
                                                    {filename}
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <Button className="rounded-xl" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ApplicationDetailsDialog;
