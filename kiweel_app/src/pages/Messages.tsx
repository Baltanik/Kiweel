import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading } = useMessages();

  if (!user) {
    return (
      <MobileLayout>
        <div className="min-h-screen">
          <div className="sticky top-0 z-40 bg-background border-b border-border p-4">
            <h1 className="text-2xl font-bold">Messaggi</h1>
          </div>
          <div className="p-4">
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Accedi per vedere i tuoi messaggi</p>
            </Card>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen">
        <div className="sticky top-0 z-40 bg-background border-b border-border p-4">
          <h1 className="text-2xl font-bold">Messaggi</h1>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessun messaggio</p>
              <p className="text-sm text-muted-foreground mt-2">
                Inizia una conversazione con un professionista
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.userId}
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => navigate(`/chat/${conv.userId}`)}
                >
                  <div className="flex gap-3">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={conv.userAvatar || undefined} />
                      <AvatarFallback>
                        {conv.userName[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{conv.userName}</h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(conv.lastMessageTime), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 flex-shrink-0">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
