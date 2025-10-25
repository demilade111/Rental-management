import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const NeighbourhoodScore = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full"
            >
                <h2 className="text-xl font-bold">Neighbourhood Score</h2>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>
            {isExpanded && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">Coming soon...</p>
                </div>
            )}
        </div>
    );
};

export default NeighbourhoodScore;