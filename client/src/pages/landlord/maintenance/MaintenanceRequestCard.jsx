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
} from "lucide-react";
import {
  getPriorityDisplayName,
  getCategoryDisplayName,
} from "@/lib/maintenanceApi";

const MaintenanceRequestCard = ({ request, actions, onActionClick, updatingActions = {} }) => {
  return (
    <div className="mb-2">
      <Card>
        <CardHeader className="flex items-start gap-3">
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
            <User className="size-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm">{request.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <MapPin className="size-3" />
              {request.listing?.title || "Unknown Property"}
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(request.createdAt).toLocaleDateString()} ·{" "}
              {getPriorityDisplayName(request.priority)}
            </p>
            <p className="text-xs text-muted-foreground">
              From: {request.user?.firstName} {request.user?.lastName}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium line-clamp-2">{request.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Category: {getCategoryDisplayName(request.category)}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          {actions.map((action) => {
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
