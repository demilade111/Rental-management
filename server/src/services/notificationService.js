import { prisma } from "../prisma/client.js";

/**
 * Create a notification
 */
async function createNotification(data) {
  const { userId, type, title, body, relatedId, metadata } = data;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      relatedId,
      metadata: metadata || {},
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return notification;
}

/**
 * Get all notifications for a user
 */
async function getUserNotifications(userId, options = {}) {
  const { isRead, limit = 50, offset = 0 } = options;

  const where = { userId };
  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    total,
    limit,
    offset,
  };
}

/**
 * Get unread notification count for a user
 */
async function getUnreadCount(userId) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId, userId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    const err = new Error("Notification not found");
    err.status = 404;
    throw err;
  }

  if (notification.userId !== userId) {
    const err = new Error("Unauthorized to mark this notification as read");
    err.status = 403;
    throw err;
  }

  if (notification.isRead) {
    return notification;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result;
}

/**
 * Delete notification
 */
async function deleteNotification(notificationId, userId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    const err = new Error("Notification not found");
    err.status = 404;
    throw err;
  }

  if (notification.userId !== userId) {
    const err = new Error("Unauthorized to delete this notification");
    err.status = 403;
    throw err;
  }

  return prisma.notification.delete({
    where: { id: notificationId },
  });
}

/**
 * Delete all read notifications for a user
 */
async function deleteAllRead(userId) {
  return prisma.notification.deleteMany({
    where: {
      userId,
      isRead: true,
    },
  });
}

/**
 * Create maintenance request notification
 */
async function createMaintenanceRequestNotification(request, recipientUserId) {
  const listingName = request.listing?.streetAddress || request.listing?.title || "Property";
  const userName = request.user?.firstName && request.user?.lastName
    ? `${request.user.firstName} ${request.user.lastName}`
    : "Tenant";

  const title = request.title;
  const body = `New maintenance request from ${userName} at ${listingName}`;

  return createNotification({
    userId: recipientUserId,
    type: "MAINTENANCE_REQUEST",
    title,
    body,
    relatedId: request.id,
    metadata: {
      listingId: request.listingId,
      listingName,
      userName,
      priority: request.priority,
      category: request.category,
    },
  });
}

/**
 * Create maintenance message notification
 */
async function createMaintenanceMessageNotification(request, recipientUserId, unreadCount) {
  const listingName = request.listing?.streetAddress || request.listing?.title || "Property";

  const title = request.title;
  const body = `You have ${unreadCount} new message${unreadCount > 1 ? "s" : ""} on this maintenance request`;

  return createNotification({
    userId: recipientUserId,
    type: "MAINTENANCE_MESSAGE",
    title,
    body,
    relatedId: request.id,
    metadata: {
      listingId: request.listingId,
      listingName,
      unreadCount,
    },
  });
}

export {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createMaintenanceRequestNotification,
  createMaintenanceMessageNotification,
};

