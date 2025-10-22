import { Checkbox } from "@/components/ui/checkbox";

export function AmenitiesSection() {
    const amenities = [
        "Air Conditioning",
        "Parking",
        "Dishwasher",
        "Gym/Fitness",
        "Balcony/Patio",
        "Heating",
        "Laundry",
        "Pet Friendly",
        "Swimming Pool",
    ];

    const leftColumn = amenities.slice(0, 5);
    const rightColumn = amenities.slice(5);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-10 gap-y-2">
                {/* Left column */}
                <div className="space-y-2">
                    {leftColumn.map((item) => (
                        <label key={item} className="flex items-center space-x-2">
                            <Checkbox id={item} />
                            <span className="text-sm">{item}</span>
                        </label>
                    ))}
                </div>

                {/* Right column */}
                <div className="space-y-2">
                    {rightColumn.map((item) => (
                        <label key={item} className="flex items-center space-x-2">
                            <Checkbox id={item} />
                            <span className="text-sm">{item}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Add Amenity link */}
            <button
                type="button"
                className="text-gray-600 text-sm font-medium underline hover:text-blue-800"
            >
                Add Amenity
            </button>
        </div>
    );
}
