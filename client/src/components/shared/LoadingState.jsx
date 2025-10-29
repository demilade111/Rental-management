import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
};

export default LoadingState;
