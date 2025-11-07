import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  Reply,
  Trash2,
  Eye,
  Check,
  ViewIcon,
  ToolCase,
  Cog,
  ToolCaseIcon,
  Settings2Icon,
  LucideSettings,
  Settings,
} from "lucide-react";
import {
  getPriorityDisplayName,
  getCategoryDisplayName,
} from "@/lib/maintenanceApi";

const MaintenanceRequestCard = ({ request, actions, onActionClick, updatingActions = {}, currentUserRole, currentUserId, onCardClick }) => {
  // Filter actions based on who created the request
  const filteredActions = actions.filter((action) => {
    if (action === "Accept") {
      // Hide "Accept" if the request was created by a TENANT and current user is not ADMIN
      if (request.user?.role === "TENANT" && currentUserRole !== "ADMIN") {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="mb-2">
      <Card className="cursor-pointer" onClick={() => onCardClick?.(request)}>
        <CardHeader className="flex items-center gap-3">
          <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
            <Settings className="size-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold leading-tight mb-0.5">{request.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs leading-tight">
              <MapPin className="size-3" />
              {request.listing?.title || "Unknown Property"}
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 leading-tight">
              <Calendar className="size-3" />
              {new Date(request.createdAt).toLocaleDateString()} ·
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  request.priority === "URGENT"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : request.priority === "HIGH"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {getPriorityDisplayName(request.priority)}
              </span>
            </p>
            {request.user?.id !== currentUserId && (
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                From: {request.user?.firstName} {request.user?.lastName}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium line-clamp-2">{request.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Category: {getCategoryDisplayName(request.category)}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between" onClick={(e) => e.stopPropagation()}>
          {filteredActions.map((action) => {
            const isUpdating = updatingActions[request.id] === action; // check per button

            return (
              <Button
                className="rounded-2xl py-6 border-gray-400"
                key={action}
                variant={
                  action === "Cancel" || action === "Trash" ? "outline" : "outline"
                }
                size="lg"
                onClick={() => onActionClick(action, request.id)}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : (
                  <>
                    {action === "Cancel" && <X className="size-4 mr-1" />}
                    {action === "Accept" && <Check className="size-4 mr-1 bg-black text-white rounded-full" />}
                    {action === "Reply" && <Reply className="size-4 mr-1" />}
                    {action === "Finish" && <Check className="size-4 mr-1 bg-black text-white rounded-full" />}
                    {action === "Trash" && <Trash2 className="size-4 mr-1" />}
                    {action === "View" && <Eye className="size-4 mr-1" />}
                    {action}
                  </>
                )}
              </Button>
            );
          })}
        </CardFooter>
      </Card>
    </div>
  );
};

export default MaintenanceRequestCard;
