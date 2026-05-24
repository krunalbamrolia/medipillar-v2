import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
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
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({ title: "Logged in successfully" });

      const pending = sessionStorage.getItem("pending_cart_action");
      if (pending) {
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
    },
    onError: (err: Error) => {
      console.log(err)
      toast({
        title: "Invalid OTP",
        description: err.message,
        variant: "destructive",
      });
    },
  });

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
    requestOtp: requestOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}
