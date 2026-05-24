import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader } from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Pill, LayoutDashboard, FolderTree, Building2, PillIcon, MessageSquare, LogOut, ShoppingCart, Users } from "lucide-react";

export function AdminSidebar() {
  const [location] = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: FolderTree,
    },
    {
      title: "Companies",
      url: "/admin/companies",
      icon: Building2,
    },
    {
      title: "Medicines",
      url: "/admin/medicines",
      icon: PillIcon,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Queries",
      url: "/admin/queries",
      icon: MessageSquare,
    },
  ];

  const isActive = (url: string) =>
    location === url || (url === "/admin/users" && location.startsWith("/admin/users"));

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">MediCare Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={isActive(item.url) ? "bg-sidebar-accent" : ""}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="button-logout">
                  <Link href="/">
                    <LogOut className="h-4 w-4" />
                    <span>Back to Website</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
