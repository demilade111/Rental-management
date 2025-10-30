import React from "react";

const PageHeader = ({ title, subtitle }) => {
    return (
        <div className="mb-6">
            <h1 className="text-[32px] font-bold mb-1">{title}</h1>
            {subtitle && <p className="text-[16px] text-gray-600">{subtitle}</p>}
        </div>
    );
};

export default PageHeader;
