import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  getMeApi,
  checkPhoneApi,
  checkEmailApi,
  syncSessionApi,
  setupAccountApi,
  loginPhoneApi,
  loginEmailApi,
  forgotPasswordApi,
  resetPasswordApi,
  logoutApi,
} from "@/api/auth";
import { addCartItemApi } from "@/api/cart";
import type { User } from "@/api/types";

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
    queryFn: getMeApi,
    retry: false,
  });

  // ─── Check phone ──────────────────────────────────────────────
  const checkPhoneMutation = useMutation({
    mutationFn: checkPhoneApi,
  });

  // ─── Check email ──────────────────────────────────────────────
  const checkEmailMutation = useMutation({
    mutationFn: checkEmailApi,
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

      return syncSessionApi({
        accessToken: data.session.access_token,
        name: pending.name ?? "User",
        phone: pending.phone ?? formatted,
        email: pending.email || undefined,
      });
    },
    onSuccess: (data) => {
      if (!data.needsSetup) {
        queryClient.setQueryData(["/api/auth/me"], data.user);
        toast({ title: "Logged in successfully" });
        _runPendingCartAction(queryClient, toast);
      }
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
    mutationFn: setupAccountApi,
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
    mutationFn: loginPhoneApi,
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
    mutationFn: loginEmailApi,
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
    mutationFn: forgotPasswordApi,
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
      return resetPasswordApi(password);
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
    mutationFn: logoutApi,
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
    requestOtp: requestOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
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
    addCartItemApi(medicineId, quantity).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item added to cart",
        description: "Your pending cart item was added successfully.",
      });
      sessionStorage.removeItem("pending_cart_action");
    });
  } catch (e) {
    console.error(e);
  }
}
