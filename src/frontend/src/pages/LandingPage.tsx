import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Shield, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import { RankBadge } from "../components/RankBadge";

const features = [
  {
    icon: BookOpen,
    title: "Vast Library",
    desc: "Access hundreds of curated academic books and study materials across all subjects.",
  },
  {
    icon: Users,
    title: "Member Network",
    desc: "Join by invite only — connect with peers, send friend requests, and grow your network.",
  },
  {
    icon: Trophy,
    title: "Knowledge Battles",
    desc: "Challenge friends to quiz duels and climb the leaderboard to earn prestige.",
  },
  {
    icon: Shield,
    title: "Safe Community",
    desc: "Strict moderation keeps the platform focused, respectful, and free from spam.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Get Invited",
    desc: "An existing member shares their invite code with you.",
  },
  {
    step: "2",
    title: "Pay ₹20",
    desc: "One-time membership fee processed securely via Stripe.",
  },
  {
    step: "3",
    title: "Unlock Everything",
    desc: "Access the full book library, challenge friends, and climb ranks.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative py-24 md:py-36 bg-gradient-to-br from-primary/90 to-primary">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium border border-accent/30">
              Invite-Only Academic Community
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Where Knowledge
              <br />
              <span className="text-accent">Meets Community</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Join StudyQuest — the elite student platform where you pay once,
              get lifetime access to our book library, and compete in knowledge
              challenges with peers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg font-semibold px-8"
                  data-ocid="hero.primary_button"
                >
                  Join StudyQuest — ₹20 <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 px-8"
                  data-ocid="hero.secondary_button"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              How StudyQuest Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A simple 3-step path to academic excellence.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Card className="text-center shadow-card hover:shadow-card-hover transition-shadow h-full">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Excel
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="h-full shadow-card hover:shadow-card-hover transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-3">
              10 Levels of Prestige
            </h2>
            <p className="text-muted-foreground">
              Earn rank by inviting members and winning quiz challenges.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
              <RankBadge key={r} rank={r} size="lg" />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            You need an invite code from an existing member.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-10"
              data-ocid="cta.primary_button"
            >
              Register with Invite Code
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
