import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AmenitiesSection, PREDEFINED_AMENITIES } from "./AmenitiesSection";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

const NewListingModal = ({ isOpen, onClose, initialData = null, propertyId = null }) => {
  const token = useAuthStore((state) => state.token);
  const [fieldErrors, setFieldErrors] = useState({});
  const queryClient = useQueryClient();
  const isEditMode = Boolean(propertyId && initialData);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showAddAmenityInput, setShowAddAmenityInput] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Preselect all amenities when modal opens (create mode only)
  useEffect(() => {
    if (isOpen && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...PREDEFINED_AMENITIES],
      }));
    }
  }, [isOpen, isEditMode]);

  // Populate form with initial data in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && initialData) {
      const countryCode = initialData.country || '';
      const stateCode = initialData.state || '';
      
      // Load states and cities based on initial data
      if (countryCode) {
        const countryStates = State.getStatesOfCountry(countryCode);
        setStates(countryStates);
        
        if (stateCode) {
          const stateCities = City.getCitiesOfState(countryCode, stateCode);
          setCities(stateCities);
        }
      }

      // Extract amenity names
      const amenityNames = initialData.amenities?.map(a => 
        typeof a === 'string' ? a : a.name
      ) || [];

      // Extract image URLs
      const imageUrls = initialData.images?.map(img => 
        typeof img === 'string' ? img : img.url
      ) || [];

      setFormData({
        title: initialData.title || '',
        propertyType: initialData.propertyType || '',
        propertyOwner: initialData.propertyOwner || '',
        bedrooms: initialData.bedrooms?.toString() || '',
        bathrooms: initialData.bathrooms?.toString() || '',
        totalSquareFeet: initialData.totalSquareFeet?.toString() || '',
        yearBuilt: initialData.yearBuilt?.toString() || '',
        country: countryCode,
        state: stateCode,
        city: initialData.city || '',
        streetAddress: initialData.streetAddress || '',
        zipCode: initialData.zipCode || '',
        rentCycle: initialData.rentCycle || '',
        rentAmount: initialData.rentAmount?.toString() || '',
        securityDeposit: initialData.securityDeposit?.toString() || '',
        availableDate: initialData.availableDate ? new Date(initialData.availableDate) : null,
        description: initialData.description || '',
        contactName: initialData.contactName || '',
        phoneNumber: initialData.phoneNumber || '',
        email: initialData.email || '',
        notes: initialData.notes || '',
        amenities: amenityNames,
        images: imageUrls,
      });
    }
  }, [isOpen, isEditMode, initialData]);

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
    amenities: [...PREDEFINED_AMENITIES], // Preselect all predefined amenities
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAmenitiesChange = (selectedAmenities) => {
    setFormData((prev) => ({
      ...prev,
      amenities: selectedAmenities,
    }));

    if (fieldErrors.amenities) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.amenities;
        return newErrors;
      });
    }
  };

  const handleAddCustomAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      handleAmenitiesChange([...formData.amenities, newAmenity.trim()]);
      setNewAmenity("");
      setShowAddAmenityInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomAmenity();
    } else if (e.key === "Escape") {
      setShowAddAmenityInput(false);
      setNewAmenity("");
    }
  };

  const handleImagesChange = (images) => {
    setFormData((prev) => ({
      ...prev,
      images: images,
    }));

    if (fieldErrors.images) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const handleCountryChange = (e) => {
    const selectedCountryCode = e.target.value;

    setFormData((prev) => ({
      ...prev,
      country: selectedCountryCode,
      state: "",
      city: "",
    }));

    setStates(State.getStatesOfCountry(selectedCountryCode));
    setCities([]);

    if (fieldErrors.country) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.country;
        return newErrors;
      });
    }
  };

  const handleStateChange = (e) => {
    const selectedStateCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state: selectedStateCode,
      city: "",
    }));

    if (formData.country && selectedStateCode) {
      setCities(City.getCitiesOfState(formData.country, selectedStateCode));
    } else {
      setCities([]);
    }

    if (fieldErrors.state) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.state;
        return newErrors;
      });
    }
  };

  const handleCityChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      city: e.target.value,
    }));

    if (fieldErrors.city) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.city;
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    setFieldErrors({});
    resetForm();
    onClose();
  };

  const createListingMutation = useMutation({
    mutationFn: async (data) => {
      try {
        let response;
        if (isEditMode) {
          // Update existing listing
          response = await api.put(API_ENDPOINTS.LISTINGS.BY_ID(propertyId), data);
        } else {
          // Create new listing
          response = await api.post(API_ENDPOINTS.LISTINGS.BASE, data);
        }
        return response.data;
      } catch (error) {
        console.log(isEditMode ? "Update listing error:" : "Create listing error:", error);

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
            (isEditMode ? "Failed to update listing" : "Failed to create listing"),
          details: parsedDetails,
        };
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Property updated successfully!" : "Property added successfully!");
      queryClient.invalidateQueries(["listings"]);
      if (isEditMode) {
        queryClient.invalidateQueries(["property", propertyId]);
      }
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
      amenities: [...PREDEFINED_AMENITIES], // Preselect all predefined amenities
      images: [],
    });
    setFieldErrors({});
    setShowAddAmenityInput(false);
    setNewAmenity("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token missing, please login again");
      return;
    }

    try {
      let uploadedUrls = [];

      if (formData.images && formData.images.length > 0) {
        for (const file of formData.images) {
          if (file instanceof File) {
            try {
              // Get presigned URL from backend
              const presignRes = await api.get(`${API_ENDPOINTS.UPLOADS.BASE}/s3-url`, {
                params: {
                  fileName: encodeURIComponent(file.name),
                  fileType: file.type,
                  category: "listings",
                },
              });

              const { uploadURL, fileUrl } = presignRes.data.data || presignRes.data;

              // Upload file directly to S3 using presigned URL
              const putRes = await fetch(uploadURL, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
              });

              if (!putRes.ok) {
                throw new Error(`Upload failed for ${file.name}`);
              }

              uploadedUrls.push(fileUrl);
            } catch (uploadErr) {
              console.error("Image upload error:", uploadErr);
              toast.error(`Failed to upload ${file.name}`);
              throw uploadErr; // Re-throw to stop the submission
            }
          } else if (typeof file === "string") {
            // Already a URL, use as is
            uploadedUrls.push(file);
          }
        }
      }

      const normalizedAmenities = formData.amenities.map((a) =>
        typeof a === "string" ? a.trim() : a.name?.trim()
      );

      console.log("Submitting listing with data:", formData);

      // Normalize phone to only allowed characters (backend regex: digits, space, -, +, parentheses)
      const rawPhone = formData.phoneNumber || "";
      const normalizedPhone = rawPhone.replace(/[^0-9\s\-+()]/g, "").trim();

      // Pre-validate: require at least 6 digits after removing non-digits
      const phoneDigits = normalizedPhone.replace(/\D/g, "");
      if (normalizedPhone && phoneDigits.length > 0 && phoneDigits.length < 6) {
        setFieldErrors((prev) => ({ ...prev, phoneNumber: "Phone number is too short" }));
        toast.error("Please enter a valid phone number");
        return;
      }

      const submitData = {
        ...formData,
        propertyType: formData.propertyType,
        amenities: normalizedAmenities,
        images: uploadedUrls,
        phoneNumber: normalizedPhone || undefined,
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
            const backendErrors = {};
            error.details.forEach((item) => {
              if (item.path && item.path.length > 0) {
                backendErrors[item.path[0]] = item.message;
              }
            });
            setFieldErrors(backendErrors);
            toast.error("Please fix the errors in the form");
          } else {
            toast.error(error.message);
          }
        },
      });
    } catch (err) {
      console.error("Image upload or listing creation failed:", err);
      toast.error(err.message || "Failed to upload images");
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
              {isEditMode ? 'Edit Property' : 'New Listing'}
            </DialogTitle>
          </div>
        </DialogHeader>

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
              setFormData={setFormData}
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

            <div className="border-b border-gray-300 space-y-6 pb-8">
              <label className="block text-sm font-medium mb-4">
                Property Description
              </label>
              <div className="space-y-2">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`min-h-[120px] resize-none ${fieldErrors.description
                    ? 'border-destructive bg-destructive/10'
                    : ''
                    }`}
                  placeholder="Describe your property, its features and amenities etc.."
                  disabled={isPending}
                />
                {fieldErrors.description && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
            </div>

            <div className="border-b border-gray-300 space-y-6 pb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium mb-4">
                  Amenities
                </label>
                <div className="flex items-center gap-2 ml-auto">
                  {!showAddAmenityInput ? (
                    <button
                      type="button"
                      onClick={() => setShowAddAmenityInput(true)}
                      className="flex items-center gap-1 text-gray-600 text-sm font-medium underline hover:text-blue-800"
                      disabled={isPending}
                    >
                      <Plus className="w-4 h-4" />
                      Add Amenity
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter amenity name"
                        className="text-sm h-8 w-40"
                        disabled={isPending}
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCustomAmenity}
                        disabled={isPending || !newAmenity.trim()}
                        className="h-8 px-3"
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddAmenityInput(false);
                          setNewAmenity("");
                        }}
                        disabled={isPending}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <AmenitiesSection
                selectedAmenities={formData.amenities}
                onAmenitiesChange={handleAmenitiesChange}
                disabled={isPending}
              />
              {fieldErrors.amenities && (
                <p className="mt-1 text-red-500 text-sm">
                  {fieldErrors.amenities}
                </p>
              )}
            </div>

            <div className="border-b border-gray-300 space-y-6 pb-8">
              <label className="block text-sm font-medium mb-4">Photos</label>
              <PhotoUploadSection
                images={formData.images}
                onImagesChange={handleImagesChange}
                disabled={isPending}
              />
              {fieldErrors.images && (
                <p className="mt-1 text-red-500 text-sm">
                  {fieldErrors.images}
                </p>
              )}
            </div>

            <ContactInformationSection
              formData={formData}
              fieldErrors={fieldErrors}
              handleChange={handleChange}
              setFormData={setFormData}
              isPending={isPending}
            />

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={`min-h-[120px] resize-none ${fieldErrors.notes
                    ? 'border-destructive bg-destructive/10'
                    : ''
                  }`}
                placeholder="Leave a note about this listing that only you can see.."
                disabled={isPending}
              />
              {fieldErrors.notes && (
                <p className="text-sm text-destructive">{fieldErrors.notes}</p>
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
                className="border-0 text-gray-700 shadow-none rounded-2xl"
                disabled={isPending}
              >
                Discard
              </Button>
            </div>
            <div className="space-x-3">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 rounded-2xl"
                disabled={isPending}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                className="bg-black text-white hover:bg-gray-800 rounded-2xl"
                disabled={isPending}
              >
                {isPending 
                  ? (isEditMode ? "Updating..." : "Adding...") 
                  : (isEditMode ? "Update Property" : "Add Property")
                }
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewListingModal;