import React from 'react';

const SummaryCard = ({ title, total, breakdown }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6">
      <h3 className="text-[18px] font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="text-[36px] font-bold text-gray-900 mb-4">
        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[14px]">
          <span className="text-gray-600">Rent:</span>
          <span className="font-medium text-gray-900">
            ${breakdown.rent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-gray-600">Deposit:</span>
          <span className="font-medium text-gray-900">
            ${breakdown.deposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-gray-600">Maintenance:</span>
          <span className="font-medium text-gray-900">
            ${breakdown.maintenance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-gray-600">Other:</span>
          <span className="font-medium text-gray-900">
            ${breakdown.other.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

const SummaryCards = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SummaryCard
        title="Outstanding Balances"
        total={summary.outstanding.total}
        breakdown={summary.outstanding.breakdown}
      />
      <SummaryCard
        title="Overdue Payments"
        total={summary.overdue.total}
        breakdown={summary.overdue.breakdown}
      />
      <SummaryCard
        title="Paid Amounts (Month)"
        total={summary.paid.total}
        breakdown={summary.paid.breakdown}
      />
    </div>
  );
};

export default SummaryCards;

