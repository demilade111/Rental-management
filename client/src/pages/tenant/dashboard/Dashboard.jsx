import { useAuthStore } from "../../../store/authStore";
import {Button} from "../../../components/ui/button";
import { Upload, Bell } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6 md:p-8 bg-background min-h-screen flex flex-col items-center">
      {/* MAIN CONTAINER (controls left alignment and overall width) */}
      <div className="w-full max-w-[1400px] flex flex-col items-start gap-10">
        {/* ===== TITLE ===== */}
        <h1 className="text-2xl font-bold text-left w-full">
          October Rent Summary
        </h1>

        {/* ===== TOP SUMMARY CARDS ===== */}
        <div className="flex flex-wrap gap-[37px] w-full">
          {[
            { title: "Unpaid", amount: "$300" },
            { title: "Paid", amount: "$4500" },
            { title: "In Transit", amount: "$1200" },
            { title: "Past Due", amount: "$1200" },
            { title: "Deposit", amount: "$1500" },
          ].map((item, i) => (
            <div
              key={i}
              className="w-[250px] h-[120px] rounded-[15px] bg-white shadow-sm border border-gray-200 p-4 flex flex-col justify-between"
            >
              <div className="text-gray-500 text-sm font-medium">
                {item.title}
              </div>
              <div className="text-4xl font-bold">{item.amount}</div>
            </div>
          ))}
        </div>

        {/* ===== UPLOAD PAYMENT PROOF BUTTON ===== */}
        <div className="flex justify-start w-full">
          <Button
            variant="outline"
            className="bg-black text-white px-6 py-2 rounded-md"
          >
            <Upload size={16} /> Upload Payment Proof
          </Button>
        </div>

        {/* ===== MIDDLE SECTION ===== */}
        <div className="flex flex-wrap justify-start gap-[37px] w-full">
          {/* YOUR RENT */}
          <div className="w-full lg:w-[463px] h-auto lg:h-[400px] border rounded-[15px] p-6 flex flex-col bg-white">
            <h2 className="text-3xl font-semibold mb-4">Your Rent</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl"></div>
                <div>
                  <p className="font-semibold">Property Name</p>
                  <p className="font-bold">$2500</p>
                  <p className="text-gray-500 text-sm">Address</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Oct 8</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl"></div>
                <div>
                  <p className="font-semibold">Property Name</p>
                  <p className="font-bold">$1500</p>
                  <p className="text-gray-500 text-sm">Address</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Sep 12</p>
                </div>
              </div>
            </div>
          </div>

          {/* NOTICE */}
          <div className="w-full lg:w-[430px] h-auto lg:h-[400px] border rounded-[15px] p-6 flex flex-col bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-semibold">Notice</h2>
              <Bell size={24} stroke="#000000" fill="#000000" />
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p>
                  Your next rent payment of <b>$1,200</b> is due on October 15.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-gray-200 text-black"
                >
                  Rent
                </Button>
              </div>
              <div>
                <p>
                  Your maintenance request for “Leaking faucet” has been
                  updated.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-gray-200 text-black"
                >
                  Maintenance
                </Button>
              </div>
              <div>
                <p>Your lease for Apartment A will expire in 45 days.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-gray-200 text-black"
                >
                  Lease
                </Button>
              </div>
            </div>
          </div>

          {/* MAINTENANCE */}
          <div className="w-full lg:w-[430px] h-auto lg:h-[400px] border rounded-[15px] p-6 flex flex-col bg-white">
            <h2 className="text-3xl font-semibold mb-4">Maintenance</h2>
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <div className="flex justify-between">
                  <p className="font-semibold">1023 Jervis St</p>
                  <span className="text-xs text-gray-400">2h · New</span>
                </div>
                <p className="font-semibold mt-1">
                  Kitchen sink faucet problem
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  The kitchen sink faucet has been dripping continuously for the
                  past week. I’ve tried tightening it...
                </p>
              </div>

              <div>
                <div className="flex justify-between">
                  <p className="font-semibold">1980 Hasting St</p>
                  <span className="text-xs text-gray-400">1d · Ongoing</span>
                </div>
                <p className="font-semibold mt-1">Heater Repair</p>
                <p className="text-gray-500 text-xs mt-1">
                  The heater is not producing any warm air, and the apartment
                  has been very cold at night...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== INSURANCE SECTION ===== */}
        <div className="w-full border rounded-[15px] p-6 flex flex-col bg-white">
          <h2 className="text-lg font-semibold mb-4">Insurance</h2>

          <div className="flex flex-col lg:flex-row flex-wrap gap-[60px]">
            <div>
              <p className="text-sm text-gray-600">Insurance Status: Active</p>
              <p className="text-sm text-gray-600">
                Insurance Type: Tenant Liability Insurance
              </p>
              <p className="text-sm text-gray-600">
                Expiration Date: Nov 15, 2025
              </p>
              <Button variant="outline" className="mt-3 bg-black text-white">
                View Policy
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                Insurance Status: Expiring in 30 days
              </p>
              <p className="text-sm text-gray-600">
                Insurance Type: Personal Property Insurance
              </p>
              <p className="text-sm text-gray-600">
                Expiration Date: Oct 7, 2025
              </p>
              <Button variant="outline" className="mt-3 bg-black text-white">
                View Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
