import { Input } from "@/components/ui/input";

export const PropertyAddressSection = ({
  formData,
  fieldErrors,
  handleChange,
  countries,
  states,
  cities,
  handleCountryChange,
  handleStateChange,
  handleCityChange,
  isPending,
}) => {
  return (
    <div className="border-b border-gray-300 space-y-6 pb-8">
      <div>
        <label className="block text-sm font-medium mb-2">Country</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleCountryChange}
          className="w-full text-sm p-2 border border-gray-300 rounded-md"
          required
          disabled={isPending}
        >
          <option value="" disabled>
            Select country
          </option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldErrors.country && (
          <p className="mt-1 text-red-400 text-sm">{fieldErrors.country}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleStateChange}
            className="w-full p-2 text-sm border border-gray-300 rounded-md"
            required
            disabled={!formData.country || isPending}
          >
            <option value="" disabled>
              Select state
            </option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
          {fieldErrors.state && (
            <p className="mt-1 text-red-400 text-sm">{fieldErrors.state}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleCityChange}
            className="w-full text-sm p-2 border border-gray-300 rounded-md"
            required
            disabled={!formData.state || isPending}
          >
            <option value="" disabled>
              Select city
            </option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.city && (
            <p className="mt-1 text-red-400 text-sm">{fieldErrors.city}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Street Address</label>
        <textarea
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          className="w-full text-sm p-2 border border-gray-300 bg-gray-100 rounded-md min-h-[120px]"
          placeholder="Enter full address.."
          required
          disabled={isPending}
        />
        {fieldErrors.streetAddress && (
          <p className="mt-1 text-red-400 text-sm">
            {fieldErrors.streetAddress}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">ZIP</label>
        <Input
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          className="w-1/2"
          required
          disabled={isPending}
        />
        {fieldErrors.zipCode && (
          <p className="mt-1 text-red-400 text-sm">{fieldErrors.zipCode}</p>
        )}
      </div>
    </div>
  );
};
