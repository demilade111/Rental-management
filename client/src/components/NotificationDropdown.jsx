import React, { useState, useEffect, useCallback, useRef } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notificationApi } from "@/lib/notificationApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const NotificationDropdown = () => {
  const { user, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef(null);
  const initializedUserIdRef = useRef(null);
  const isLoadingRef = useRef(false);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      isLoadingRef.current = false;
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      return;
    }
    
    isLoadingRef.current = true;
    
    try {
      // Fetch notifications from backend
      const response = await notificationApi.getAll({ limit: 50 });
      const data = response.data || response;
      const notificationsList = Array.isArray(data.notifications) ? data.notifications : [];
      
      setNotifications(notificationsList);
    } catch (error) {
      console.error("Error loading notifications:", error);
      // On error, don't clear existing notifications - keep what we have
    } finally {
      isLoadingRef.current = false;
    }
  }, [user?.id]);

  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationApi.getUnreadCount();
      const data = response.data || response;
      const count = data.count || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }, [user?.id]);

  // Initialize notifications when user is ready
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading === true) {
      return;
    }

    // If no user, clear and return
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      initializedUserIdRef.current = null;
      // Clear interval if exists
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only initialize once per user ID (prevents multiple intervals)
    if (initializedUserIdRef.current === user.id) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Mark as initialized for this user
    initializedUserIdRef.current = user.id;

    // Load notifications and unread count immediately when user is available
    loadNotifications();
    loadUnreadCount();

    // Set up interval for auto-refresh (every 7 seconds)
    intervalRef.current = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 7000);

    // Cleanup on unmount or when user changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.id, authLoading, loadNotifications, loadUnreadCount]);

  // Reload notifications when popover opens
  useEffect(() => {
    if (open && user?.id && !isLoadingRef.current) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [open, user?.id, loadNotifications, loadUnreadCount]);

  const handleNotificationClick = async (notification, e) => {
    // Prevent event propagation to avoid double-firing
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Mark notification as read
    try {
      await notificationApi.markAsRead(notification.id);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
    
    // Close popover and navigate
    setOpen(false);
    const maintenancePath = user?.role === "ADMIN" ? "/landlord/maintenance" : "/tenant/maintenance";
    navigate(maintenancePath);
  };

  const handleReadAll = async () => {
    try {
      // Mark all as read via API
      await notificationApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      
      // Close popover and navigate
      setOpen(false);
      const maintenancePath = user?.role === "ADMIN" ? "/landlord/maintenance" : "/tenant/maintenance";
      navigate(maintenancePath);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-0 hover:bg-transparent"
          onClick={() => setOpen(!open)}
        >
          <div className="relative">
            <BellRing className="h-9 w-9 text-gray-700 hover:text-gray-900 transition-colors" strokeWidth={2} />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-semibold"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                  onClick={(e) => handleNotificationClick(notification, e)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.body}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={handleReadAll}
              >
                Read All
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
