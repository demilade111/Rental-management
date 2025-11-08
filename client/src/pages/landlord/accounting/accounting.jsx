import { useState } from "react";
import { Search, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountingFilter from "./AccountingFilter";
import SendNotification from "./SendNotification";
import ProofOfPayment from "./ProofOfPayment";
import AccountingCards from "./accountingCards";

const Accounting = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [openNotification, setOpenNotification] = useState(false);
  const [openProof, setOpenProof] = useState(false);

  const payments = [
    {
      id: 1,
      tenant: "Greg Santiago",
      property: "The Summit",
      address: "1231 Lewis St, Vancouver",
      category: "Maintenance",
      amount: "$75.00",
      status: "Paid",
      date: "Submitted 2 days ago",
    },
    {
      id: 2,
      tenant: "Jane Doe",
      property: "The Summit",
      address: "1231 Lewis St, Vancouver",
      category: "Rent",
      amount: "$75.00",
      status: "Outstanding",
      date: "Submitted 2 days ago",
    },
    {
      id: 3,
      tenant: "Jane Doe",
      property: "The Summit",
      address: "1231 Lewis St, Vancouver",
      category: "Rent",
      amount: "$75.00",
      status: "Overdue",
      date: "Submitted 2 days ago",
    },
  ];

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.tenant.toLowerCase().includes(search.toLowerCase()) ||
      p.property.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? p.category === filter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Accounting</h1>
        <p className="text-gray-500">
          Track payments, outstanding balances, and manage financial records.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center space-x-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className="pl-9 pr-10 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Mic className="absolute right-3 top-2.5 text-gray-400 w-4 h-4 cursor-pointer hover:text-black" />
        </div>
        <AccountingFilter filter={filter} setFilter={setFilter} />
      </div>

      {/* Summary Cards */}
       <AccountingCards/>

      {/* Table */}
      <div className="grid grid-cols-6 bg-black text-white text-center rounded-t-lg overflow-hidden mx-2 sm:mx-0">
        <div className="px-4 py-3 border-r border-white/50">Tenant</div>
        <div className="px-4 py-3 border-r border-white/50">Property</div>
        <div className="px-4 py-3 border-r border-white/50">Category</div>
        <div className="px-4 py-3 border-r border-white/50">Amount</div>
        <div className="px-4 py-3 border-r border-white/50">Status</div>
        <div className="px-4 py-3">Action</div>
      </div>

      {/* Records */}
      <div className="space-y-4 mt-3">
        {filteredPayments.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-1 sm:grid-cols-6 items-center bg-white rounded-lg shadow-sm border mx-2 sm:mx-0 p-4 gap-y-2 sm:gap-y-0"
          >
            <div>
              <p className="font-medium">{p.tenant}</p>
              <p className="text-gray-500 text-xs">{p.date}</p>
            </div>
            <div>
              <p>{p.property}</p>
              <p className="text-gray-500 text-xs">{p.address}</p>
            </div>
            <div className="text-gray-700">{p.category}</div>
            <div className="font-medium">{p.amount}</div>
            <div className="flex justify-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  p.status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : p.status === "Outstanding"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {p.status}
              </span>
            </div>
            <div className="flex justify-center">
              {p.status === "Paid" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpenProof(true)}
                >
                  View Proof
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpenNotification(true)}
                >
                  Notify
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <SendNotification open={openNotification} setOpen={setOpenNotification} />
      <ProofOfPayment open={openProof} setOpen={setOpenProof} />
    </div>
  );
};

export default Accounting;
