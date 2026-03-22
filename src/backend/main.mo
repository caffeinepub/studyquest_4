import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";

actor {
  type UserId = Blob;
  type BookId = Text;
  type InviteCode = Text;
  type MessageId = Text;
  type ChallengeId = Text;

  type Book = {
    id : BookId;
    title : Text;
    author : Text;
    category : Text;
    description : Text;
    blob : Storage.ExternalBlob;
  };

  type UserProfile = {
    username : Text;
    rank : Nat;
    inviteCode : Text;
    invites : Nat;
    quizWins : Nat;
    status : {
      #active;
      #banned;
    };
    hasPaid : Bool;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Nat.compare(profile1.rank, profile2.rank);
    };
  };

  type FriendRequest = {
    from : Principal;
    to : Principal;
    status : {
      #pending;
      #accepted;
      #declined;
    };
  };

  type Message = {
    id : MessageId;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type QuizChallenge = {
    id : ChallengeId;
    challenger : UserId;
    opponent : UserId;
    winner : ?UserId;
    questions : [Text];
    answers : [Text];
  };

  module Challenge {
    public func compareByScore(c1 : QuizChallenge, c2 : QuizChallenge) : Order.Order {
      Int.compare(c1.id.size(), c2.id.size());
    };
  };

  module Message {
    public func compare(m1 : Message, m2 : Message) : Order.Order {
      Int.compare(m1.timestamp, m2.timestamp);
    };
  };

  type GroupId = Nat;
  type GroupInfo = {
    members : Set.Set<Principal>;
    name : Text;
  };

  type GroupMessage = {
    id : Nat;
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
    groupId : GroupId;
  };
  module GroupMessage {
    public func compare(m1 : GroupMessage, m2 : GroupMessage) : Order.Order {
      if (m1.timestamp == m2.timestamp) {
        return Nat.compare(m1.id, m2.id);
      };
      Int.compare(m1.timestamp, m2.timestamp);
    };
  };

  type InvitationStatus = {
    #pending;
    #accepted;
    #declined;
  };

  module Book {
    public func compare(b1 : Book, b2 : Book) : Order.Order {
      Text.compare(b1.title, b2.title);
    };
  };

  type RegistrationInput = {
    username : Text;
    inviteCode : InviteCode;
  };

  let books = Map.empty<BookId, Book>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  //storage
  include MixinStorage();

  // Quizzes
  let quizChallenges = Map.empty<ChallengeId, QuizChallenge>();

  // Direct messaging
  let messages = Map.empty<Principal, [Message]>();

  // Group chats
  let groupInfo = Map.empty<GroupId, GroupInfo>();
  let messagesByGroup = Map.empty<GroupId, [GroupMessage]>();

  // Stripe payment
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Friends
  let friends = Map.empty<Principal, Set.Set<Principal>>();
  let friendRequests = Map.empty<Principal, Set.Set<Principal>>();
  let sentFriendRequests = Map.empty<Principal, Set.Set<Principal>>();

  // Invites
  let invites = Map.empty<Principal, Nat>();

  // Authorization (Before helper functions that use it)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func getFriends(user : Principal) : Set.Set<Principal> {
    switch (friends.get(user)) {
      case (null) { Set.empty<Principal>() };
      case (?friends) { friends };
    };
  };

  func getUserProfileInternal(user : Principal) : UserProfile {
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  func generateInviteCode(caller : Principal) : InviteCode {
    caller.toText();
  };

  func isFriend(user1 : Principal, user2 : Principal) : Bool {
    let friendSet = getFriends((user1));
    friendSet.contains(user2);
  };

  func isUserBanned(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) {
        switch (profile.status) {
          case (#banned) { true };
          case (#active) { false };
        };
      };
    };
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfigurationInternal() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfigurationInternal(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Banned users cannot create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfigurationInternal(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createUserProfile(username : Text) : async () {
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already exists");
    };
    let inviteCode = generateInviteCode(caller);
    let user : UserProfile = {
      username;
      rank = 1;
      inviteCode;
      invites = 0;
      quizWins = 0;
      status = #active;
      hasPaid = false;
    };
    userProfiles.add(caller, user);
    invites.add(caller, 0);
  };

  public query ({ caller }) func getFriendsCount(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friend count");
    };
    let friendSet = getFriends(user);
    friendSet.size();
  };

  public query ({ caller }) func getPendingFriendRequests(user : Principal) : async [Principal] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friend requests");
    };
    switch (friendRequests.get(user)) {
      case (null) { [] };
      case (?requests) { requests.toArray() };
    };
  };

  public query ({ caller }) func getSentFriendRequests(user : Principal) : async [Principal] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own sent requests");
    };
    switch (sentFriendRequests.get(user)) {
      case (null) { [] };
      case (?requests) { requests.toArray() };
    };
  };

  public shared ({ caller }) func registerWithInvite(input : RegistrationInput) : async () {
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already exists");
    };

    var inviterPrincipal : ?Principal = null;
    for ((principal, profile) in userProfiles.entries()) {
      if (profile.inviteCode == input.inviteCode) {
        inviterPrincipal := ?principal;
      };
    };

    switch (inviterPrincipal) {
      case (?inviter) {
        let inviteCode = generateInviteCode(caller);
        let newUser : UserProfile = {
          username = input.username;
          rank = 1;
          inviteCode;
          invites = 0;
          quizWins = 0;
          status = #active;
          hasPaid = false;
        };
        userProfiles.add(caller, newUser);

        // Increment inviter's invite count
        let inviterProfile = getUserProfileInternal(inviter);
        let updatedInviterProfile : UserProfile = {
          username = inviterProfile.username;
          rank = inviterProfile.rank;
          inviteCode = inviterProfile.inviteCode;
          invites = inviterProfile.invites + 1;
          quizWins = inviterProfile.quizWins;
          status = inviterProfile.status;
          hasPaid = inviterProfile.hasPaid;
        };
        userProfiles.add(inviter, updatedInviterProfile);
      };
      case (null) { Runtime.trap("Invalid invite code") };
    };
  };

  public shared ({ caller }) func sendFriendRequest(receiver : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Banned users cannot send friend requests");
    };
    let sender = caller;

    // Check if sender is not already friends with receiver
    if (isFriend(sender, receiver)) {
      Runtime.trap("You are already friends with this user");
    };

    // Add pending request to receiver's list
    let receiverRequests = switch (friendRequests.get(receiver)) {
      case (null) { Set.empty<Principal>() };
      case (?requests) { requests };
    };
    receiverRequests.add(sender);
    friendRequests.add(receiver, receiverRequests);

    // Add to sender's sent requests for tracking
    let senderRequests = switch (sentFriendRequests.get(sender)) {
      case (null) { Set.empty<Principal>() };
      case (?requests) { requests };
    };
    senderRequests.add(receiver);
    sentFriendRequests.add(sender, senderRequests);
  };

  public shared ({ caller }) func acceptFriendRequest(sender : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Banned users cannot accept friend requests");
    };
    let receiver = caller;
    switch (friendRequests.get(receiver)) {
      case (null) { Runtime.trap("Cannot accept friend request. No friend request from this user!") };
      case (?requests) {
        if (not requests.contains(sender)) {
          Runtime.trap("Cannot accept friend request. No friend request from this user!");
        };
        requests.remove(sender);
      };
    };

    switch (sentFriendRequests.get(sender)) {
      case (null) { Runtime.trap("Sent friend request not found in sender's record!") };
      case (?requests) {
        if (not requests.contains(receiver)) {
          Runtime.trap("Sent friend request not found in sender's record!");
        };
        requests.remove(receiver);
      };
    };

    // Add each other to friends list
    let receiverFriends = switch (friends.get(receiver)) {
      case (null) { Set.empty<Principal>() };
      case (?f) { f };
    };
    receiverFriends.add(sender);
    friends.add(receiver, receiverFriends);

    let senderFriends = switch (friends.get(sender)) {
      case (null) { Set.empty<Principal>() };
      case (?f) { f };
    };
    senderFriends.add(receiver);
    friends.add(sender, senderFriends);
  };

  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Banned users cannot send messages");
    };
    let sender = caller;
    let message : Message = {
      id = sender.toText() # "_" # receiver.toText() # "_" # content;
      sender;
      receiver;
      content;
      timestamp = Time.now();
    };
    if (receiver == caller) {
      Runtime.trap("Cannot send message to yourself");
    };
    let senderInReceiverFriends = isFriend(receiver, sender);
    if (not senderInReceiverFriends) {
      Runtime.trap("This user is not your friend. Message not sent.");
    };

    // Retrieve existing messages or create empty list
    let receiverMessages = switch (messages.get(receiver)) {
      case (null) { [] };
      case (?messages) { messages };
    };
    // Add message to existing messages
    messages.add(receiver, receiverMessages.concat([message]));
  };

  public shared ({ caller }) func sendGroupMessage(message : GroupMessage) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send group messages");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Banned users cannot send group messages");
    };
    if (message.sender != caller) {
      Runtime.trap("Cannot send message as another user");
    };

    switch (groupInfo.get(message.groupId)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?group) {
        if (not group.members.contains(caller)) {
          Runtime.trap("User is not a member of this group");
        };
        let groupMessages = switch (messagesByGroup.get(message.groupId)) {
          case (null) { [] };
          case (?messages) { messages };
        };
        messagesByGroup.add(message.groupId, groupMessages.concat([message]));
      };
    };
    messagesByGroup.keys().toArray().size();
  };

  public shared ({ caller }) func deleteBook(bookId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    books.remove(bookId);
  };

  public shared query ({ caller }) func getGroupMessages(groupId : GroupId) : async [GroupMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view group messages");
    };
    switch (groupInfo.get(groupId)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?group) {
        if (not group.members.contains(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only group members can view messages");
        };
        switch (messagesByGroup.get(groupId)) {
          case (null) { [] };
          case (?messages) { messages.sort().reverse() };
        };
      };
    };
  };

  public query ({ caller }) func getUserMessages(userId : Principal) : async [Message] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own messages");
    };
    switch (messages.get(userId)) {
      case (null) { [] };
      case (?userMessages) {
        userMessages.sort();
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    getUserProfileInternal(user);
  };

  public query ({ caller }) func getBook(bookId : Text) : async Book {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view books");
    };
    let userProfile = getUserProfileInternal(caller);
    if (not userProfile.hasPaid and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only paid members can access books");
    };
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  public shared ({ caller }) func createBook(book : Book) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    books.add(book.id, book);
  };

  public query ({ caller }) func getLeaderboard() : async [UserProfile] {
    userProfiles.values().toArray().sort();
  };

  public query ({ caller }) func getHighestScoredChallenge() : async ?QuizChallenge {
    switch (quizChallenges.entries().next()) {
      case (null) { null };
      case (?_firstChallenge) {
        let sortedChallenges = quizChallenges.values().toArray().sort(Challenge.compareByScore);
        if (sortedChallenges.size() == 0) {
          null;
        } else {
          ?sortedChallenges[sortedChallenges.size() - 1];
        };
      };
    };
  };

  public query ({ caller }) func getAllBooks() : async [Book] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view books");
    };
    let userProfile = getUserProfileInternal(caller);
    if (not userProfile.hasPaid and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only paid members can access books");
    };
    books.values().toArray().sort();
  };

  public query ({ caller }) func checkBookAccess(user : Principal) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own book access");
    };
    getUserProfileInternal(user).hasPaid;
  };

  public shared ({ caller }) func banUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let userProfile = getUserProfileInternal(user);
    let updatedProfile : UserProfile = {
      username = userProfile.username;
      rank = userProfile.rank;
      inviteCode = userProfile.inviteCode;
      invites = userProfile.invites;
      quizWins = userProfile.quizWins;
      status = #banned;
      hasPaid = userProfile.hasPaid;
    };
    userProfiles.add(user, updatedProfile);
  };

  public shared ({ caller }) func unbanUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let userProfile = getUserProfileInternal(user);
    let updatedProfile : UserProfile = {
      username = userProfile.username;
      rank = userProfile.rank;
      inviteCode = userProfile.inviteCode;
      invites = userProfile.invites;
      quizWins = userProfile.quizWins;
      status = #active;
      hasPaid = userProfile.hasPaid;
    };
    userProfiles.add(user, updatedProfile);
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    userProfiles.values().toArray();
  };

  public shared ({ caller }) func markUserAsPaid(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let userProfile = getUserProfileInternal(user);
    let updatedProfile : UserProfile = {
      username = userProfile.username;
      rank = userProfile.rank;
      inviteCode = userProfile.inviteCode;
      invites = userProfile.invites;
      quizWins = userProfile.quizWins;
      status = userProfile.status;
      hasPaid = true;
    };
    userProfiles.add(user, updatedProfile);
  };
};
