import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  Copy,
  MessageSquare,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { RankBadge, calcRank } from "../components/RankBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetFriendsCount,
  useIsCallerAdmin,
} from "../hooks/useQueries";

const STATS_CONFIG = [
  { key: "rank", label: "Rank Level", sub: "out of 10" },
  { key: "invites", label: "Invites Sent", sub: "members invited" },
  { key: "quizWins", label: "Quiz Wins", sub: "challenges won" },
  { key: "friends", label: "Friends", sub: "connections" },
] as const;

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: friendsCount } = useGetFriendsCount(
    identity?.getPrincipal() ?? null,
  );
  const [copied, setCopied] = useState(false);

  if (!identity) {
    navigate({ to: "/login" });
    return null;
  }

  if (isLoading) {
    return (
      <div
        className="container py-10 space-y-4"
        data-ocid="dashboard.loading_state"
      >
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    if (isAdmin) {
      return (
        <div
          className="container py-20 text-center"
          data-ocid="dashboard.panel"
        >
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">
            Welcome, Admin!
          </h2>
          <p className="text-muted-foreground mb-6">
            You don't need a membership to access the admin panel.
          </p>
          <Button
            onClick={() => navigate({ to: "/admin" })}
            data-ocid="dashboard.primary_button"
          >
            <Shield className="h-4 w-4 mr-2" />
            Go to Admin Panel
          </Button>
        </div>
      );
    }
    return (
      <div className="container py-10 text-center">
        <p className="text-muted-foreground">
          Profile not found. Please register first.
        </p>
        <Link to="/register">
          <Button className="mt-4">Register</Button>
        </Link>
      </div>
    );
  }

  if (profile.status === "banned") {
    return (
      <div
        className="container py-20 text-center"
        data-ocid="dashboard.error_state"
      >
        <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-destructive mb-2">
          Account Banned
        </h2>
        <p className="text-muted-foreground">
          Your account has been banned for violating community guidelines.
        </p>
      </div>
    );
  }

  const rank = calcRank(profile.invites, profile.quizWins);
  const rankProgress =
    (((Number(profile.invites) + Number(profile.quizWins)) % 3) / 3) * 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.inviteCode);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const statValues: Record<string, string | number> = {
    rank,
    invites: profile.invites.toString(),
    quizWins: profile.quizWins.toString(),
    friends: friendsCount?.toString() ?? "0",
  };

  const quickLinks = [
    { to: "/books", icon: BookOpen, label: "Books", desc: "Browse library" },
    {
      to: "/friends",
      icon: Users,
      label: "Friends",
      desc: `${friendsCount ?? 0} friends`,
    },
    {
      to: "/messages",
      icon: MessageSquare,
      label: "Messages",
      desc: "Check inbox",
    },
    {
      to: "/leaderboard",
      icon: Trophy,
      label: "Leaderboard",
      desc: "View rankings",
    },
  ];

  return (
    <div className="container py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-card overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-accent" />
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold mb-1">
                  Welcome, {profile.username}!
                </h1>
                <RankBadge rank={rank} size="lg" />
              </div>
              <div className="w-full sm:w-48">
                <p className="text-xs text-muted-foreground mb-1">
                  Progress to next rank
                </p>
                <Progress value={rankProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(rankProgress)}% to level {Math.min(10, rank + 1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS_CONFIG.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
          >
            <Card className="shadow-card text-center">
              <CardContent className="pt-5 pb-4">
                <p className="text-2xl font-bold text-primary">
                  {statValues[stat.key]}
                </p>
                <p className="text-sm font-medium mt-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Your Invite Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-secondary rounded-md px-4 py-3 text-lg font-mono font-bold tracking-widest text-center">
              {profile.inviteCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              data-ocid="dashboard.toggle"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this code with friends to invite them. You earn rank points
            for each person who joins!
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map(({ to, icon: Icon, label, desc }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
          >
            <Link to={to} data-ocid="dashboard.link">
              <Card className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="pt-5 pb-5 text-center">
                  <Icon className="h-7 w-7 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
