import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
  accountSetupComplete?: boolean;
  createdAt: string;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) return phone;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

const PENDING_PROFILE_KEY = "medipillar_pending_profile";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    retry: false,
  });

  // ─── Check phone ──────────────────────────────────────────────
  const checkPhoneMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await fetch("/api/auth/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ exists: boolean; needsSetup: boolean }>;
    },
  });

  // ─── Check email ──────────────────────────────────────────────
  const checkEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ exists: boolean }>;
    },
  });

  // ─── Request OTP (new users only) ────────────────────────────
  const requestOtpMutation = useMutation({
    mutationFn: async ({
      phone,
      name,
      email,
    }: {
      phone: string;
      name: string;
      email?: string;
    }) => {
      const formatted = formatPhone(phone);
      sessionStorage.setItem(
        PENDING_PROFILE_KEY,
        JSON.stringify({ name, phone: formatted, email: email || "" }),
      );

      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "OTP Sent",
        description: "Check your phone for the verification code.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to send OTP",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Verify OTP ───────────────────────────────────────────────
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const formatted = formatPhone(phone);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatted,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      if (!data.session?.access_token) {
        throw new Error("No session returned from Supabase");
      }

      const pending = JSON.parse(
        sessionStorage.getItem(PENDING_PROFILE_KEY) ?? "{}",
      ) as { name?: string; phone?: string; email?: string };

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          accessToken: data.session.access_token,
          name: pending.name ?? "User",
          phone: pending.phone ?? formatted,
          email: pending.email || undefined,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      sessionStorage.removeItem(PENDING_PROFILE_KEY);
      return res.json() as Promise<{ success: boolean; user: User; needsSetup: boolean }>;
    },
    onSuccess: (data) => {
      if (!data.needsSetup) {
        queryClient.setQueryData(["/api/auth/me"], data.user);
        toast({ title: "Logged in successfully" });
        _runPendingCartAction(queryClient, toast);
      }
      // If needsSetup=true, the modal handles showing the setup screen
    },
    onError: (err: Error) => {
      toast({
        title: "Invalid OTP",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Setup account (after OTP) ────────────────────────────────
  const setupAccountMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/auth/setup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Setup failed" }));
        throw new Error(body.error ?? "Setup failed");
      }
      return res.json() as Promise<{ success: boolean; user: User }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({ title: "Account created!", description: "You are now logged in." });
      _runPendingCartAction(queryClient, toast);
    },
    onError: (err: Error) => {
      toast({
        title: "Setup failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Login with phone + password ──────────────────────────────
  const loginWithPhoneMutation = useMutation({
    mutationFn: async ({ phone, password }: { phone: string; password: string }) => {
      const res = await fetch("/api/auth/login-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(body.error ?? "Login failed");
      }
      return res.json() as Promise<{ success: boolean; user: User }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({ title: "Logged in successfully" });
      _runPendingCartAction(queryClient, toast);
    },
    onError: (err: Error) => {
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Login with email + password ──────────────────────────────
  const loginWithEmailMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(body.error ?? "Login failed");
      }
      return res.json() as Promise<{ success: boolean; user: User }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({ title: "Logged in successfully" });
      _runPendingCartAction(queryClient, toast);
    },
    onError: (err: Error) => {
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Forgot password ──────────────────────────────────────────
  const forgotPasswordMutation = useMutation({
    mutationFn: async (phoneOrEmail: string) => {
      const isEmail = phoneOrEmail.includes("@");
      const body = isEmail
        ? { email: phoneOrEmail }
        : { phone: phoneOrEmail };
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ success: boolean; phone?: string }>;
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Reset password (after forgot-password OTP) ───────────────
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { phone?: string; otp?: string; password: string }) => {
      // The OTP was already verified during the forgot-otp step, which established the reset session on the backend.
      // We directly submit the new password to our backend.
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Reset failed" }));
        throw new Error(body.error ?? "Reset failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password reset successfully", description: "You can now log in with your new password." });
    },
    onError: (err: Error) => {
      toast({
        title: "Reset failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ─── Logout ───────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Logged out" });
    },
  });

  return {
    user: user ?? undefined,
    isLoading,
    isError: !!error,
    // Existing
    requestOtp: requestOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    // New
    checkPhone: checkPhoneMutation.mutateAsync,
    checkEmail: checkEmailMutation.mutateAsync,
    setupAccount: setupAccountMutation.mutateAsync,
    loginWithPhone: loginWithPhoneMutation.mutateAsync,
    loginWithEmail: loginWithEmailMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    isSettingUp: setupAccountMutation.isPending,
    isLoggingIn: loginWithPhoneMutation.isPending || loginWithEmailMutation.isPending,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _runPendingCartAction(queryClient: ReturnType<typeof useQueryClient>, toast: ReturnType<typeof useToast>["toast"]) {
  const pending = sessionStorage.getItem("pending_cart_action");
  if (!pending) return;
  try {
    const { medicineId, quantity } = JSON.parse(pending);
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicineId, quantity }),
    }).then((res) => {
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({
          title: "Item added to cart",
          description: "Your pending cart item was added successfully.",
        });
        sessionStorage.removeItem("pending_cart_action");
      }
    });
  } catch (e) {
    console.error(e);
  }
}
