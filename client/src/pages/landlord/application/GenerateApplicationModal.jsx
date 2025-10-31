import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import API_ENDPOINTS from "@/lib/apiEndpoints";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const GenerateApplicationDialog = ({
  isOpen,
  onClose,
  listings,
  onGenerated,
}) => {
  const [selectedListing, setSelectedListing] = useState("");
  const [requirements, setRequirements] = useState({
    photoId: true,
    proofOfIncome: true,
    landlordRef: true,
    ConsentForBackgroundCheck: true,
    ConsentForCreditCheck: true,
  });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const queryClient = useQueryClient();

  const generateApplicationMutation = useMutation({
    mutationFn: async ({ listingId, requirements }) => {
      let expirationDateToSend = null;
      if (expirationDate) {
        // Set expiration to end of day (23:59:59.999) to avoid timezone issues
        const endOfDay = new Date(expirationDate);
        endOfDay.setHours(23, 59, 59, 999);
        expirationDateToSend = endOfDay;
      } else {
        // Default: 7 days from now at end of day
        const defaultExpiration = new Date();
        defaultExpiration.setDate(defaultExpiration.getDate() + 7);
        defaultExpiration.setHours(23, 59, 59, 999);
        expirationDateToSend = defaultExpiration;
      }

      const res = await api.post(API_ENDPOINTS.APPLICATIONS.BASE, {
        listingId,
        fullName: "N/A",
        email: "na@example.com",
        phone: "N/A",
        message: JSON.stringify(requirements),
        expirationDate: expirationDateToSend,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      const link = `${window.location.origin}/apply/${data.publicId}`;
      setGeneratedLink(link);
      setLinkDialogOpen(true);
      toast.success("Application link generated!");
      if (onGenerated) onGenerated();
      queryClient.invalidateQueries(["applications"]);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to generate application link");
    },
  });

  const handleGenerate = () => {
    if (!selectedListing) return alert("Please select a listing");
    generateApplicationMutation.mutate({
      listingId: selectedListing,
      requirements,
    });
  };

  const { isPending } = generateApplicationMutation;

  return (
    <>
      {/* Generate Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          // only allow closing via your Close button
          if (!open) return;
          onClose();
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-lg p-8">
          <DialogHeader>
            <DialogTitle className="text-xl text-center mt-2">
              Create Application Link
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-2 w-full">
            {/* Listing Select */}
            <div>
              <label className="text-sm text-gray-600">Select Listing</label>
              <Select
                value={selectedListing}
                onValueChange={setSelectedListing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a listing" />
                </SelectTrigger>
                <SelectContent>
                  {listings.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title} — {l.streetAddress}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <label className="text-sm text-gray-600 mb-1 block">
                Expiration Date
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full text-left">
                    {expirationDate
                      ? format(expirationDate, "PPP")
                      : "Select expiration date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <p className="font-semibold mb-3">Application Requirements:</p>
              {Object.keys(requirements).map((key) => (
                <div key={key} className="flex items-center gap-3 ml-3">
                  <Checkbox
                    id={key}
                    checked={requirements[key]}
                    onCheckedChange={() =>
                      setRequirements({
                        ...requirements,
                        [key]: !requirements[key],
                      })
                    }
                  />
                  <label
                    htmlFor={key}
                    className="text-sm cursor-pointer select-none"
                  >
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              className="rounded-xl px-6"
              onClick={handleGenerate}
              disabled={generateApplicationMutation.isPending}
            >
              {generateApplicationMutation.isPending
                ? "Generating..."
                : "Generate Link"}
            </Button>
            <Button
              className="rounded-xl"
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog
        open={linkDialogOpen}
        onOpenChange={() => setLinkDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Application Link</DialogTitle>
            <DialogDescription>
              Copy this link to share with the applicant.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 mt-2">
            <Input value={generatedLink} readOnly />
            <Button
              className="rounded-xl"
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                toast.success("Link copied!");
              }}
            >
              Copy Link
            </Button>
          </div>

          <DialogFooter className="flex justify-end mt-4">
            <Button
              className="rounded-xl"
              variant="secondary"
              onClick={() => setLinkDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateApplicationDialog;
