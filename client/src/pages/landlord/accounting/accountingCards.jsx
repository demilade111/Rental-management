import React from "react";

const AccountingCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Outstanding Balances */}
      <div className="bg-gray-200 p-4 rounded-lg shadow text-center border">
        <h3 className="font-semibold mb-2">Outstanding Balances</h3>
        <p className="text-2xl font-bold">$8,500</p>

        <div className="border-b-2 border-gray-500 w-4/5 mx-auto my-2"></div>
        <div className="grid grid-cols-1 gap-2 m-4 text-left">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Rent</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Deposit</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Maintenance</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Other</p>
            <p className="font-semibold">$2,200</p>
          </div>
        </div>
      </div>

      {/* Overdue Payments */}
      <div className="bg-gray-200 p-4 rounded-lg shadow text-center border">
        <h3 className="font-semibold mb-2">Overdue Payments</h3>
        <p className="text-2xl font-bold">$8,500</p>
        <div className="border-b-2 border-gray-500 w-4/5 mx-auto my-2"></div>
        <div className="grid grid-cols-1 gap-2 m-4 text-left">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Rent</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Deposit</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Maintenance</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Other</p>
            <p className="font-semibold">$0,00</p>
          </div>
        </div>
      </div>

      {/* Paid Amounts (Month) */}
      <div className="bg-gray-200 p-4 rounded-lg shadow text-center border">
        <h3 className="font-semibold mb-2">Paid Amounts (Month)</h3>
        <p className="text-2xl font-bold">$8,500</p>
        <div className="border-b-2 border-gray-500 w-4/5 mx-auto my-2"></div>
        <div className="grid grid-cols-1 gap-2 m-4 text-left">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Rent</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Deposit</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Maintenance</p>
            <p className="font-semibold">$2,200</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Other</p>
            <p className="font-semibold">$2,200</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingCards;
