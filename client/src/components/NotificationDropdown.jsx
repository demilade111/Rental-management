import React, { useState, useEffect, useCallback, useRef } from "react";
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
    
    // Close popover
    setOpen(false);
    
    // Navigate based on notification type
    const insuranceTypes = [
      "INSURANCE_EXPIRING",
      "INSURANCE_EXPIRED",
      "INSURANCE_VERIFIED",
      "INSURANCE_REJECTED"
    ];
    
    if (insuranceTypes.includes(notification.type)) {
      // Navigate to insurance page
      const insurancePath = user?.role === "ADMIN" ? "/landlord/insurance" : "/tenant/insurance";
      navigate(insurancePath);
    } else {
      // Default to maintenance page for maintenance notifications
      const maintenancePath = user?.role === "ADMIN" ? "/landlord/maintenance" : "/tenant/maintenance";
      navigate(maintenancePath);
    }
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
      
      // Close popover
      setOpen(false);
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
          className="relative w-9 h-9 p-0 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setOpen(!open)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Notification Icon */}
            <svg
              viewBox="0 0 31 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="!size-7 text-gray-700 hover:text-gray-900 transition-colors"
              style={{ width: '24px', height: '24px' }}
            >
              <path
                d="M15.5001 3.1C13.0335 3.1 10.6681 4.07982 8.92397 5.82391C7.17988 7.56799 6.20006 9.93349 6.20006 12.4V17.9583L5.10421 19.0541C4.88751 19.2709 4.73994 19.5471 4.68016 19.8477C4.62038 20.1483 4.65107 20.4599 4.76836 20.7431C4.88565 21.0263 5.08426 21.2684 5.3391 21.4387C5.59393 21.609 5.89355 21.6999 6.20006 21.7H24.8001C25.1066 21.6999 25.4062 21.609 25.661 21.4387C25.9159 21.2684 26.1145 21.0263 26.2318 20.7431C26.349 20.4599 26.3797 20.1483 26.32 19.8477C26.2602 19.5471 26.1126 19.2709 25.8959 19.0541L24.8001 17.9583V12.4C24.8001 9.93349 23.8202 7.56799 22.0762 5.82391C20.3321 4.07982 17.9666 3.1 15.5001 3.1ZM15.5001 27.9C14.2668 27.9 13.0841 27.4101 12.212 26.538C11.34 25.666 10.8501 24.4833 10.8501 23.25H20.1501C20.1501 24.4833 19.6602 25.666 18.7881 26.538C17.9161 27.4101 16.7333 27.9 15.5001 27.9Z"
                fill="currentColor"
              />
            </svg>
            {/* Badge Indicator */}
            {unreadCount > 0 && (
              <span
                className="absolute top-0 right-0 h-5 w-5 min-w-[20px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
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
