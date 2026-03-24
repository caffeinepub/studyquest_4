import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface GroupMessage {
    id: bigint;
    content: string;
    sender: Principal;
    groupId: GroupId;
    timestamp: Time;
}
export type ChallengeId = string;
export interface Book {
    id: BookId;
    title: string;
    blob: ExternalBlob;
    description: string;
    author: string;
    category: string;
}
export interface RegistrationInput {
    username: string;
    inviteCode: InviteCode;
}
export type UserId = Uint8Array;
export type InviteCode = string;
export type GroupId = bigint;
export type MessageId = string;
export interface Message {
    id: MessageId;
    content: string;
    sender: Principal;
    timestamp: Time;
    receiver: Principal;
}
export interface QuizChallenge {
    id: ChallengeId;
    answers: Array<string>;
    winner?: UserId;
    questions: Array<string>;
    challenger: UserId;
    opponent: UserId;
}
export type BookId = string;
export interface PaymentRequest {
    userPrincipal: Principal;
    username: string;
    inviteCode: string;
    submittedAt: Time;
    status: { __kind__: "pending" } | { __kind__: "approved" } | { __kind__: "rejected" };
}
export interface UserProfile {
    status: Variant_active_banned;
    hasPaid: boolean;
    username: string;
    invites: bigint;
    rank: bigint;
    inviteCode: string;
    quizWins: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_active_banned {
    active = "active",
    banned = "banned"
}
export interface backendInterface {
    acceptFriendRequest(sender: Principal): Promise<void>;
    approvePayment(userPrincipal: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    banUser(user: Principal): Promise<void>;
    checkBookAccess(user: Principal): Promise<boolean>;
    claimAdminWithPin(username: string, pin: string): Promise<boolean>;
    createBook(book: Book): Promise<void>;
    createUserProfile(username: string): Promise<void>;
    deleteBook(bookId: string): Promise<void>;
    getAllBooks(): Promise<Array<Book>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getBook(bookId: string): Promise<Book>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFriendsCount(user: Principal): Promise<bigint>;
    getGroupMessages(groupId: GroupId): Promise<Array<GroupMessage>>;
    getHighestScoredChallenge(): Promise<QuizChallenge | null>;
    getLeaderboard(): Promise<Array<UserProfile>>;
    getPendingFriendRequests(user: Principal): Promise<Array<Principal>>;
    getPendingPayments(): Promise<Array<PaymentRequest>>;
    getSentFriendRequests(user: Principal): Promise<Array<Principal>>;
    getUserMessages(userId: Principal): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    markUserAsPaid(user: Principal): Promise<void>;
    registerWithInvite(input: RegistrationInput): Promise<void>;
    rejectPayment(userPrincipal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendFriendRequest(receiver: Principal): Promise<void>;
    sendGroupMessage(message: GroupMessage): Promise<bigint>;
    sendMessage(receiver: Principal, content: string): Promise<void>;
    submitPaymentRequest(username: string, inviteCode: string): Promise<void>;
    unbanUser(user: Principal): Promise<void>;
}
