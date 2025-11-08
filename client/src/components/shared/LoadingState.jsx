import React from 'react';

const LoadingState = ({ message = 'Loading...', compact = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-4' : 'min-h-[50vh]'}`}>
            <style>{`
                @keyframes bigBounce {
                    0%, 80%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    40% {
                        transform: translateY(-8px) scale(1.1);
                    }
                }
                .bounce-dot {
                    animation: bigBounce 1s ease-in-out infinite;
                }
            `}</style>
            <div className="flex gap-1 mb-2 h-5 items-end">
                <div className="w-0.5 h-0.5 bg-primary rounded-full bounce-dot" style={{ animationDelay: '0ms' }}></div>
                <div className="w-0.5 h-0.5 bg-primary rounded-full bounce-dot" style={{ animationDelay: '150ms' }}></div>
                <div className="w-0.5 h-0.5 bg-primary rounded-full bounce-dot" style={{ animationDelay: '300ms' }}></div>
            </div>
            {message && <p className="text-xs text-gray-400">{message}</p>}
        </div>
    );
};

export default LoadingState;
