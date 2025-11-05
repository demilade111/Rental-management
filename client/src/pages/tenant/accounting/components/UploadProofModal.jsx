import { X, Upload } from "lucide-react";

export default function UploadProofModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
      <div className="relative bg-white w-[720px] rounded-[18px] shadow-xl p-10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded hover:bg-gray-100"
          aria-label="close"
        >
          <X size={18} />
        </button>

        <h3 className="text-[24px] font-semibold text-center mb-10">
          Click and add your proof your payment
        </h3>

        <div className="rounded-[14px] border-2 border-dashed border-gray-400/80 px-8 py-10 grid place-items-center mb-10">
          <div className="grid place-items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-gray-200 grid place-items-center">
              <Upload size={22} className="text-gray-600" />
            </div>
            <p className="text-gray-700">Upload your proof your payment</p>
            <button className="mt-1 h-9 px-4 rounded-full border border-gray-300 bg-white text-[14px]">
              Choose File
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button className="h-11 px-6 rounded-[12px] bg-gray-900 text-white text-[15px]">
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
}
