import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { verifyResetSessionApi } from "@/api/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LogIn,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthStep =
  | "entry"           // Enter phone or email
  | "phone-password"  // Existing user: phone + password
  | "email-password"  // Existing user: email + password
  | "name"            // New user: collect name before OTP
  | "otp"             // Verify OTP
  | "setup"           // New user: set email + password
  | "forgot"          // Forgot password: enter phone/email
  | "forgot-otp"      // Forgot password: enter OTP
  | "reset-password"  // Set new password
  | "success";        // Done

// ─── Component ────────────────────────────────────────────────────────────────

export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<AuthStep>("entry");

  // Form state
  const [identifier, setIdentifier] = useState(""); // phone or email on entry step
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotPhone, setForgotPhone] = useState(""); // phone used for reset OTP

  const {
    user,
    logout,
    checkPhone,
    checkEmail,
    requestOtp,
    verifyOtp,
    setupAccount,
    loginWithPhone,
    loginWithEmail,
    forgotPassword,
    resetPassword,
  } = useAuth();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-auth-modal", handleOpen);
    return () => window.removeEventListener("open-auth-modal", handleOpen);
  }, []);

  const resetForm = useCallback(() => {
    setStep("entry");
    setIdentifier("");
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setError("");
    setLoading(false);
    setShowPassword(false);
    setShowConfirm(false);
    setForgotPhone("");
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  }, [resetForm]);

  if (user && !isOpen) {
    return (
      <Button variant="outline" onClick={() => logout()} className="gap-2">
        <LogIn className="w-4 h-4" />
        Logout ({user.name})
      </Button>
    );
  }

  // ─── Step: entry ───────────────────────────────────────────────
  const handleEntrySubmit = async () => {
    const val = identifier.trim();
    if (!val) return;
    setError("");
    setLoading(true);
    try {
      const isEmail = val.includes("@");
      if (isEmail) {
        const { exists } = await checkEmail(val);
        if (exists) {
          setEmail(val);
          setStep("email-password");
        } else {
          setError("No account found for this email. Please sign up with your phone number.");
        }
      } else {
        const { exists, needsSetup } = await checkPhone(val);
        setPhone(val);
        if (exists && !needsSetup) {
          // Returning user with complete account
          setStep("phone-password");
        } else {
          // New user or incomplete account — send OTP
          setStep("name");
        }
      }
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step: name → send OTP ────────────────────────────────────
  const handleSendOtp = async () => {
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      await requestOtp({ phone, name: name.trim() });
      setStep("otp");
    } catch (e: any) {
      setError(e.message ?? "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step: otp → verify ───────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp({ phone, otp });
      if (result.needsSetup) {
        setStep("setup");
      } else {
        closeModal();
      }
    } catch (e: any) {
      setError(e.message ?? "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step: setup ──────────────────────────────────────────────
  const handleSetup = async () => {
    if (!email.trim() || !password) return;
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setError("");
    setLoading(true);
    try {
      await setupAccount({ email: email.trim(), password });
      setStep("success");
      setTimeout(closeModal, 1500);
    } catch (e: any) {
      setError(e.message ?? "Account setup failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step: phone-password ─────────────────────────────────────
  const handlePhoneLogin = async () => {
    if (!phone || !password) return;
    setError("");
    setLoading(true);
    try {
      await loginWithPhone({ phone, password });
      closeModal();
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step: email-password ─────────────────────────────────────
  const handleEmailLogin = async () => {
    if (!email || !password) return;
    setError("");
    setLoading(true);
    try {
      await loginWithEmail({ email, password });
      closeModal();
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step: forgot ─────────────────────────────────────────────
  const handleForgotSubmit = async () => {
    if (!identifier.trim()) return;
    setError("");
    setLoading(true);
    try {
      const result = await forgotPassword(identifier.trim());
      if (result.phone) {
        setForgotPhone(result.phone);
        // Trigger Supabase OTP via requestOtp without storing name
        const isEmail = identifier.includes("@");
        if (!isEmail) setPhone(identifier.trim());
        // For email-based reset, use the phone returned by backend
        await requestOtp({ phone: result.phone, name: "User" });
        setOtp("");
        setStep("forgot-otp");
      } else {
        // Account not found but we don't reveal it
        setError("If an account exists, an OTP has been sent to the registered phone.");
      }
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step: forgot-otp ─────────────────────────────────────────
  const handleForgotOtp = async () => {
    if (!otp || otp.length < 4) return;
    setError("");
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.verifyOtp({
        phone: forgotPhone,
        token: otp,
        type: "sms",
      });
      if (otpError) throw otpError;

      // Sync reset session with backend
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.access_token) {
        await verifyResetSessionApi(sessionData.session.access_token);
      } else {
        throw new Error("No active session found. Please try again.");
      }

      setPassword("");
      setConfirmPassword("");
      setStep("reset-password");
    } catch (e: any) {
      setError(e.message ?? "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step: reset-password ─────────────────────────────────────
  const handleResetPassword = async () => {
    if (!password) return;
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setError("");
    setLoading(true);
    try {
      await resetPassword({ phone: forgotPhone, otp, password });
      setStep("success");
      setTimeout(closeModal, 1800);
    } catch (e: any) {
      setError(e.message ?? "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────
  const stepTitles: Record<AuthStep, string> = {
    entry: "Welcome to Medipillar",
    "phone-password": "Enter your password",
    "email-password": "Enter your password",
    name: "What's your name?",
    otp: "Verify your number",
    setup: "Create your account",
    forgot: "Reset your password",
    "forgot-otp": "Enter verification code",
    "reset-password": "Set a new password",
    success: "You're all set!",
  };

  const canGoBack: Partial<Record<AuthStep, AuthStep>> = {
    "phone-password": "entry",
    "email-password": "entry",
    name: "entry",
    otp: "name",
    setup: "otp",
    forgot: "entry",
    "forgot-otp": "forgot",
    "reset-password": "forgot-otp",
  };

  const handleBack = () => {
    const prev = canGoBack[step];
    if (prev) {
      setStep(prev);
      setError("");
      setPassword("");
      setOtp("");
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { if (step === "setup") return; closeModal(); } }}>
      <Button
        className="gap-2 bg-[#0d3d2e] hover:bg-[#0a5240] text-white"
        onClick={() => setIsOpen(true)}
      >
        <LogIn className="w-4 h-4" />
        Login
      </Button>

      <DialogContent 
        className={`sm:max-w-md p-0 overflow-hidden ${step === "setup" ? "[&>button]:hidden" : ""}`}
        onEscapeKeyDown={(e) => {
          if (step === "setup") {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (step === "setup") {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] px-6 pt-6 pb-8 text-white relative">
          {canGoBack[step] && (
            <button
              onClick={handleBack}
              className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex flex-col items-center text-center gap-2 mt-2">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-1">
              {step === "success" ? (
                <CheckCircle2 className="w-7 h-7 text-green-300" />
              ) : step === "setup" || step === "reset-password" ? (
                <Lock className="w-6 h-6" />
              ) : step === "otp" || step === "forgot-otp" ? (
                <ShieldCheck className="w-6 h-6" />
              ) : step === "forgot" ? (
                <KeyRound className="w-6 h-6" />
              ) : (
                <LogIn className="w-6 h-6" />
              )}
            </div>
            <DialogTitle className="text-lg font-semibold text-white">
              {stepTitles[step]}
            </DialogTitle>
            {step === "entry" && (
              <p className="text-sm text-white/70">Sign in or create your account</p>
            )}
            {step === "otp" && (
              <p className="text-sm text-white/70">Code sent to {phone}</p>
            )}
            {step === "forgot-otp" && (
              <p className="text-sm text-white/70">Code sent to {forgotPhone}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── ENTRY ── */}
          {step === "entry" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="auth-identifier">Phone number or email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {identifier.includes("@") ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <Input
                    id="auth-identifier"
                    placeholder="e.g. 9876543210 or you@email.com"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                    className="pl-9"
                    onKeyDown={(e) => e.key === "Enter" && handleEntrySubmit()}
                    autoFocus
                  />
                </div>
              </div>
              <Button
                onClick={handleEntrySubmit}
                disabled={!identifier.trim() || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                New user? Enter your phone number to get started.
              </p>
            </>
          )}

          {/* ── NAME ── */}
          {step === "name" && (
            <>
              <p className="text-sm text-muted-foreground">
                We'll send a verification code to <span className="font-medium text-foreground">{phone}</span>.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="auth-name">Full name *</Label>
                <Input
                  id="auth-name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  autoFocus
                />
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={!name.trim() || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
              </Button>
            </>
          )}

          {/* ── OTP ── */}
          {step === "otp" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="auth-otp">6-digit code</Label>
                <Input
                  id="auth-otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  autoFocus
                />
              </div>
              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length < 4 || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => { setStep("name"); setOtp(""); setError(""); }}
              >
                Resend OTP
              </Button>
            </>
          )}

          {/* ── SETUP ── */}
          {step === "setup" && (
            <>
              <p className="text-sm text-muted-foreground">
                Almost there! Set up your email and password to complete registration.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="setup-email">Email address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="setup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setup-password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="setup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setup-confirm">Confirm password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="setup-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    className="pl-9 pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSetup()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                onClick={handleSetup}
                disabled={!email.trim() || !password || !confirmPassword || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </>
          )}

          {/* ── PHONE-PASSWORD ── */}
          {step === "phone-password" && (
            <>
              <p className="text-sm text-muted-foreground">
                Signing in as <span className="font-medium text-foreground">{phone}</span>
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="pl-9 pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handlePhoneLogin()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                onClick={handlePhoneLogin}
                disabled={!password || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
              </Button>
              <button
                onClick={() => { setIdentifier(phone); setStep("forgot"); setError(""); setPassword(""); }}
                className="w-full text-center text-sm text-muted-foreground hover:text-[#0d3d2e] transition-colors"
              >
                Forgot password?
              </button>
            </>
          )}

          {/* ── EMAIL-PASSWORD ── */}
          {step === "email-password" && (
            <>
              <p className="text-sm text-muted-foreground">
                Signing in as <span className="font-medium text-foreground">{email}</span>
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="login-email-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="pl-9 pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                onClick={handleEmailLogin}
                disabled={!password || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
              </Button>
              <button
                onClick={() => { setIdentifier(email); setStep("forgot"); setError(""); setPassword(""); }}
                className="w-full text-center text-sm text-muted-foreground hover:text-[#0d3d2e] transition-colors"
              >
                Forgot password?
              </button>
            </>
          )}

          {/* ── FORGOT ── */}
          {step === "forgot" && (
            <>
              <p className="text-sm text-muted-foreground">
                Enter your registered phone number or email. We'll send an OTP to your phone.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="forgot-identifier">Phone or email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {identifier.includes("@") ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <Input
                    id="forgot-identifier"
                    placeholder="Your phone or email"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                    className="pl-9"
                    onKeyDown={(e) => e.key === "Enter" && handleForgotSubmit()}
                    autoFocus
                  />
                </div>
              </div>
              <Button
                onClick={handleForgotSubmit}
                disabled={!identifier.trim() || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
              </Button>
            </>
          )}

          {/* ── FORGOT-OTP ── */}
          {step === "forgot-otp" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="forgot-otp-input">6-digit code</Label>
                <Input
                  id="forgot-otp-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleForgotOtp()}
                  autoFocus
                />
              </div>
              <Button
                onClick={handleForgotOtp}
                disabled={otp.length < 4 || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </Button>
            </>
          )}

          {/* ── RESET PASSWORD ── */}
          {step === "reset-password" && (
            <>
              <p className="text-sm text-muted-foreground">Set a strong new password for your account.</p>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="pl-9 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-confirm">Confirm new password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    className="pl-9 pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                onClick={handleResetPassword}
                disabled={!password || !confirmPassword || loading}
                className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
              </Button>
            </>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <p className="text-base font-medium">You're logged in!</p>
              <p className="text-sm text-muted-foreground">Redirecting you now…</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
