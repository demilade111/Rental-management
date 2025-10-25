import React from 'react';
import { Map, MapPin, MapPinCheck } from 'lucide-react';

const AddressCard = ({ fullAddress }) => {
    return (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
            <div className="flex flex-row items-center mb-6">
                <div className="mr-3 flex items-center">
                    <MapPin className="w-10 h-10" />
                </div>

                <div className="flex flex-col justify-center">
                    <h2 className="text-xl font-bold">Address</h2>
                    <p className="text-sm text-gray-700">{fullAddress}</p>
                </div>
            </div>

            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                <img
                    src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-123.1384,49.2876,13,0/400x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
                    alt="Map"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default AddressCard;