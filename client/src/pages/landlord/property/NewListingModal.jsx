import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AmenitiesSection } from "./AmenitiesSection";
import PhotoUploadSection from "./PhotoUploadSection";
import { useAuthStore } from "../../../store/authStore";
import {
  PROPERTY_CATEGORY_NAMES,
  PROPERTY_OPTIONS,
} from "@/constants/propertyTypes";
import { RENTCYCLE_OPTIONS } from "@/constants/rentCycles";
import { Country, State, City } from "country-state-city";
import api from "../../../lib/axios";
import API_ENDPOINTS from "../../../lib/apiEndpoints";

const NewListingModal = ({ isOpen, onClose }) => {
  const token = useAuthStore((state) => state.token);
  const [fieldErrors, setFieldErrors] = useState({});
  const queryClient = useQueryClient();

  // Inside your component:
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Populate countries once
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    propertyOwner: "",
    bedrooms: "",
    bathrooms: "",
    totalSquareFeet: "",
    yearBuilt: "",
    country: "",
    state: "",
    city: "",
    streetAddress: "",
    zipCode: "",
    rentCycle: "",
    rentAmount: "",
    securityDeposit: "",
    availableDate: null,
    description: "",
    contactName: "",
    phoneNumber: "",
    email: "",
    notes: "",
    amenities: [],
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenitiesChange = (selectedAmenities) => {
    setFormData((prev) => ({
      ...prev,
      amenities: selectedAmenities,
    }));
  };

  const handleImagesChange = (images) => {
    setFormData((prev) => ({
      ...prev,
      images: images,
    }));
  };

  // Handle country change
  const handleCountryChange = (e) => {
    const selectedCountryCode = e.target.value;

    setFormData((prev) => ({
      ...prev,
      country: selectedCountryCode,
      state: "",
      city: "",
    }));

    // Load states for selected country
    setStates(State.getStatesOfCountry(selectedCountryCode));
    setCities([]); // reset cities
  };

  // Handle state change
  const handleStateChange = (e) => {
    const selectedStateCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state: selectedStateCode,
      city: "",
    }));

    // Load cities for selected state
    if (formData.country && selectedStateCode) {
      setCities(City.getCitiesOfState(formData.country, selectedStateCode));
    } else {
      setCities([]);
    }
  };

  // Handle city change
  const handleCityChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      city: e.target.value,
    }));
  };

  const handleClose = () => {
    setFieldErrors({});
    resetForm();
    onClose();
  };

  const createListingMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await api.post(API_ENDPOINTS.LISTINGS.BASE, data);
        return response.data;
      } catch (error) {
        console.log("Create listing error:", error);

        let parsedDetails = [];
        try {
          parsedDetails = JSON.parse(error.response?.data?.details || "[]");
        } catch (e) {
          console.error("Failed to parse error details", e);
        }

        throw {
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to create listing",
          details: parsedDetails,
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["listings"]);
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      propertyType: "",
      propertyOwner: "",
      bedrooms: "",
      bathrooms: "",
      totalSquareFeet: "",
      yearBuilt: "",
      country: "",
      state: "",
      city: "",
      streetAddress: "",
      zipCode: "",
      rentCycle: "",
      rentAmount: "",
      securityDeposit: "",
      availableDate: null,
      description: "",
      contactName: "",
      phoneNumber: "",
      email: "",
      notes: "",
      amenities: [],
      images: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Token missing, please login again");
      return;
    }

    try {
      let uploadedUrls = [];

      if (formData.images && formData.images.length > 0) {
        for (const file of formData.images) {
          if (file instanceof File) {
            const uploadForm = new FormData();
            uploadForm.append("file", file);

            const uploadRes = await api.post(
              API_ENDPOINTS.UPLOADS.BASE,
              uploadForm,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            uploadedUrls.push(uploadRes.data.url);
          } else if (typeof file === "string") {
            uploadedUrls.push(file);
          }
        }
      }

      const normalizedAmenities = formData.amenities.map((a) =>
        typeof a === "string" ? a.trim() : a.name?.trim()
      );

      console.log("Submitting listing with data:", formData);

      const submitData = {
        ...formData,
        propertyType: formData.propertyType,
        amenities: normalizedAmenities,
        images: uploadedUrls,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        totalSquareFeet: parseInt(formData.totalSquareFeet) || 0,
        yearBuilt: parseInt(formData.yearBuilt) || 0,
        rentAmount: parseFloat(formData.rentAmount) || 0,
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        availableDate: formData.availableDate
          ? formData.availableDate.toISOString()
          : null,
      };

      createListingMutation.mutate(submitData, {
        onError: (error) => {
          console.error("Backend error object:", error);

          if (error.details) {
            const fieldErrors = {};
            error.details.forEach((item) => {
              if (item.path && item.path.length > 0) {
                fieldErrors[item.path[0]] = item.message;
              }
            });
            setFieldErrors(fieldErrors);
          } else {
            alert(error.message);
          }
        },
      });
    } catch (err) {
      console.error("Image upload or listing creation failed:", err);
      alert(err.message);
    }
  };

  const { isPending } = createListingMutation;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open === false) return;
        onClose();
      }}
      modal
      open={isOpen}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90vh] flex flex-col p-0"
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              New Listing
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-10 py-6">
          <div className="space-y-6 pb-6">
            {/* property details section */}
            <div className="border-b border-gray-300 space-y-6 pb-8">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Title
                </label>
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
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type
                </label>
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
                    <optgroup
                      key={category}
                      label={PROPERTY_CATEGORY_NAMES[category]}
                    >
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
                <label className="block text-sm font-medium mb-2">
                  Property Owner
                </label>
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
                  <label className="block text-sm font-medium mb-2">
                    Bedrooms
                  </label>
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
                    <p className="mt-1 text-red-400 text-sm">
                      {fieldErrors.bedrooms}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bathrooms
                  </label>
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
                    <p className="mt-1 text-red-400 text-sm">
                      {fieldErrors.bathrooms}
                    </p>
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
                  <label className="block text-sm font-medium mb-2">
                    Year Built
                  </label>
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
                    <p className="mt-1 text-red-400 text-sm">
                      {fieldErrors.yearBuilt}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* property address section */}
            <div className="border-b border-gray-300 space-y-6 pb-8">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Country
                </label>
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
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.country}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State
                  </label>
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
                    <p className="mt-1 text-red-400 text-sm">
                      {fieldErrors.state}
                    </p>
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
                    <p className="mt-1 text-red-400 text-sm">
                      {fieldErrors.city}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Street Address
                </label>
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
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.zipCode}
                  </p>
                )}
              </div>
            </div>

            {/* rental information section */}
            <div className="border-b border-gray-300 space-y-6 pb-8">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rent Cycle
                </label>
                <select
                  name="rentCycle"
                  value={formData.rentCycle}
                  onChange={handleChange}
                  className="w-full text-sm p-2 border border-gray-300 rounded-md"
                  required
                  disabled={isPending}
                >
                  <option value="" disabled>
                    Select rent cycle
                  </option>
                  {RENTCYCLE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                {fieldErrors.rentCycle && (
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.rentCycle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rent</label>
                  <Input
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleChange}
                    placeholder="$ 1,200"
                    className="w-full text-sm"
                    required
                    disabled={isPending}
                  />
                  {fieldErrors.rentAmount && (
                    <p className="mt-1 text-red-400 text-sm">
                      {fieldErrors.rentAmount}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Security Deposit
                  </label>
                  <Input
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    placeholder="$ 600"
                    className="w-full text-sm"
                    required
                    disabled={isPending}
                  />
                  {fieldErrors.securityDeposit && (
                    <p className="mt-1 text-red-400 text-sm">
                      {fieldErrors.securityDeposit}
                    </p>
                  )}
                </div>
              </div>

              {/* available date picker */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Available From
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-1/2 justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
                        !formData.availableDate && "text-gray-600"
                      )}
                      disabled={isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.availableDate ? (
                        format(formData.availableDate, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}{" "}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={formData.availableDate}
                      onSelect={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          availableDate: date,
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.availableDate && (
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.availableDate}
                  </p>
                )}
              </div>
            </div>

            {/* property description section */}
            <div className="border-b border-gray-300 space-y-6 pb-8">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border border-gray-300 bg-gray-100 rounded-md min-h-[120px]"
                  placeholder="Describe your property, its features and amenities etc.."
                  disabled={isPending}
                />
                {fieldErrors.description && (
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
            </div>

            {/* amenities section */}
            <div className="border-b border-gray-300 space-y-6 pb-8">
              <label className="block text-sm font-medium mb-2">
                Amenities
              </label>
              <AmenitiesSection
                selectedAmenities={formData.amenities}
                onAmenitiesChange={handleAmenitiesChange}
                disabled={isPending}
              />
              {fieldErrors.amenities && (
                <p className="mt-1 text-red-400 text-sm">
                  {fieldErrors.amenities}
                </p>
              )}
            </div>

            {/* photos upload section */}
            <div className="border-b border-gray-300 space-y-6 pb-8">
              <label className="block text-sm font-medium mb-2">Photos</label>
              <PhotoUploadSection
                images={formData.images}
                onImagesChange={handleImagesChange}
                disabled={isPending}
              />
              {fieldErrors.images && (
                <p className="mt-1 text-red-400 text-sm">
                  {fieldErrors.images}
                </p>
              )}
            </div>

            {/* contact infos section */}
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
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.contactName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
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
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.phoneNumber}
                  </p>
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
                  <p className="mt-1 text-red-400 text-sm">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* property notes section */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-2 text-sm border border-gray-300 bg-gray-100 rounded-md min-h-[120px]"
                placeholder="Leave a not about this listing that only you can see.."
                disabled={isPending}
              />
              {fieldErrors.notes && (
                <p className="mt-1 text-red-400 text-sm">{fieldErrors.notes}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
          <div className="flex justify-between w-full">
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-0 text-gray-700 shadow-none"
                disabled={isPending}
              >
                Discard
              </Button>
            </div>
            <div className="space-x-3">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300"
                disabled={isPending}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                className="bg-black text-white hover:bg-gray-800"
                disabled={isPending}
              >
                {isPending ? "Adding..." : "Add Property"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewListingModal;
