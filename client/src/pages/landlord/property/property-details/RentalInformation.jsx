import { formatReadableDate } from '@/utils/helpers';
import React from 'react';

const RentalInformation = ({ term, rent, available, deposit }) => {
    return (
        <div className="bg-white border border-gray-400 rounded-lg p-6">
            <h2 className="text-[24px] font-bold mb-4">Rental Information</h2>
            <div className="grid grid-cols-1 gap-2">
                <div>
                    <p className="text-[16px] text-gray-600">
                        <span className='font-semibold'>Term</span>: {term}
                    </p>
                </div>
                <div>
                    <p className="text-[16px] text-gray-600">
                        <span className='font-semibold'>Rent</span>: {rent}
                    </p>
                </div>
                <div>
                    <p className="text-[16px] text-gray-600">
                        <span className='font-semibold'>Available</span>: {formatReadableDate(available)}
                    </p>
                </div>
                <div>
                    <p className="text-[16px] text-gray-600">
                        <span className='font-semibold'>Deposit</span>: $ {deposit}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RentalInformation;