import React from "react";
import FinancialMetricsTable from "./FinancialMetricsTable";
import MetricsCardsGrid from "./MetricsCardsGrid";

const Analytics = () => {
  const properties = [
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: 9.01,
      expenseRatio: 12.56,
    },
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: -1.68,
      expenseRatio: 12.56,
    },
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: 7.81,
      expenseRatio: 12.56,
    },
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: -9.91,
      expenseRatio: 12.56,
    },
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: 3.65,
      expenseRatio: 12.56,
    },
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: 9.01,
      expenseRatio: 12.56,
    },
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: 9.01,
      expenseRatio: 12.56,
    },
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: 9.01,
      expenseRatio: 12.56,
    },
    {
      name: "The Summit",
      address: "1253 Jervis St, Vancouver",
      gri: 36000,
      expenses: 1000,
      noi: 35000,
      capRate: 5.83,
      rent: 9.01,
      expenseRatio: 12.56,
    },
  ];

  return (
    <div className="py-2 md:py-4 px-4 md:px-6">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Financial Metrics
        </h1>
        <p className="text-sm md:text-base text-gray-600">Per Property</p>
      </div>

      <FinancialMetricsTable properties={properties} />

      <MetricsCardsGrid />
    </div>
  );
};

export default Analytics;
