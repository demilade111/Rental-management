import { useState } from "react";
import { Search, Mic, SlidersHorizontal } from "lucide-react";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [region, setRegion] = useState("Africa");
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="px-12 py-10">
      {/* Header */}
      <h1 className="text-[28px] font-semibold text-gray-900 mb-10">
        Settings
      </h1>

      {/* Search and Icons */}
      <div className="flex items-center gap-2 mb-12">
        <div className="relative w-[480px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search"
            className="w-full h-10 pl-9 pr-10 rounded-[10px] border border-gray-300 text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <button className="grid place-items-center h-9 w-9 rounded-[10px] border border-gray-300 hover:bg-gray-50">
          <Mic size={18} className="text-gray-600" />
        </button>

        <button className="grid place-items-center h-9 w-9 rounded-[10px] border border-gray-300 hover:bg-gray-50">
          <SlidersHorizontal size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-2 gap-16">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-14">
          {/* Notifications Section */}
          <section>
            <h2 className="font-semibold text-[16px] mb-5">Notifications</h2>

            <div className="flex flex-col gap-6">
              <div>
                <p className="font-semibold text-[15px] mb-2">
                  Email notifications
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() =>
                      setEmailNotifications(!emailNotifications)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gray-900 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:h-[18px] after:w-[18px] after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              <div>
                <input
                  disabled
                  placeholder="notificationspref..."
                  className="w-[240px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px] mr-3"
                />
                <input
                  disabled
                  placeholder="All"
                  className="w-[60px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px]"
                />
              </div>
            </div>
          </section>

          {/* Region Section */}
          <section>
            <h2 className="font-semibold text-[16px] mb-5">Region</h2>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <input
                  disabled
                  placeholder="Lease"
                  className="w-[120px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px]"
                />
                <input
                  disabled
                  placeholder="MM/DD/YY"
                  className="w-[120px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[14px] font-semibold mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-[240px] h-9 rounded-[8px] border border-gray-300 px-3 text-[13px] focus:ring-2 focus:ring-gray-300"
                >
                  <option>USD</option>
                  <option>CAD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>INR</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-14">
          {/* Language and Region */}
          <section>
            <h2 className="font-semibold text-[16px] mb-5">
              Language And Region
            </h2>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <label className="text-[14px] font-semibold mb-1">
                  Select language
                </label>
                <div className="flex items-center gap-2">
                  <input
                    disabled
                    placeholder="Select language"
                    className="w-[140px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px]"
                  />
                  <select
                    value="English"
                    disabled
                    className="w-[120px] h-9 rounded-[8px] border border-gray-300 text-gray-400 bg-gray-100 px-2 text-[13px]"
                  >
                    <option>English</option>
                    <option>French</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[14px] font-semibold mb-1">
                  Select Region
                </label>
                <div className="flex items-center gap-2">
                  <input
                    disabled
                    placeholder="Select Region"
                    className="w-[140px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px]"
                  />
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-[120px] h-9 rounded-[8px] border border-gray-300 px-2 text-[13px]"
                  >
                    <option>Africa</option>
                    <option>Asia</option>
                    <option>North America</option>
                    <option>Europe</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Tenant Info */}
          <section>
            <h2 className="font-semibold text-[16px] mb-5">Tenant Info</h2>
            <div className="flex flex-col gap-4">
              <input
                disabled
                placeholder="Jane Doe"
                className="w-[260px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px]"
              />
              <input
                disabled
                placeholder="laspenme.com"
                className="w-[260px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px]"
              />
              <input
                disabled
                placeholder="297491747"
                className="w-[260px] h-9 rounded-[8px] border border-gray-200 text-gray-400 bg-gray-100 px-3 text-[13px]"
              />
            </div>
          </section>

          {/* Save Button */}
          <div className="mt-4">
            <button className="h-11 px-6 rounded-[12px] bg-gray-900 text-white text-[15px] hover:bg-gray-800">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
