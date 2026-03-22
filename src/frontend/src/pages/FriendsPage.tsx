import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { Check, Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RankBadge, calcRank } from "../components/RankBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptFriendRequest,
  useGetAllUsers,
  useGetPendingFriendRequests,
  useSendFriendRequest,
} from "../hooks/useQueries";

export default function FriendsPage() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal() ?? null;
  const { data: allUsers, isLoading: usersLoading } = useGetAllUsers();
  const { data: pending, isLoading: pendingLoading } =
    useGetPendingFriendRequests(myPrincipal);
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const [search, setSearch] = useState("");

  const myId = myPrincipal?.toString();
  const otherUsers = (allUsers ?? []).filter((u) => {
    const id = (u as any).principal?.toString?.() ?? "";
    return id !== myId;
  });
  const filtered = otherUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Friends</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect with fellow students
        </p>
      </div>

      <Tabs defaultValue="find">
        <TabsList data-ocid="friends.tab">
          <TabsTrigger value="find">Find Members</TabsTrigger>
          <TabsTrigger value="pending">
            Pending{" "}
            {pending && pending.length > 0 && (
              <Badge className="ml-1.5 h-5 min-w-5 text-xs">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="friends.search_input"
            />
          </div>
          {usersLoading ? (
            <div className="space-y-3" data-ocid="friends.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12" data-ocid="friends.empty_state">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((user) => {
                const rank = calcRank(user.invites, user.quizWins);
                return (
                  <Card
                    key={user.username}
                    className="shadow-xs"
                    data-ocid="friends.item.1"
                  >
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.username}
                        </p>
                        <RankBadge rank={rank} size="sm" />
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const principal = (user as any)
                              .principal as Principal;
                            if (!principal) return;
                            sendRequest.mutate(principal, {
                              onSuccess: () =>
                                toast.success(
                                  `Friend request sent to ${user.username}`,
                                ),
                              onError: (e: any) => toast.error(e.message),
                            });
                          }}
                          data-ocid="friends.button.1"
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          {pendingLoading ? (
            <div className="space-y-3" data-ocid="friends.loading_state">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !pending || pending.length === 0 ? (
            <div className="text-center py-12" data-ocid="friends.empty_state">
              <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((sender) => (
                <Card key={sender.toString()} data-ocid="friends.item.1">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {sender.toString().slice(0, 4)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm font-mono truncate">
                        {sender.toString().slice(0, 20)}...
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        acceptRequest.mutate(sender, {
                          onSuccess: () =>
                            toast.success("Friend request accepted!"),
                          onError: (e: any) => toast.error(e.message),
                        })
                      }
                      data-ocid="friends.confirm_button.1"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Accept
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
