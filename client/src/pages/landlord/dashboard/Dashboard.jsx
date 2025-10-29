import React from "react";
import { useAuthStore } from "../../../store/authStore";
import RentersInsuranceCard from "./RentarsInsuranceCard";
import ExpiringLeasesCard from "./ExpiringLeasesCard";
import AccountingCard from "./AccountingCard";

const Dashboard = () => {
  const { user } = useAuthStore();

  const applications = user?.landlordStats?.applications || [
    { address: "1023 Jervis st, V6T 3A1", time: "8 hours ago", status: "New" },
    { address: "456 Cherry st, V5T 2B4", time: "1 day ago", status: "New" },
    {
      address: "1980 Hasting st, V6T 6A1",
      time: "3 days ago",
      status: "Approved",
    },
    {
      address: "850 Nelson st, V7Y 7F5",
      time: "5 days ago",
      status: "Undecided",
    },
    {
      address: "1603 Pendrell st, V4T 3A2",
      time: "1 week ago",
      status: "Approved",
    },
  ];

  const maintenance = [
    {
      address: "1023 Jervis st",
      time: "2h",
      status: "New",
      title: "Kitchen sink faucet problem",
    },
    {
      address: "1980 Hasting st",
      time: "1d",
      status: "Ongoing",
      title: "Heater Repair",
    },
    {
      address: "1603 Pendrell st",
      time: "4d",
      status: "Ongoing",
      title: "Leak on the kitchen",
    },
    {
      address: "850 Nelson st",
      time: "22d",
      status: "Done",
      title: "Fridge is not working",
    },
    {
      address: "1603 Pendrell st",
      time: "4d",
      status: "Ongoing",
      title: "Leak on the kitchen",
    },
    {
      address: "850 Nelson st",
      time: "22d",
      status: "Done",
      title: "Fridge is not working",
    },
    {
      address: "850 Nelson st",
      time: "22d",
      status: "Done",
      title: "Fridge is not working",
    },
    {
      address: "1603 Pendrell st",
      time: "4d",
      status: "Ongoing",
      title: "Leak on the kitchen",
    },
    {
      address: "850 Nelson st",
      time: "22d",
      status: "Done",
      title: "Fridge is not working",
    },
    {
      address: "456 Cherry st",
      time: "1m",
      status: "Ongoing",
      title: "There is no hot water",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Ongoing":
        return "bg-yellow-100 text-yellow-800";
      case "Done":
        return "bg-gray-100 text-gray-800";
      case "Undecided":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 p-4 md:p-6 lg:p-8">
        {/* Main Content Grid */}
        <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <AccountingCard />

          {/* Applicants */}
          <div className="bg-card rounded-lg border border-gray-400 p-4 md:p-6 flex flex-col">
            <h3 className="text-2xl md:text-3xl lg:text-[32px] font-bold mb-4">
              Applicants
            </h3>
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-[400px]">
                <tbody className="max-h-64 overflow-y-auto">
                  {applications.map((app, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-300 last:border-0"
                    >
                      <td className="text-xs sm:text-sm font-semibold text-gray-900 py-2 sm:py-3">
                        {app.address}
                      </td>
                      <td className="text-xs text-gray-500 py-2 sm:py-3 whitespace-nowrap">
                        {app.time}
                      </td>
                      <td className="text-right py-2 sm:py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ExpiringLeasesCard />
          <RentersInsuranceCard />
        </div>

        {/* Maintenance Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-card rounded-lg border border-gray-400 p-4 md:p-6 max-h-[500px] lg:max-h-[calc(100vh-120px)] flex flex-col lg:sticky lg:top-6">
            <h3 className="text-2xl md:text-3xl lg:text-[32px] font-bold mb-4">
              Maintenance
            </h3>

            {/* Scrollable table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full border-collapse min-w-[300px]">
                <tbody className="divide-y divide-gray-100">
                  {maintenance.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="border-b-0">
                        {/* Address */}
                        <td className="text-xs sm:text-sm font-semibold text-gray-900 pt-3">
                          {item.address}
                        </td>

                        {/* Time */}
                        <td className="text-xs text-gray-500 text-right pt-3 whitespace-nowrap">
                          {item.time}
                        </td>

                        {/* Status */}
                        <td className="text-right pt-3">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>

                      {/* Title Row */}
                      <tr
                        key={`${idx}-title`}
                        className="border-b border-gray-100"
                      >
                        <td colSpan="3" className="text-xs text-gray-600 pb-3">
                          {item.title}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer button */}
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm md:text-base font-semibold hover:underline"
                onClick={() => console.log("View all maintenance clicked")}
              >
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
