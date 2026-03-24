import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.message ?? "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 relative"
      style={{
        backgroundImage: "url('/assets/generated/login-bg.dim_1920x1080.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-3xl font-bold text-white mb-1 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-center text-white/70 text-sm mb-8">
            Sign in to your StudyQuest account
          </p>

          {/* Body */}
          <div className="space-y-4">
            <p className="text-sm text-white/60 text-center">
              StudyQuest uses Internet Identity for secure, password-free
              authentication.
            </p>

            <Button
              className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold"
              size="lg"
              onClick={handleLogin}
              disabled={isLoggingIn}
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                  In...
                </>
              ) : (
                "Sign In with Internet Identity"
              )}
            </Button>

            <p className="text-center text-sm text-white/70">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-white hover:underline font-semibold"
              >
                Join now
              </Link>
            </p>

            <p className="text-center text-xs">
              <Link
                to="/admin-login"
                className="text-white/50 hover:text-white transition-colors"
                data-ocid="login.link"
              >
                Admin login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
