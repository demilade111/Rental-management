import React from 'react';
import PropertyCard from './PropertyCard';

const PropertyList = ({ properties }) => (
  <div className="space-y-4">
    {properties.map((property) => (
      <PropertyCard key={property.id} property={property} />
    ))}
  </div>
);

export default PropertyList;
