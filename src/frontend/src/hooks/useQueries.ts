import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Book, Message } from "../backend";
import { useActor } from "./useActor";

// PaymentRequest type (new backend feature, defined locally until backend.ts is regenerated)
export interface PaymentRequest {
  userPrincipal: Principal;
  username: string;
  inviteCode: string;
  submittedAt: bigint;
  status:
    | { __kind__: "pending" }
    | { __kind__: "approved" }
    | { __kind__: "rejected" };
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBooks() {
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ["allBooks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserMessages(userId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserMessages(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetFriendsCount(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["friendsCount", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return 0n;
      return actor.getFriendsCount(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetPendingFriendRequests(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["pendingFriendRequests", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getPendingFriendRequests(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetPendingPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentRequest[]>({
    queryKey: ["pendingPayments"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPendingPayments() as Promise<PaymentRequest[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitPaymentRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      inviteCode,
    }: { username: string; inviteCode: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).submitPaymentRequest(
        username,
        inviteCode,
      ) as Promise<void>;
    },
  });
}

export function useRegisterWithAccessCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      code,
    }: { username: string; code: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).registerWithAccessCode(
        username,
        code,
      ) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useAdminGenerateFreeCode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).adminGenerateFreeCode() as Promise<string>;
    },
  });
}

export function useApprovePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).approvePayment(userPrincipal) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingPayments"] });
    },
  });
}

export function useRejectPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).rejectPayment(userPrincipal) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingPayments"] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      receiver,
      content,
    }: { receiver: Principal; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendMessage(receiver, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (receiver: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendFriendRequest(receiver);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sender: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.acceptFriendRequest(sender);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingFriendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friendsCount"] });
    },
  });
}

export function useBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.banUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useUnbanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unbanUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBooks"] });
    },
  });
}

export function useCreateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (book: Book) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createBook(book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBooks"] });
    },
  });
}

export function useMarkUserAsPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markUserAsPaid(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
