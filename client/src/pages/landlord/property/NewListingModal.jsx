import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AmenitiesSection } from "./AmenitiesSection";
import PhotoUploadSection from "./PhotoUploadSection";
import { useAuthStore } from "../../../store/authStore";
import { Country, State, City } from "country-state-city";
import api from "../../../lib/axios";
import API_ENDPOINTS from "../../../lib/apiEndpoints";
import {
  PropertyDetailsSection,
  PropertyAddressSection,
  RentalInformationSection,
  ContactInformationSection,
} from "./sections";

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
            <PropertyDetailsSection
              formData={formData}
              fieldErrors={fieldErrors}
              handleChange={handleChange}
              setFormData={setFormData}
              isPending={isPending}
            />

            <PropertyAddressSection
              formData={formData}
              fieldErrors={fieldErrors}
              handleChange={handleChange}
              countries={countries}
              states={states}
              cities={cities}
              handleCountryChange={handleCountryChange}
              handleStateChange={handleStateChange}
              handleCityChange={handleCityChange}
              isPending={isPending}
            />

            <RentalInformationSection
              formData={formData}
              fieldErrors={fieldErrors}
              handleChange={handleChange}
              setFormData={setFormData}
              isPending={isPending}
            />

            {/* Property Description */}
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

            {/* Amenities */}
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

            {/* Photos */}
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

            <ContactInformationSection
              formData={formData}
              fieldErrors={fieldErrors}
              handleChange={handleChange}
              isPending={isPending}
            />

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-2 text-sm border border-gray-300 bg-gray-100 rounded-md min-h-[120px]"
                placeholder="Leave a note about this listing that only you can see.."
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
