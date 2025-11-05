import { useState } from "react";
import { Search, Mic, SlidersHorizontal, ChevronUp, ChevronDown, Info, CheckCircle } from "lucide-react";
import ReceiptModal from "./components/ReceiptModal";
import UploadProofModal from "./components/UploadProofModal";

const rows = [
  { date: "Oct 1, 2024", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
  { date: "Oct 5, 2024", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
  { date: "Security deposit", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
  { date: "Sept 1, 2024", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
  { date: "Oct 1, 2024", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
  { date: "Oct 1, 2024", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
  { date: "Oct 1, 2024", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
  { date: "Oct 1, 2024", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
  { date: "Oct 1, 2024", description: "rent payment", category: "rent", amount: "+$1200.00", status: "paid" },
];

export default function TenantAccounting() {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="px-8 py-6">
      {/* Page title exactly like wireframe */}
      <h1 className="text-[28px] leading-8 font-semibold text-gray-900 mb-6">Payments</h1>

      {/* Search bar + tiny icon buttons */}
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

        <button
          aria-label="voice"
          className="grid place-items-center h-9 w-9 rounded-[10px] border border-gray-300 hover:bg-gray-50"
        >
          <Mic size={18} className="text-gray-600" />
        </button>

        <button
          aria-label="filters"
          className="grid place-items-center h-9 w-9 rounded-[10px] border border-gray-300 hover:bg-gray-50"
        >
          <SlidersHorizontal size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Table container */}
      <div className="rounded-[12px] overflow-hidden border border-gray-200">
        {/* Header bar: dark pill bar like wireframe */}
        <div className="grid grid-cols-12 bg-gray-800 text-white text-[14px]">
          <HeaderCell className="col-span-2" label="Date" />
          <HeaderCell className="col-span-4" label="Description" />
          <HeaderCell className="col-span-2" label="Category" withInfo />
          <HeaderCell className="col-span-2" label="Amount" withInfo />
          <HeaderCell className="col-span-2" label="Status" withInfo last />
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 text-[14px]">
              <Cell className="col-span-2">{r.date}</Cell>
              <Cell className="col-span-4">{r.description}</Cell>
              <Cell className="col-span-2">{r.category}</Cell>
              <Cell className="col-span-2 font-medium">{r.amount}</Cell>
              <Cell className="col-span-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-[3px] text-[12px] lowercase">
                  <CheckCircle size={14} className="text-gray-500" />
                  {r.status}
                </span>
              </Cell>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom demo buttons to show overlays exactly like wireframes */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => setReceiptOpen(true)}
          className="rounded-[10px] bg-gray-900 text-white text-[14px] px-4 py-2"
        >
          Preview Receipt Modal
        </button>
        <button
          onClick={() => setUploadOpen(true)}
          className="rounded-[10px] bg-gray-200 text-gray-900 text-[14px] px-4 py-2"
        >
          Upload Proof Modal
        </button>
      </div>

      <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} />
      <UploadProofModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
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
      {/* sort chevrons like wireframe */}
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
