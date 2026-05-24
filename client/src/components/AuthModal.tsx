import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogIn } from "lucide-react";

export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-auth-modal", handleOpen);
    return () => window.removeEventListener("open-auth-modal", handleOpen);
  }, []);
  const [otp, setOtp] = useState("");
  const { requestOtp, verifyOtp, user, logout } = useAuth();

  if (user) {
    return (
      <Button variant="outline" onClick={() => logout()} className="gap-2">
        <LogIn className="w-4 h-4" />
        Logout ({user.name})
      </Button>
    );
  }

  const handleRequestOtp = async () => {
    if (!name.trim() || !phone.trim()) return;
    try {
      await requestOtp({ phone, name: name.trim(), email: email.trim() || undefined });
      setStep("otp");
    } catch {
      // handled in hook
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    try {
      await verifyOtp({ phone, otp });
      setIsOpen(false);
      setStep("details");
      setName("");
      setPhone("");
      setEmail("");
      setOtp("");
    } catch {
      // handled in hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#0d3d2e] hover:bg-[#0a5240] text-white">
          <LogIn className="w-4 h-4" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "details" ? "Login to Medipillar" : "Enter OTP"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {step === "details" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Sign in with your phone number. We will send a one-time password via SMS.
              </p>
              <div className="space-y-2">
                <Label htmlFor="auth-name">Full Name *</Label>
                <Input
                  id="auth-name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-phone">Phone Number *</Label>
                <Input
                  id="auth-phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email (optional)</Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleRequestOtp}
                disabled={!name.trim() || !phone.trim()}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Enter the code sent to {phone}
              </p>
              <Input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              <Button
                onClick={handleVerifyOtp}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                Verify & Login
              </Button>
              <Button variant="ghost" onClick={() => setStep("details")} className="w-full">
                Change details
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
