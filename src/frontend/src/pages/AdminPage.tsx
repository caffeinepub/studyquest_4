import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CreditCard,
  Loader2,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RankBadge, calcRank } from "../components/RankBadge";
import {
  useBanUser,
  useDeleteBook,
  useGetAllBooks,
  useGetAllUsers,
  useIsCallerAdmin,
  useIsStripeConfigured,
  useSetStripeConfiguration,
  useUnbanUser,
} from "../hooks/useQueries";

export default function AdminPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: users, isLoading: usersLoading } = useGetAllUsers();
  const { data: books, isLoading: booksLoading } = useGetAllBooks();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteBook = useDeleteBook();
  const setStripeConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState("");
  const [allowedCountries, setAllowedCountries] = useState("IN");

  if (adminLoading) {
    return (
      <div className="container py-10" data-ocid="admin.loading_state">
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="container py-20 text-center"
        data-ocid="admin.error_state"
      >
        <Shield className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <Button className="mt-6" onClick={() => navigate({ to: "/dashboard" })}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const handleStripeConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error("Secret key is required");
      return;
    }
    const countries = allowedCountries
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    await setStripeConfig.mutateAsync(
      { secretKey: secretKey.trim(), allowedCountries: countries },
      {
        onSuccess: () => toast.success("Stripe configured!"),
        onError: (e: any) => toast.error(e.message),
      },
    );
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="users">
        <TabsList data-ocid="admin.tab">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">
                All Members ({users?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-4 space-y-2" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : !users || users.length === 0 ? (
                <div className="p-8 text-center" data-ocid="admin.empty_state">
                  <p className="text-muted-foreground">No users yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const rank = calcRank(user.invites, user.quizWins);
                      const principal = (user as any).principal as
                        | Principal
                        | undefined;
                      const isBanned = user.status === "banned";
                      return (
                        <TableRow key={user.username} data-ocid="admin.row.1">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                  {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {user.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <RankBadge rank={rank} size="sm" />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isBanned ? "destructive" : "secondary"}
                            >
                              {isBanned ? "Banned" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.hasPaid ? "default" : "outline"}
                            >
                              {user.hasPaid ? "Paid" : "Unpaid"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {principal &&
                              (isBanned ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    unbanUser.mutate(principal, {
                                      onSuccess: () =>
                                        toast.success(
                                          `${user.username} unbanned`,
                                        ),
                                      onError: (e: any) =>
                                        toast.error(e.message),
                                    })
                                  }
                                  data-ocid="admin.button.1"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Unban
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    banUser.mutate(principal, {
                                      onSuccess: () =>
                                        toast.success(
                                          `${user.username} banned`,
                                        ),
                                      onError: (e: any) =>
                                        toast.error(e.message),
                                    })
                                  }
                                  data-ocid="admin.delete_button.1"
                                >
                                  <Ban className="h-3.5 w-3.5 mr-1" />
                                  Ban
                                </Button>
                              ))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books" className="mt-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">
                All Books ({books?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {booksLoading ? (
                <div className="p-4 space-y-2" data-ocid="admin.loading_state">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : !books || books.length === 0 ? (
                <div className="p-8 text-center" data-ocid="admin.empty_state">
                  <p className="text-muted-foreground">No books uploaded yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id} data-ocid="admin.row.1">
                        <TableCell className="font-medium text-sm">
                          {book.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {book.author}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{book.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              deleteBook.mutate(book.id, {
                                onSuccess: () =>
                                  toast.success(`"${book.title}" deleted`),
                                onError: (e: any) => toast.error(e.message),
                              })
                            }
                            data-ocid="admin.delete_button.1"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="mt-4">
          <Card className="shadow-card max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5" />
                Stripe Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stripeConfigured && (
                <div className="flex items-center gap-2 mb-4 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Stripe is configured and active
                </div>
              )}
              {!stripeConfigured && (
                <div className="flex items-center gap-2 mb-4 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-4 w-4" />
                  Stripe is not yet configured. Set it up to accept payments.
                </div>
              )}
              <form onSubmit={handleStripeConfig} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Stripe Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="sk_live_..."
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countries">
                    Allowed Countries (comma-separated)
                  </Label>
                  <Input
                    id="countries"
                    placeholder="IN, US, GB"
                    value={allowedCountries}
                    onChange={(e) => setAllowedCountries(e.target.value)}
                    data-ocid="admin.input"
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g., IN for India only, or IN,US,GB for multiple
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={setStripeConfig.isPending}
                  data-ocid="admin.submit_button"
                >
                  {setStripeConfig.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
