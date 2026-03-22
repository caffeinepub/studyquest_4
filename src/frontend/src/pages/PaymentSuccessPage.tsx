import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function PaymentSuccessPage() {
  const search = useSearch({ from: "/payment-success" });
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!actor || !identity) return;
    const sessionId = (search as any).session_id;
    if (!sessionId) {
      setStatus("error");
      setMessage("No session ID found.");
      return;
    }

    const complete = async () => {
      try {
        const stripeStatus = await actor.getStripeSessionStatus(sessionId);
        if (stripeStatus.__kind__ !== "completed") {
          setStatus("error");
          setMessage("Payment not completed.");
          return;
        }

        const username = sessionStorage.getItem("pending_username") ?? "";
        const inviteCode = sessionStorage.getItem("pending_invite_code") ?? "";

        if (username && inviteCode) {
          await actor.registerWithInvite({ username, inviteCode });
          await actor.markUserAsPaid(identity.getPrincipal());
          sessionStorage.removeItem("pending_username");
          sessionStorage.removeItem("pending_invite_code");
        } else {
          await actor.markUserAsPaid(identity.getPrincipal());
        }

        setStatus("success");
        setMessage("Welcome to StudyQuest!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message ?? "Registration failed");
      }
    };

    complete();
  }, [actor, identity, search]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-card text-center">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            {status === "loading" && (
              <div
                className="flex flex-col items-center gap-3"
                data-ocid="payment.loading_state"
              >
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Completing your registration...
                </p>
              </div>
            )}
            {status === "success" && (
              <div
                className="flex flex-col items-center gap-3"
                data-ocid="payment.success_state"
              >
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-lg font-semibold">{message}</p>
                <p className="text-sm text-muted-foreground">
                  Your membership is now active. Explore the library and
                  challenge friends!
                </p>
                <Button
                  className="mt-2"
                  onClick={() => navigate({ to: "/dashboard" })}
                  data-ocid="payment.primary_button"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
            {status === "error" && (
              <div
                className="flex flex-col items-center gap-3"
                data-ocid="payment.error_state"
              >
                <XCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg font-semibold">Something went wrong</p>
                <p className="text-sm text-muted-foreground">{message}</p>
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: "/register" })}
                  data-ocid="payment.secondary_button"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
