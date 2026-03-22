# StudyQuest

## Current State
Project is freshly scaffolded. Backend is an empty actor. No frontend application code exists.

## Requested Changes (Diff)

### Add
- User registration with unique username and password
- Member invite system: new users can only join when invited by an existing member; inviter gains rank points
- Payment via Stripe (20 INR) required at signup
- 10-level ranking/respect system based on invites sent + knowledge test wins
- Knowledge quiz/test system: members challenge each other, winner gains rank points
- Book library: admins upload books (PDF/files), all paid members can browse and download
- Friend list: members can send/accept friend requests
- Messaging: stored (non-real-time) direct messages and group chats between friends
- Leaderboard showing top-ranked members
- User profiles with avatar, rank level, stats
- Search for members and books
- Book categories and ratings
- Admin dashboard: manage users, ban users, upload books, view reports
- Auto-moderation: flag/ban users who post inappropriate content, links, or 18+ material
- No email notifications, no SMS, no real-time WebSocket chat

### Modify
- N/A (new build)

### Remove
- PhonePe payment (never implemented, use Stripe only)
- SMS/email notifications
- Real-time chat (use stored message polling)

## Implementation Plan
1. Backend: user accounts (username/password hash, invite code, rank, status)
2. Backend: invite system (generate invite code, redeem, track inviter rank)
3. Backend: Stripe payment verification on signup
4. Backend: rank calculation (10 levels) based on invites + quiz wins
5. Backend: quiz challenges (create challenge, submit answers, record result)
6. Backend: book library (upload via blob-storage, categories, search, download)
7. Backend: friend requests and friends list
8. Backend: stored messages (direct and group)
9. Backend: admin functions (ban user, remove content, upload books)
10. Backend: content moderation flags
11. Frontend: landing/signup/login pages
12. Frontend: dashboard with leaderboard, rank display
13. Frontend: book library with categories and search
14. Frontend: quiz challenge UI
15. Frontend: friends and messaging UI (manual refresh, no WebSockets)
16. Frontend: admin dashboard
17. Frontend: profile pages
