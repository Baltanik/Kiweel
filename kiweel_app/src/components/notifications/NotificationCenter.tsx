import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  FileText,
  Trophy,
  Coins,
  Info,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Notification } from "@/integrations/notifications/notificationService";

export function NotificationCenter() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'plan': return FileText;
      case 'mission': return Trophy;
      case 'token': return Coins;
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-600 bg-blue-50';
      case 'plan': return 'text-green-600 bg-green-50';
      case 'mission': return 'text-purple-600 bg-purple-50';
      case 'token': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifiche
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} nuove
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Segna tutte lette
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">Caricamento notifiche...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Nessuna notifica
              </h3>
              <p className="text-xs text-gray-500">
                Le tue notifiche appariranno qui
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Unread notifications */}
              {unreadNotifications.length > 0 && (
                <>
                  <div className="text-xs font-medium text-gray-500 px-2 py-1">
                    Non lette ({unreadNotifications.length})
                  </div>
                  {unreadNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <Card
                        key={notification.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'border-blue-200 bg-blue-50/30' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 mb-1">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {format(new Date(notification.created_at), 'dd MMM HH:mm', { locale: it })}
                                  </p>
                                </div>
                                <div className="flex space-x-1 ml-2">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => handleMarkAsRead(e, notification.id)}
                                      title="Segna come letta"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={(e) => handleDelete(e, notification.id)}
                                    title="Elimina"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}

              {/* Read notifications */}
              {readNotifications.length > 0 && (
                <>
                  {unreadNotifications.length > 0 && (
                    <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-4">
                      Lette ({readNotifications.length})
                    </div>
                  )}
                  {readNotifications.slice(0, 10).map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <Card
                        key={notification.id}
                        className="cursor-pointer transition-colors hover:bg-gray-50 opacity-75"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {format(new Date(notification.created_at), 'dd MMM HH:mm', { locale: it })}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 ml-2"
                                  onClick={(e) => handleDelete(e, notification.id)}
                                  title="Elimina"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
