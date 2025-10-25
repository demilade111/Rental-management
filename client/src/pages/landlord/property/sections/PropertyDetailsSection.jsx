import { Input } from "@/components/ui/input";
import {
  PROPERTY_CATEGORY_NAMES,
  PROPERTY_OPTIONS,
} from "@/constants/propertyTypes";

export const PropertyDetailsSection = ({
  formData,
  fieldErrors,
  handleChange,
  setFormData,
  isPending,
}) => {
  return (
    <div className="border-b border-gray-300 space-y-6 pb-8">
      <div>
        <label className="block text-sm font-medium mb-2">Property Title</label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter property name"
          className="w-full"
          required
          disabled={isPending}
        />
        {fieldErrors.title && (
          <p className="mt-1 text-red-400 text-sm">{fieldErrors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Property Type</label>
        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={(e) =>
            setFormData({ ...formData, propertyType: e.target.value })
          }
          className="w-full text-gray-600 text-sm p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select property type</option>
          {Object.entries(PROPERTY_OPTIONS).map(([category, types]) => (
            <optgroup key={category} label={PROPERTY_CATEGORY_NAMES[category]}>
              {types.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {fieldErrors.propertyType && (
          <p className="mt-1 text-red-400 text-sm">
            {fieldErrors.propertyType}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Property Owner</label>
        <Input
          name="propertyOwner"
          value={formData.propertyOwner}
          onChange={handleChange}
          placeholder="Enter full legal name"
          className="w-full"
          required
          disabled={isPending}
        />
        {fieldErrors.propertyOwner && (
          <p className="mt-1 text-red-400 text-sm">
            {fieldErrors.propertyOwner}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Bedrooms</label>
          <Input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            placeholder="0"
            className="w-full"
            disabled={isPending}
            onWheel={(e) => e.target.blur()}
          />
          {fieldErrors.bedrooms && (
            <p className="mt-1 text-red-400 text-sm">{fieldErrors.bedrooms}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Bathrooms</label>
          <Input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            placeholder="0"
            className="w-full"
            disabled={isPending}
            onWheel={(e) => e.target.blur()}
          />
          {fieldErrors.bathrooms && (
            <p className="mt-1 text-red-400 text-sm">{fieldErrors.bathrooms}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Total Square Feet
          </label>
          <Input
            type="number"
            name="totalSquareFeet"
            value={formData.totalSquareFeet}
            onChange={handleChange}
            className="w-full"
            disabled={isPending}
            onWheel={(e) => e.target.blur()}
          />
          {fieldErrors.totalSquareFeet && (
            <p className="mt-1 text-red-400 text-sm">
              {fieldErrors.totalSquareFeet}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Year Built</label>
          <Input
            type="number"
            name="yearBuilt"
            value={formData.yearBuilt}
            onChange={handleChange}
            className="w-full"
            disabled={isPending}
            onWheel={(e) => e.target.blur()}
          />
          {fieldErrors.yearBuilt && (
            <p className="mt-1 text-red-400 text-sm">{fieldErrors.yearBuilt}</p>
          )}
        </div>
      </div>
    </div>
  );
};
