import { useState } from "react";
import {
  Search,
  Mic,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Info,
  CheckCircle,
} from "lucide-react";
import ReceiptModal from "./components/ReceiptModal";
import UploadProofModal from "./components/UploadProofModal";
import { useTenantPayments } from "@/hooks/useTenantPayments";

export default function TenantAccounting() {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null); // ✅ New state for receipt preview
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const { data: payments = [], isLoading, error } = useTenantPayments();
  console.log("Payments:", payments);

  // ✅ Function to preview the latest uploaded proof
  const previewReceipt = () => {
    const paymentWithProof = payments.find((p) => p.proofUrl);
    if (paymentWithProof) {
      setReceiptUrl(paymentWithProof.proofUrl);
    } else {
      setReceiptUrl(null);
    }
    setReceiptOpen(true);
  };

  return (
    <div className="px-8 py-6">
      <h1 className="text-[28px] leading-8 font-semibold text-gray-900 mb-6">
        Payments
      </h1>

      {/* Search and icons */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-[480px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input
            className="w-full h-10 pl-9 pr-10 rounded-[10px] border border-gray-300 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Search"
          />
        </div>

        <button className="grid place-items-center h-9 w-9 rounded-[10px] border border-gray-300 hover:bg-gray-50">
          <Mic size={18} className="text-gray-600" />
        </button>

        <button className="grid place-items-center h-9 w-9 rounded-[10px] border border-gray-300 hover:bg-gray-50">
          <SlidersHorizontal size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-[12px] overflow-hidden border border-gray-200">
        <div className="grid grid-cols-12 bg-gray-800 text-white text-[14px]">
          <HeaderCell className="col-span-2" label="Date" />
          <HeaderCell className="col-span-4" label="Description" />
          <HeaderCell className="col-span-2" label="Category" withInfo />
          <HeaderCell className="col-span-2" label="Amount" withInfo />
          <HeaderCell className="col-span-2" label="Status" withInfo last />
        </div>

        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              Error loading data
            </div>
          ) : payments.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No payments yet</div>
          ) : (
            payments.map((p, i) => (
              <div key={i} className="grid grid-cols-12 text-[14px]">
                <Cell className="col-span-2">
                  {new Date(p.date).toLocaleDateString()}
                </Cell>
                <Cell className="col-span-4">{p.description}</Cell>
                <Cell className="col-span-2">{p.category}</Cell>
                <Cell className="col-span-2 font-medium">
                  ${p.amount.toFixed(2)}
                </Cell>
                <Cell className="col-span-2">
  <div className="flex items-center gap-2">
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-[3px] text-[12px] lowercase">
      <CheckCircle size={14} className="text-gray-500" />
      {p.status}
    </span>

    {/* If paid and proof exists, show View Receipt */}
    {p.status === "paid" && p.proofUrl && (
  <button
    onClick={() => {
      setSelectedPaymentId(p.id);
      setReceiptUrl(p.proofUrl); // ✅ Set URL for preview
      setReceiptOpen(true);
    }}
    className="text-[12px] text-blue-600 underline ml-2"
  >
    View Receipt
  </button>
)}


    {/* Show Upload only when not paid */}
    {p.status !== "paid" && (
      <button
        onClick={() => {
          setSelectedPaymentId(p.id);
          setUploadOpen(true);
        }}
        className="text-[12px] text-blue-600 underline ml-2"
      >
        Upload Proof
      </button>
    )}
  </div>
</Cell>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Buttons below table */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={previewReceipt}
          className="rounded-[10px] bg-gray-900 text-white text-[14px] px-4 py-2"
        >
          Preview Receipt Modal
        </button>
      </div>

      {/* Modals */}
      <ReceiptModal
  open={receiptOpen}
  onClose={() => setReceiptOpen(false)}
  proofUrl={
    payments.find((p) => p.id === selectedPaymentId)?.proofUrl || null
  }
/>

      <UploadProofModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setSelectedPaymentId(null);
        }}
        paymentId={selectedPaymentId}
      />
    </div>
  );
}

function HeaderCell({ label, withInfo = false, last = false, className = "" }) {
  return (
    <div
      className={[
        "flex items-center gap-2 h-12 px-4 border-r border-gray-700",
        last ? "border-r-0" : "",
        className,
      ].join(" ")}
    >
      <span className="font-medium">{label}</span>
      {withInfo && <Info size={14} className="opacity-80" />}
      <div className="ml-auto flex -space-y-1 flex-col text-white/80">
        <ChevronUp size={14} />
        <ChevronDown size={14} />
      </div>
    </div>
  );
}

function Cell({ children, className = "" }) {
  return (
    <div className={["h-11 flex items-center px-4", className].join(" ")}>
      {children}
    </div>
  );
}
