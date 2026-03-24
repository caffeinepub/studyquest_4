import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentPendingPage() {
  const navigate = useNavigate();

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
              Payment Submitted!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pb-8">
            <div
              className="flex flex-col items-center gap-4"
              data-ocid="payment.success_state"
            >
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-10 w-10 text-amber-500" />
              </div>
              <p className="text-lg font-semibold">Awaiting Admin Approval</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your payment request has been submitted. The admin will review
                and approve your membership shortly. Please check back later.
              </p>
              <Button
                className="mt-2"
                onClick={() => navigate({ to: "/" })}
                data-ocid="payment.primary_button"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
