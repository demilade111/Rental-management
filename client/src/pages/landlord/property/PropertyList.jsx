import React from 'react';
import PropertyCard from './PropertyCard';
import { Checkbox } from '@/components/ui/checkbox';

const PropertyList = ({ properties, selectedItems = new Set(), onSelectionChange }) => (
  <div className="space-y-3">
    {properties.map((property) => (
      <div key={property.id} className="flex items-stretch gap-3">
        {/* Checkbox column outside of the card */}
        <div className="w-10 flex items-center justify-center">
          <Checkbox
            checked={selectedItems.has(property.id)}
            onCheckedChange={(checked) => onSelectionChange?.(property.id, Boolean(checked))}
            className="!border-black"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {/* Card takes remaining width */}
        <div className="flex-1">
          <PropertyCard property={property} />
        </div>
      </div>
    ))}
  </div>
);

export default PropertyList;
