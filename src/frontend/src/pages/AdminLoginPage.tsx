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
import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_USERNAME = "SiMBa";
const ADMIN_PIN = "898900";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !pin.trim()) {
      toast.error("Please enter both username and PIN");
      return;
    }
    setIsSubmitting(true);
    try {
      if (username.trim() === ADMIN_USERNAME && pin.trim() === ADMIN_PIN) {
        localStorage.setItem("adminLoggedIn", "true");
        toast.success("Welcome, Admin!");
        navigate({ to: "/admin" });
      } else {
        toast.error("Wrong username or PIN");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Login failed");
    } finally {
      setIsSubmitting(false);
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
        <Card className="shadow-card border-primary/20">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="username"
                  data-ocid="admin_login.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  data-ocid="admin_login.textarea"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                data-ocid="admin_login.submit_button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Login as Admin"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Not an admin?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                  data-ocid="admin_login.link"
                >
                  Back to regular login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
