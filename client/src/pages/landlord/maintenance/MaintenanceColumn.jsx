import React from "react";
import MaintenanceRequestCard from "./MaintenanceRequestCard";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";

const MaintenanceColumn = ({
  title,
  requests,
  loading,
  error = null,
  actions,
  onActionClick,
  updatingActions, // <-- pass the object here
}) => {
  return (
    <div className="space-y-4 bg-gray-50 h-[70vh] p-6 rounded-lg flex flex-col">
      <h2 className="font-semibold text-lg">
        {title} ({requests.length})
      </h2>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState message={`Loading ${title.toLowerCase()}...`} />
        ) : error ? (
          <ErrorState message={error.message || "Something went wrong."} />
        ) : requests.length === 0 ? (
          <EmptyState message={`No ${title.toLowerCase()} requests`} />
        ) : (
          requests.map((request) => (
              <MaintenanceRequestCard
                key={request.id}
                request={request}
                actions={actions}
                onActionClick={onActionClick}
                updatingActions={updatingActions} // <-- pass down correctly
              />
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceColumn;
