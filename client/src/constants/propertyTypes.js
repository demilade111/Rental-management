export const PROPERTY_OPTIONS = {
    RESIDENTIAL: [
        "APARTMENT",
        "CONDO",
        "TOWNHOUSE",
        "MULTI_FAMILY",
        "SINGLE_FAMILY",
        "STUDIO",
    ],
    COMMERCIAL: [
        "INDUSTRIAL",
        "OFFICE",
        "RETAIL",
        "SHOPPING_CENTER",
        "STORAGE",
        "PARKING_SPACE",
        "WAREHOUSE",
    ],
};

export const PROPERTY_CATEGORY_NAMES = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
};

export const PROPERTY_DISPLAY_NAMES = {
  APARTMENT: "Apartment",
  CONDO: "Condo",
  TOWNHOUSE: "Townhouse",
  MULTI_FAMILY: "Multi-Family",
  SINGLE_FAMILY: "Single Family",
  STUDIO: "Studio",
  INDUSTRIAL: "Industrial",
  OFFICE: "Office",
  RETAIL: "Retail",
  SHOPPING_CENTER: "Shopping Center",
  STORAGE: "Storage",
  PARKING_SPACE: "Parking Space",
  WAREHOUSE: "Warehouse",
};

export const getPropertyCategory = (type) => {
  for (const [category, types] of Object.entries(PROPERTY_OPTIONS)) {
    if (types.includes(type)) return category;
  }
  return null;
};

