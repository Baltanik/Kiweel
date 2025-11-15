import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'plan' | 'token' | 'mission';
  read: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private notificationPermission: NotificationPermission = 'default';

  private constructor() {
    this.requestPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
    return this.notificationPermission;
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title: string, options?: NotificationOptions) {
    if (this.notificationPermission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }

  /**
   * Create in-app notification
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    actionUrl?: string,
    metadata?: any
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Also show browser notification for important types
      if (['booking', 'plan', 'mission'].includes(type)) {
        this.showBrowserNotification(title, {
          body: message,
          tag: `kiweel-${type}`,
          requireInteraction: type === 'booking'
        });
      }

      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        read: data.read || false,
        created_at: data.created_at
      } as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        message: item.message,
        type: item.type || 'info',
        read: item.read || false,
        created_at: item.created_at
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      return !error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification;
          onNotification(notification);
          
          // Show browser notification for new notifications
          this.showBrowserNotification(notification.title, {
            body: notification.message,
            tag: `kiweel-${notification.type}`,
            data: notification
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Predefined notification creators
   */
  async notifyBookingConfirmed(userId: string, bookingDetails: any) {
    return this.createNotification(
      userId,
      'Prenotazione Confermata',
      `La tua prenotazione per ${bookingDetails.service} è stata confermata per il ${bookingDetails.date} alle ${bookingDetails.time}`,
      'booking',
      '/calendar',
      { booking_id: bookingDetails.id }
    );
  }

  async notifyBookingCompleted(userId: string, tokensAwarded: number) {
    return this.createNotification(
      userId,
      'Appuntamento Completato',
      `Hai completato il tuo appuntamento e guadagnato ${tokensAwarded} tokens! 🎉`,
      'success',
      '/missions',
      { tokens_awarded: tokensAwarded }
    );
  }

  async notifyNewPlan(userId: string, planType: 'diet' | 'workout', planName: string) {
    const planLabel = planType === 'diet' ? 'piano alimentare' : 'piano di allenamento';
    return this.createNotification(
      userId,
      'Nuovo Piano Disponibile',
      `Il tuo ${planLabel} "${planName}" è ora disponibile!`,
      'plan',
      planType === 'diet' ? '/diet' : '/workout',
      { plan_type: planType, plan_name: planName }
    );
  }

  async notifyMissionCompleted(userId: string, missionTitle: string, tokensAwarded: number) {
    return this.createNotification(
      userId,
      'Missione Completata',
      `Hai completato "${missionTitle}" e guadagnato ${tokensAwarded} tokens! 🏆`,
      'mission',
      '/missions',
      { mission_title: missionTitle, tokens_awarded: tokensAwarded }
    );
  }

  async notifyTokensAwarded(userId: string, amount: number, reason: string) {
    return this.createNotification(
      userId,
      'Tokens Guadagnati',
      `Hai guadagnato ${amount} tokens per: ${reason}`,
      'token',
      '/missions',
      { tokens_awarded: amount, reason }
    );
  }

  async notifySharedData(userId: string, professionalName: string, dataType: string) {
    return this.createNotification(
      userId,
      'Nuovi Dati Condivisi',
      `${professionalName} ha condiviso con te nuovi dati: ${dataType}`,
      'info',
      '/shared-data',
      { professional_name: professionalName, data_type: dataType }
    );
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
