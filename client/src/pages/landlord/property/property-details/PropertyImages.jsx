import React from 'react';

const PropertyImages = ({ images = [] }) => {
  // Ensure we have at least 3 images, use placeholders if not
  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
  ];

  return (
    <div className="relative h-[50vh] w-full">
      {/* Third image - Bottom layer */}
      {displayImages[2] && (
        <div 
          className="absolute top-0 right-0 w-[85%] h-[100%] rounded-2xl overflow-hidden border-4 border-white"
          style={{ zIndex: 1 }}
        >
          <img
            src={displayImages[2]}
            alt="Property interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/50"></div>
        </div>
      )}

      {/* Second image - Middle layer */}
      {displayImages[1] && (
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[100%] rounded-2xl overflow-hidden border-4 border-white"
          style={{ zIndex: 2 }}
        >
          <img
            src={displayImages[1]}
            alt="Property view"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/50"></div>
        </div>
      )}

      {/* First image - Top layer */}
      <div 
        className="absolute top-0 left-0 w-[85%] h-[100%] rounded-2xl overflow-hidden border-4 border-white"
        style={{ zIndex: 3 }}
      >
        <img
          src={displayImages[0]}
          alt="Property exterior"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Image count badge */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium z-10">
          {displayImages.length} Photos
        </div>
      )}
    </div>
  );
};

export default PropertyImages;