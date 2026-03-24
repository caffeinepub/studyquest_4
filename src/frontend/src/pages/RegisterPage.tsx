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
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Home, Loader2, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useRegisterWithAccessCode } from "../hooks/useQueries";

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerWithCode = useRegisterWithAccessCode();
  const [username, setUsername] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [step, setStep] = useState<"details" | "qr">("details");

  // Hidden bypass code state
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [showBypassInput, setShowBypassInput] = useState(false);
  const [bypassCode, setBypassCode] = useState("");
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => setLogoTapCount(0), 1500);
    if (newCount >= 5) {
      setLogoTapCount(0);
      setShowBypassInput(true);
    }
  };

  const handleProceedToQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!inviteCode.trim()) {
      toast.error("Invite code is required");
      return;
    }
    setStep("qr");
  };

  const handleBypassRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Enter your username first");
      return;
    }
    if (!bypassCode.trim()) {
      toast.error("Enter the access code");
      return;
    }
    try {
      await registerWithCode.mutateAsync({
        username: username.trim(),
        code: bypassCode.trim(),
      });
      toast.success("Access granted! Welcome to StudyQuest.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.message ?? "Invalid access code");
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
              <button
                type="button"
                className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center cursor-default select-none"
                onClick={handleLogoTap}
                tabIndex={-1}
                aria-hidden="true"
              >
                <BookOpen className="h-7 w-7 text-primary" />
              </button>
            </div>
            <CardTitle className="font-display text-2xl">
              Join StudyQuest
            </CardTitle>
            <CardDescription>
              One-time membership — ₹20 via PhonePe / UPI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showBypassInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                onSubmit={handleBypassRegister}
                className="space-y-3 mb-4 p-3 rounded-lg bg-muted/40 border border-border"
              >
                <div className="space-y-1">
                  <Label
                    htmlFor="bypass-username"
                    className="text-xs text-muted-foreground"
                  >
                    Username
                  </Label>
                  <Input
                    id="bypass-username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    type="password"
                    placeholder="Access code"
                    value={bypassCode}
                    onChange={(e) => setBypassCode(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={registerWithCode.isPending}
                >
                  {registerWithCode.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />{" "}
                      Joining...
                    </>
                  ) : (
                    "Join Now"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowBypassInput(false)}
                >
                  Cancel
                </Button>
              </motion.form>
            )}

            {step === "details" ? (
              <form onSubmit={handleProceedToQR} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter invite code from a member"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <QrCode className="mr-2 h-4 w-4" />
                  Continue to Payment
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
              </form>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <p className="text-sm text-center text-muted-foreground">
                  Scan the QR code below and pay{" "}
                  <span className="font-semibold text-foreground">₹20</span> via
                  PhonePe or any UPI app.
                </p>
                <div className="rounded-2xl border-2 border-primary/20 p-3 bg-white shadow-md">
                  <img
                    src="/assets/uploads/accountqrcodeunion_bank_of_india_-_1866_dark_theme-019d1e6f-1a9e-76c1-8f9e-c571340aa2da-1.png"
                    alt="PhonePe UPI QR Code"
                    className="w-56 h-56 object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  After paying, the admin will verify your payment and activate
                  your account. Come back and log in once approved.
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate({ to: "/" })}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("details")}
                >
                  Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
