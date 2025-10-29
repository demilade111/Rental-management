import { Input } from "@/components/ui/input";

export const ContactInformationSection = ({
  formData,
  fieldErrors,
  handleChange,
  isPending,
}) => {
  return (
    <div className="border-b border-gray-300 space-y-6 pb-8">
      <label className="block text-sm font-medium mb-2">
        Contact Information
      </label>

      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input
          name="contactName"
          value={formData.contactName}
          onChange={handleChange}
          placeholder="Enter your name or property manager"
          className="w-full"
          required
          disabled={isPending}
        />
        {fieldErrors.contactName && (
          <p className="mt-1 text-red-400 text-sm">{fieldErrors.contactName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone Number</label>
        <Input
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder=""
          type="number"
          className="w-full"
          required
          disabled={isPending}
          onWheel={(e) => e.target.blur()}
        />
        {fieldErrors.phoneNumber && (
          <p className="mt-1 text-red-400 text-sm">{fieldErrors.phoneNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="contact@example.com"
          type="email"
          className="w-full"
          required
          disabled={isPending}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-red-400 text-sm">{fieldErrors.email}</p>
        )}
      </div>
    </div>
  );
};
