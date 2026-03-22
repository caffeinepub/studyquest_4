import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { BookOpen, CreditCard, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCheckoutSession } from "../hooks/useQueries";

export default function RegisterPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const createCheckout = useCreateCheckoutSession();
  const [username, setUsername] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [step, setStep] = useState<"identity" | "details" | "paying">(
    "identity",
  );
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
      setStep("details");
    } catch (err: any) {
      toast.error(err?.message ?? "Login failed");
    }
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!inviteCode.trim()) {
      toast.error("Invite code is required");
      return;
    }
    if (!actor) {
      toast.error("Not connected. Please wait.");
      return;
    }

    // Store pending registration details in sessionStorage for after payment
    sessionStorage.setItem("pending_username", username.trim());
    sessionStorage.setItem("pending_invite_code", inviteCode.trim());

    setStep("paying");
    try {
      const session = await createCheckout.mutateAsync([
        {
          productName: "StudyQuest Membership",
          currency: "inr",
          quantity: 1n,
          priceInCents: 2000n,
          productDescription: "Lifetime membership",
        },
      ]);
      window.location.href = session.url;
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to start payment");
      setStep("details");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-card">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl">
              Join StudyQuest
            </CardTitle>
            <CardDescription>
              One-time membership — ₹20 via Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!identity ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  First, create or connect your Internet Identity to get
                  started.
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  data-ocid="register.primary_button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Internet Identity"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already a member?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            ) : step === "paying" ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <Loader2
                  className="h-8 w-8 animate-spin text-primary"
                  data-ocid="register.loading_state"
                />
                <p className="text-muted-foreground text-sm">
                  Redirecting to payment...
                </p>
              </div>
            ) : (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    data-ocid="register.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter invite code from a member"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    data-ocid="register.input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={createCheckout.isPending}
                  data-ocid="register.submit_button"
                >
                  {createCheckout.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ₹20 & Join
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
