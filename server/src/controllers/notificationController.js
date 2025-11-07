import {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from "../services/notificationService.js";
import { SuccessResponse, ErrorResponse, HandleError } from "../utils/httpResponse.js";

/**
 * Get all notifications for the authenticated user
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { isRead, limit = 50, offset = 0 } = req.query;

    const options = {
      isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    };

    const result = await getUserNotifications(userId, options);
    return SuccessResponse(res, 200, "Notifications retrieved successfully", result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return HandleError(res, error);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(req, res) {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);
    return SuccessResponse(res, 200, "Unread count retrieved successfully", { count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return HandleError(res, error);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await markAsRead(id, userId);
    return SuccessResponse(res, 200, "Notification marked as read", notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return HandleError(res, error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;
    const result = await markAllAsRead(userId);
    return SuccessResponse(res, 200, "All notifications marked as read", { count: result.count });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return HandleError(res, error);
  }
}

/**
 * Delete notification
 */
export async function deleteNotificationById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await deleteNotification(id, userId);
    return SuccessResponse(res, 200, "Notification deleted successfully");
  } catch (error) {
    console.error("Error deleting notification:", error);
    return HandleError(res, error);
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllReadNotifications(req, res) {
  try {
    const userId = req.user.id;
    const result = await deleteAllRead(userId);
    return SuccessResponse(res, 200, "Read notifications deleted successfully", { count: result.count });
  } catch (error) {
    console.error("Error deleting all read notifications:", error);
    return HandleError(res, error);
  }
}

