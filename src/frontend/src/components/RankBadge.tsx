import { Badge } from "@/components/ui/badge";

const RANK_NAMES = [
  "",
  "Novice",
  "Apprentice",
  "Scholar",
  "Thinker",
  "Sage",
  "Expert",
  "Master",
  "Champion",
  "Legend",
  "Grandmaster",
];

const RANK_COLORS: Record<number, string> = {
  1: "bg-slate-200 text-slate-700",
  2: "bg-green-100 text-green-800",
  3: "bg-teal-100 text-teal-800",
  4: "bg-blue-100 text-blue-800",
  5: "bg-indigo-100 text-indigo-800",
  6: "bg-violet-100 text-violet-800",
  7: "bg-purple-100 text-purple-800",
  8: "bg-orange-100 text-orange-800",
  9: "bg-rose-100 text-rose-800",
  10: "bg-amber-300 text-amber-900 font-bold",
};

export function calcRank(invites: bigint, quizWins: bigint): number {
  return Math.min(10, Math.floor((Number(invites) + Number(quizWins)) / 3) + 1);
}

export function RankBadge({
  rank,
  size = "default",
}: { rank: number; size?: "sm" | "default" | "lg" }) {
  const colorClass = RANK_COLORS[rank] ?? RANK_COLORS[1];
  const name = RANK_NAMES[rank] ?? "Novice";
  const sizeClass =
    size === "lg"
      ? "text-base px-3 py-1"
      : size === "sm"
        ? "text-xs px-1.5 py-0.5"
        : "";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${sizeClass}`}
      style={{
        padding:
          size === "lg" ? "4px 12px" : size === "sm" ? "2px 8px" : "2px 10px",
      }}
    >
      <span>Lv.{rank}</span>
      <span>{name}</span>
    </span>
  );
}
