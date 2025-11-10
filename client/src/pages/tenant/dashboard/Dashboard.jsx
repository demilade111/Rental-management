import { useAuthStore } from "../../../store/authStore";
import { Button } from "../../../components/ui/button";
import { Upload, Bell, Check } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-4">
      <div className="flex-1 overflow-y-auto">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          October Rent Summary
        </h1>

        {/* Outstanding Balance Card */}
        <div className="bg-white rounded-2xl border border-gray-300 p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">Outstanding balance</h2>
              <p className="text-4xl md:text-5xl font-bold">$3000</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium">In transit</span>
              </div>
              <Button className="bg-black text-white hover:bg-gray-800 px-6 py-2">
                <Upload size={16} className="mr-2" />
                Upload Payment Proof
              </Button>
            </div>
          </div>
        </div>

        {/* Two Column Section - Notice & Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Notice Card */}
          <div className="bg-white rounded-2xl border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold">Notice</h2>
              <Bell size={24} className="text-black fill-black" />
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm md:text-base mb-3">
                  Your next rent payment of <span className="font-bold">$1,200</span> is due on October 15.
                </p>
                <Button variant="outline" size="sm" className="bg-gray-200 text-black hover:bg-gray-300 border-0">
                  Rent
                </Button>
              </div>
              <div>
                <p className="text-sm md:text-base mb-3">
                  Your maintenance request for "Leaking faucet" has been updated.
                </p>
                <Button variant="outline" size="sm" className="bg-gray-200 text-black hover:bg-gray-300 border-0">
                  Maintenance
                </Button>
              </div>
              <div>
                <p className="text-sm md:text-base mb-3">
                  Your lease for Apartment A will expire in 45 days.
                </p>
                <Button variant="outline" size="sm" className="bg-gray-200 text-black hover:bg-gray-300 border-0">
                  Lease
                </Button>
              </div>
            </div>
          </div>

          {/* Maintenance Card */}
          <div className="bg-white rounded-2xl border border-gray-300 p-6">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Maintenance</h2>
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-base">1023 Jervis st</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">2h New</span>
                </div>
                <p className="font-semibold text-sm md:text-base mb-2">
                  Kitchen sink faucet problem
                </p>
                <p className="text-gray-500 text-xs md:text-sm">
                  The kitchen sink faucet has been dripping continuously for the past week. I've tried tightening it, but...
                </p>
              </div>

              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-base">1980 Hasting st</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">1d Ongoing</span>
                </div>
                <p className="font-semibold text-sm md:text-base mb-2">Heater Repair</p>
                <p className="text-gray-500 text-xs md:text-sm">
                  The heater is not producing any warm air, and the apartment has been very cold at night. I...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Section */}
        <div className="bg-white rounded-2xl border border-gray-300 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 sm:mb-0">Insurance</h2>
            <Button variant="outline" className="bg-gray-200 text-black hover:bg-gray-300 border-0 w-fit">
              <Upload size={16} className="mr-2" />
              Upload Insurance Proof
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Insurance Status:</span> Active
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Insurance Type:</span> Tenant Liability Insurance
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Expiration Date:</span> Nov 15, 2025
              </p>
              <Button className="mt-4 bg-black text-white hover:bg-gray-800">
                View Policy
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Insurance Status:</span> Expiring in 30 days
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Insurance Type:</span> Personal Property Insurance
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Expiration Date:</span> Oct 7, 2025
              </p>
              <Button className="mt-4 bg-black text-white hover:bg-gray-800">
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
