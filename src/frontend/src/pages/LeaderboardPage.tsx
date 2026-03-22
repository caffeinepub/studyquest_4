import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import { RankBadge, calcRank } from "../components/RankBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetLeaderboard } from "../hooks/useQueries";

const SAMPLE_LEADERS = [
  { username: "Aryan_Scholar", invites: 12n, quizWins: 8n, rank: 7n },
  { username: "PriyaStudies", invites: 9n, quizWins: 11n, rank: 6n },
  { username: "Vikram_Pro", invites: 7n, quizWins: 6n, rank: 5n },
  { username: "MeenaQuiz", invites: 5n, quizWins: 7n, rank: 4n },
  { username: "RajanMaster", invites: 4n, quizWins: 5n, rank: 4n },
  { username: "AnanyaKnows", invites: 3n, quizWins: 4n, rank: 3n },
  { username: "RohitThinker", invites: 2n, quizWins: 3n, rank: 2n },
  { username: "SitaLearns", invites: 1n, quizWins: 2n, rank: 1n },
];

export default function LeaderboardPage() {
  const { data: users, isLoading } = useGetLeaderboard();
  const { identity } = useInternetIdentity();
  const myId = identity?.getPrincipal().toString();

  const displayUsers =
    users && users.length > 0 ? users.slice(0, 20) : SAMPLE_LEADERS;

  const medalColor = (i: number) => {
    if (i === 0) return "text-amber-500";
    if (i === 1) return "text-slate-400";
    if (i === 2) return "text-amber-700";
    return "text-muted-foreground";
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center">
        <Trophy className="h-10 w-10 text-accent mx-auto mb-3" />
        <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top students ranked by invites and quiz wins
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="leaderboard.loading_state">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-2">
          {displayUsers.map((user, i) => {
            const rank = calcRank(user.invites, user.quizWins);
            const isMe = (user as any).principal?.toString?.() === myId;
            return (
              <motion.div
                key={user.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                data-ocid="leaderboard.item.1"
              >
                <Card
                  className={`shadow-xs transition-all ${isMe ? "border-primary ring-1 ring-primary" : ""} ${i < 3 ? "shadow-card" : ""}`}
                >
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <span
                      className={`text-xl font-bold w-8 text-center ${medalColor(i)}`}
                    >
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                    </span>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user.username} {isMe && "(You)"}
                      </p>
                      <RankBadge rank={rank} size="sm" />
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {Number(user.invites) + Number(user.quizWins)} pts
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.invites.toString()} invites ·{" "}
                        {user.quizWins.toString()} wins
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
