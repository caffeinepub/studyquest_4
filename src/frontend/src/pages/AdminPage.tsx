import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Ban,
  CheckCircle2,
  Loader2,
  LogOut,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RankBadge, calcRank } from "../components/RankBadge";
import {
  useAdminGenerateFreeCode,
  useApprovePayment,
  useBanUser,
  useDeleteBook,
  useGetAllBooks,
  useGetAllUsers,
  useGetPendingPayments,
  useRejectPayment,
  useUnbanUser,
} from "../hooks/useQueries";

export default function AdminPage() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("adminLoggedIn") === "true";
  const { data: users, isLoading: usersLoading } = useGetAllUsers();
  const { data: books, isLoading: booksLoading } = useGetAllBooks();
  const { data: pendingPayments, isLoading: paymentsLoading } =
    useGetPendingPayments();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteBook = useDeleteBook();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const generateFreeCode = useAdminGenerateFreeCode();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

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
        <Button
          className="mt-6"
          onClick={() => navigate({ to: "/admin-login" })}
        >
          Go to Admin Login
        </Button>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate({ to: "/admin-login" });
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-ocid="admin.secondary_button"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="payments">
        <TabsList data-ocid="admin.tab">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="add-member">Add Member</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">
                Pending Payment Requests ({pendingPayments?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {paymentsLoading ? (
                <div className="p-4 space-y-2" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : !pendingPayments || pendingPayments.length === 0 ? (
                <div className="p-8 text-center" data-ocid="admin.empty_state">
                  <p className="text-muted-foreground">
                    No pending payment requests
                  </p>
                </div>
              ) : (
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Invite Code</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map((req, idx) => {
                      const submittedDate = new Date(
                        Number(req.submittedAt / 1_000_000n),
                      ).toLocaleString();
                      const isPending = req.status.__kind__ === "pending";
                      return (
                        <TableRow
                          key={req.userPrincipal.toString()}
                          data-ocid={`admin.row.${idx + 1}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                  {req.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {req.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {req.inviteCode}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {submittedDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status.__kind__ === "approved"
                                  ? "default"
                                  : req.status.__kind__ === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {req.status.__kind__}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isPending && (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() =>
                                    approvePayment.mutate(
                                      req.userPrincipal as Principal,
                                      {
                                        onSuccess: () =>
                                          toast.success(
                                            `${req.username} approved`,
                                          ),
                                        onError: (e: any) =>
                                          toast.error(e.message),
                                      },
                                    )
                                  }
                                  disabled={approvePayment.isPending}
                                  data-ocid={`admin.button.${idx + 1}`}
                                >
                                  {approvePayment.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    rejectPayment.mutate(
                                      req.userPrincipal as Principal,
                                      {
                                        onSuccess: () =>
                                          toast.success(
                                            `${req.username} rejected`,
                                          ),
                                        onError: (e: any) =>
                                          toast.error(e.message),
                                      },
                                    )
                                  }
                                  disabled={rejectPayment.isPending}
                                  data-ocid={`admin.delete_button.${idx + 1}`}
                                >
                                  {rejectPayment.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            )}
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
                    {users.map((user, idx) => {
                      const rank = calcRank(user.invites, user.quizWins);
                      const principal = (user as any).principal as
                        | Principal
                        | undefined;
                      const isBanned = user.status === "banned";
                      return (
                        <TableRow
                          key={user.username}
                          data-ocid={`admin.row.${idx + 1}`}
                        >
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
                                  data-ocid={`admin.button.${idx + 1}`}
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
                                  data-ocid={`admin.delete_button.${idx + 1}`}
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
                    {books.map((book, idx) => (
                      <TableRow
                        key={book.id}
                        data-ocid={`admin.row.${idx + 1}`}
                      >
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
                            data-ocid={`admin.delete_button.${idx + 1}`}
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

        <TabsContent value="add-member" className="mt-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Add Member for Free</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a one-time access code. Share it with the person — they
                use it on the Join page to register instantly without payment.
              </p>
              <Button
                onClick={async () => {
                  try {
                    const code = await generateFreeCode.mutateAsync();
                    setGeneratedCode(code);
                  } catch (e: any) {
                    toast.error(e?.message ?? "Failed to generate code");
                  }
                }}
                disabled={generateFreeCode.isPending}
                data-ocid="admin.generate_code_button"
              >
                {generateFreeCode.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Generating...
                  </>
                ) : (
                  "Generate Free Access Code"
                )}
              </Button>
              {generatedCode && (
                <div className="p-4 rounded-lg bg-muted border border-border space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Share this code with the new member:
                  </p>
                  <p className="font-mono font-bold text-lg tracking-widest text-foreground select-all">
                    {generatedCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This code can only be used once. The person should go to the
                    Join page and use the access code option.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      toast.success("Code copied!");
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
