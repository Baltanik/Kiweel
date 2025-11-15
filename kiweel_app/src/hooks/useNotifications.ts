import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification } from '@/integrations/notifications/notificationService';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Fetch initial notifications
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const [allNotifications, unreadNotifications] = await Promise.all([
          notificationService.getUserNotifications(user.id, 50),
          notificationService.getUserNotifications(user.id, 100, true)
        ]);

        setNotifications(allNotifications);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    );

    return unsubscribe;
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  };

  const markAllAsRead = async () => {
    if (!user) return false;
    
    const success = await notificationService.markAllAsRead(user.id);
    if (success) {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
    return success;
  };

  const deleteNotification = async (notificationId: string) => {
    const success = await notificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
    return success;
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: () => {
      if (user) {
        notificationService.getUserNotifications(user.id, 50).then(setNotifications);
        notificationService.getUserNotifications(user.id, 100, true).then(unread => {
          setUnreadCount(unread.length);
        });
      }
    }
  };
}
