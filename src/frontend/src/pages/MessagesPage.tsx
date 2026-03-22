import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { MessageSquare, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllUsers,
  useGetUserMessages,
  useSendMessage,
} from "../hooks/useQueries";

export default function MessagesPage() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const { data: allUsers, isLoading: usersLoading } = useGetAllUsers();
  const [selectedUser, setSelectedUser] = useState<{
    username: string;
    principal: Principal;
  } | null>(null);
  const {
    data: messages,
    isLoading: msgsLoading,
    refetch,
  } = useGetUserMessages(myPrincipal ?? null);
  const sendMessage = useSendMessage();
  const [content, setContent] = useState("");

  const otherUsers = (allUsers ?? []).filter((u) => {
    const p = (u as any).principal as Principal | undefined;
    return p?.toString() !== myPrincipal?.toString();
  });

  const thread = selectedUser
    ? (messages ?? [])
        .filter((m) => {
          const sender = m.sender.toString();
          const receiver = m.receiver.toString();
          const myId = myPrincipal?.toString();
          const otherId = selectedUser.principal.toString();
          return (
            (sender === myId && receiver === otherId) ||
            (sender === otherId && receiver === myId)
          );
        })
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
    : [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser) return;
    await sendMessage.mutateAsync(
      { receiver: selectedUser.principal, content: content.trim() },
      {
        onSuccess: () => {
          setContent("");
          refetch();
        },
        onError: (err: any) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Messages</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          data-ocid="messages.button"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(600px-52px)]">
            {usersLoading ? (
              <div className="p-3 space-y-2" data-ocid="messages.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : otherUsers.length === 0 ? (
              <div className="p-4 text-center" data-ocid="messages.empty_state">
                <p className="text-sm text-muted-foreground">No members yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {otherUsers.map((user) => {
                  const principal = (user as any).principal as Principal;
                  const isSelected =
                    selectedUser?.principal.toString() ===
                    principal?.toString();
                  return (
                    <button
                      type="button"
                      key={user.username}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                      onClick={() =>
                        setSelectedUser({ username: user.username, principal })
                      }
                      data-ocid="messages.item.1"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback
                          className={`text-xs font-bold ${isSelected ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}
                        >
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">
                        {user.username}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 shadow-card flex flex-col overflow-hidden">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageSquare className="h-12 w-12" />
              <p className="text-sm">Select a member to start messaging</p>
            </div>
          ) : (
            <>
              <CardHeader className="py-3 px-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                      {selectedUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-sm">
                    {selectedUser.username}
                  </CardTitle>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                {msgsLoading ? (
                  <div className="space-y-2" data-ocid="messages.loading_state">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : thread.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-full gap-2 py-10"
                    data-ocid="messages.empty_state"
                  >
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {thread.map((msg) => {
                      const isMine =
                        msg.sender.toString() === myPrincipal?.toString();
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          data-ocid="messages.item.1"
                        >
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-secondary text-secondary-foreground rounded-bl-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-border flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1"
                  data-ocid="messages.input"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendMessage.isPending || !content.trim()}
                  data-ocid="messages.submit_button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
