import { useState } from "react";
import { Search, Mic, Filter, SlidersVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountingFilter from "./accountingFilter";

const Accounting = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const payments = [
    {
      id: 1,
      tenant: "Aluko D",
      property: "The Summit",
      address: "1235 Lewis St, Vancouver",
      category: "Maintenance",
      amount: "$75.00",
      status: "Paid",
      date: "Submitted 2 days ago",
    },
    {
      id: 2,
      tenant: "Zin M",
      property: "The Great View",
      address: "1235 Station St, Vancouver",
      category: "Rent",
      amount: "$75.00",
      status: "Outstanding",
      date: "Submitted 2 days ago",
    },
    {
      id: 3,
      tenant: "Muco B",
      property: "The Summit",
      address: "1235 6th St, Vancouver",
      category: "Rent",
      amount: "$75.00",
      status: "Overdue",
      date: "Submitted 2 days ago",
    },
  ];

  const financialSummary = [
    { title: "Rent", value: "$4,500" },
    { title: "Rent Paid (This Month)", value: "$5,800" },
    { title: "Deposit Paid (This Month)", value: "$1,500" },
    { title: "Maintenance Paid (This Month)", value: "$2,500" },
    /*{ title: "Rent Outstanding", value: "$2,500" },*/
    /*{ title: "Deposit Outstanding", value: "$1,500" },*/
    /*{ title: "Maintenance Outstanding", value: "$5,800" },*/
    /*{ title: "Other Outstanding", value: "$500" },*/
    /*{ title: "Other Overdue", value: "$2,500" },*/
    { title: "Maintenance Overdue", value: "$2,500" },
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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Accounting</h1>
        <p className="text-gray-500">
          Track payments, outstanding balances, and manage financial records.
        </p>
      </div>

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

      <div>
        <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {financialSummary.map((item, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg shadow text-center border"
            >
              <p className="text-gray-600 text-sm">{item.title}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Records */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Payment Records</h2>
        <div className="overflow-hidden border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-black text-white text-center">
              <tr>
                <th className="px-4 py-3 border border-white">Tenant</th>
                <th className="px-4 py-3 border border-white">Property</th>
                <th className="px-4 py-3 border border-white">Category</th>
                <th className="px-4 py-3 border border-white">Amount</th>
                <th className="px-4 py-3 border border-white">Status</th>
                <th className="px-4 py-3 border border-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 ">
                    <p className="font-medium">{p.tenant}</p>
                    <p className="text-gray-500 text-xs">{p.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{p.property}</p>
                    <p className="text-gray-500 text-xs">{p.address}</p>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.amount}</td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "Paid" ? (
                      <Button size="sm" variant="outline">
                        View Proof of Payment
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        Send Notification
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Accounting;
