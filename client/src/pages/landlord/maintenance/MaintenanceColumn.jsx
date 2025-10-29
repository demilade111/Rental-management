import React from "react";
import MaintenanceRequestCard from "./MaintenanceRequestCard";

const MaintenanceColumn = ({
  title,
  requests,
  loading,
  actions,
  onActionClick,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">
        {title} ({requests.length})
      </h2>

      {loading ? (
        <div className="text-center py-4 text-muted-foreground">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No {title.toLowerCase()} requests
        </div>
      ) : (
        requests.map((request) => (
          <MaintenanceRequestCard
            key={request.id}
            request={request}
            actions={actions}
            onActionClick={onActionClick}
          />
        ))
      )}
    </div>
  );
};

export default MaintenanceColumn;
