import { X } from "lucide-react";

export default function ReceiptModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
      <div className="relative bg-white w-[780px] rounded-[6px] shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded hover:bg-gray-100"
          aria-label="close"
        >
          <X size={18} />
        </button>

        {/* Header banner mimic */}
        <div className="h-[96px] w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 rounded-t-[6px]" />

        <div className="px-10 py-8">
          <h2 className="text-[20px] font-semibold text-center mb-6">
            Rent Payment Receipt
          </h2>

          <div className="text-[13px] leading-6">
            <p><span className="font-semibold">Receipt ID:</span> R-20501234</p>
            <p className="mb-4"><span className="font-semibold">Date Issued:</span> March 15, 2050</p>

            <p className="font-semibold">Tenant Information:</p>
            <p>Name: Harold Abern</p>
            <p>Address: Overland Park, KS 66204</p>
            <p className="mb-4">Contact: 222 555 7777</p>
          </div>

          {/* Table */}
          <div className="border border-gray-300 rounded-[4px] overflow-hidden mb-6">
            <div className="grid grid-cols-12 bg-gray-100 text-[13px]">
              <Header className="col-span-6">Description</Header>
              <Header className="col-span-3">Subtotal</Header>
              <Header className="col-span-1">Tax</Header>
              <Header className="col-span-2">Total Amount</Header>
            </div>
            <Row left="Monthly Rent for March 2050" sub="$1,200.00" tax="$0.00" total="$1,200.00" />
            <Row left="Utilities (Electricity, Water)" sub="$150.00" tax="$0.00" total="$150.00" />
            <div className="grid grid-cols-12">
              <Cell className="col-span-6 font-semibold">Total</Cell>
              <Cell className="col-span-3" />
              <Cell className="col-span-1" />
              <Cell className="col-span-2 font-semibold">$1,350.00</Cell>
            </div>
          </div>

          <div className="text-[13px] leading-6 space-y-4">
            <div>
              <p className="font-semibold">Payment Information:</p>
              <p>Payment Method: Credit Card</p>
              <p>Transaction ID: CC-987654321</p>
            </div>

            <div>
              <p className="font-semibold">Terms and Conditions:</p>
              <p>
                Payments are non-refundable. Late payments are subject to a 5% penalty per month.
                For assistance, please reach out to [YOUR NAME] via email at [YOUR EMAIL].
              </p>
            </div>

            <p className="text-center mt-6">Thank you for your timely payment!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ children, className = "" }) {
  return <div className={["px-3 py-2 border-b border-gray-300 font-medium", className].join(" ")}>{children}</div>;
}
function Cell({ children, className = "" }) {
  return <div className={["px-3 py-2 border-b border-gray-200", className].join(" ")}>{children}</div>;
}
function Row({ left, sub, tax, total }) {
  return (
    <div className="grid grid-cols-12">
      <Cell className="col-span-6">{left}</Cell>
      <Cell className="col-span-3">{sub}</Cell>
      <Cell className="col-span-1">{tax}</Cell>
      <Cell className="col-span-2">{total}</Cell>
    </div>
  );
}
