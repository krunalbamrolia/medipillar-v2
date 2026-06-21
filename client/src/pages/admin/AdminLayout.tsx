import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminGetMeApi } from "@/api/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const { data: auth, isLoading } = useQuery({
    queryKey: ["/api/admin/me"],
    queryFn: adminGetMeApi,
    retry: false,
    staleTime: 5000,
  });

  useEffect(() => {
    if (!isLoading && (!auth || !auth.authenticated)) {
      setLocation("/admin");
    }
  }, [auth, isLoading, setLocation]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location]);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d3d2e]" />
      </div>
    );
  }

  if (!auth || !auth.authenticated) {
    return null;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main ref={mainRef} className="flex-1 overflow-auto p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
