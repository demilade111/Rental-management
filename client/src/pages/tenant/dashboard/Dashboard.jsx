import { useAuthStore } from "../../../store/authStore";
import { Button } from "../../../components/ui/button";
import { Upload, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../../lib/axios";

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const [leases, setLeases] = useState([]);

  useEffect(() => {
    const fetchTenantLeases = async () => {
      if (!token) return;
      try {
        const res = await axios.get("/api/v1/leases");
        console.log("API response:", res.data);
        setLeases(res.data.data || []);
      } catch (err) {
        console.error("Error fetching tenant leases:", err);
      }
    };
    fetchTenantLeases();
  }, [token]);

  return (
    <main className="bg-gray-50 p-8 min-h-screen flex justify-center">
      <div className="w-full max-w-[1200px]">
        <h1 className="text-xl font-semibold mb-6">October Rent Summary</h1>

        {/* Outstanding Balance */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-2xl font-bold">
            Outstanding balance{" "}
            <span className="text-gray-700 ml-2">$3000</span>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full"></span> In
              transit
            </span>
            <Button className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2">
              <Upload size={16} /> Upload Payment Proof
            </Button>
          </div>
        </div>

        {/* Notice + Maintenance cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Notice */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Notice</h2>
              <Bell size={20} fill="black" />
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg">
                <p>
                  Your next rent payment of <b>$1,200</b> is due on October 15.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 bg-gray-100 text-black p-3 rounded-2xl"
                >
                  Rent
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg">
                <p>
                  Your maintenance request for “Leaking faucet” has been
                  updated.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 bg-gray-100 text-black p-3 rounded-2xl"
                >
                  Maintenance
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg">
                <p>Your lease for Apartment A will expire in 45 days.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 bg-gray-100 text-black p-3 rounded-2xl"
                >
                  Lease
                </Button>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Maintenance</h2>
            <div className="space-y-5 text-sm">
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
                  past week...
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
                  has been cold...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Section */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Insurance</h2>
          <div className="space-y-6 text-sm flex items-start gap-12 ">
            <div>
              <p className="text-gray-600">Insurance Status: Active</p>
              <p className="text-gray-600">
                Insurance Type: Tenant Liability Insurance
              </p>
              <p className="text-gray-600">Expiration Date: Nov 15, 2025</p>
              <Button className="bg-black text-white mt-3 rounded-2xl">
                View Policy
              </Button>
            </div>

            <div>
              <p className="text-gray-600">
                Insurance Status: Expiring in 30 days
              </p>
              <p className="text-gray-600">
                Insurance Type: Personal Property Insurance
              </p>
              <p className="text-gray-600">Expiration Date: Oct 7, 2025</p>
              <Button className="bg-black text-white mt-3 rounded-2xl">
                View Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
