import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SendNotification = ({ open, setOpen }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="To"
            className="w-full border rounded-lg p-2"
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full border rounded-lg p-2"
          />
          <textarea
            placeholder="Type your message here..."
            className="w-full border rounded-lg p-2 h-28"
          ></textarea>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Back
            </Button>
            <Button>Notification</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotification;
