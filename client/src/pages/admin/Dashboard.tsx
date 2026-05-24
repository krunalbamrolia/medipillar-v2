import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Pill, 
  Users, 
  MessageSquare, 
  ShoppingCart, 
  Plus,
  Layers,
  ChevronRight,
  Activity,
  ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

interface DashboardStats {
  companies: number;
  medicines: number;
  users: number;
  orders: number;
  openQueries: number;
  statusData: { name: string; count: number }[];
  orderTrend: { date: string; orders: number }[];
  categoryData: { name: string; value: number }[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30",
  shipped: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30",
  delivered: "bg-green-50 text-green-700 border-green-200/60 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30",
  cancelled: "bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30",
};

const CHART_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders", "recent"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders?limit=5", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
  });

  const recentOrders: any[] = recentOrdersData?.data ?? [];

  const statCards = [
    {
      title: "Active Users",
      value: stats?.users ?? "—",
      icon: Users,
      description: "Registered customers",
      colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      gradient: "from-indigo-500/5 to-indigo-500/0",
    },
    {
      title: "Catalog Products",
      value: stats?.medicines ?? "—",
      icon: Pill,
      description: "Active medicines",
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500/5 to-purple-500/0",
    },
    {
      title: "Total Companies",
      value: stats?.companies ?? "—",
      icon: Building2,
      description: "Pharma partners",
      colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500/5 to-blue-500/0",
    },
    {
      title: "Open Inquiries",
      value: stats?.openQueries ?? "—",
      icon: MessageSquare,
      description: "Unresolved queries",
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      gradient: "from-amber-500/5 to-amber-500/0",
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome header with summary statistics details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Admin Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time shop metrics, user inquiries, and product tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setLocation("/admin/medicines")} size="sm" className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
          <Button onClick={() => setLocation("/admin/orders")} variant="outline" size="sm">
            Manage Orders <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden border border-border/60 shadow-sm relative group hover:shadow-md transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-b ${stat.gradient} opacity-50`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                {stat.title}
              </span>
              <div className={`p-2 rounded-lg ${stat.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 relative z-10">
              <div className="text-2xl font-black tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1">
                <Activity className="h-3 w-3 inline text-muted-foreground/60" />
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphs/Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Area Chart (2/3 width) */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
            <div>
              <CardTitle className="text-lg font-bold">Activity Trends</CardTitle>
              <CardDescription>Order volume over the last 7 days</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              {statsLoading ? (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                  Loading trend data...
                </div>
              ) : stats?.orderTrend && stats.orderTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.orderTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                      labelStyle={{ fontWeight: "bold", fontSize: 12 }}
                      itemStyle={{ fontSize: 12 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="orders" 
                      name="Orders Placed" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorOrders)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
                  No activity trend data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Side breakdown (1/3 width) */}
        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-lg font-bold">Catalog Distribution</CardTitle>
            <CardDescription>Product and category inventory split</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center pt-6">
            <div className="h-[200px] w-full relative">
              {statsLoading ? (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                  Loading breakdown...
                </div>
              ) : stats?.categoryData && stats.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      itemStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
                  No category data available
                </div>
              )}
              {/* Center total number indicator */}
              {!statsLoading && stats?.categoryData && stats.categoryData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black">{stats.medicines}</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Medicines</span>
                </div>
              )}
            </div>
            
            {/* Custom Legend list for category breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {!statsLoading && stats?.categoryData?.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  <span className="truncate text-muted-foreground font-medium">{item.name}</span>
                  <span className="font-bold text-foreground">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2/3 width) */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
            <div>
              <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
              <CardDescription>Overview of the latest 5 client purchases</CardDescription>
            </div>
            <Button onClick={() => setLocation("/admin/orders")} variant="ghost" size="sm" className="text-xs hover:bg-muted">
              View all orders <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 px-0 sm:px-6">
            {ordersLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading recent orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No orders placed yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-xs font-semibold">
                        {order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {order.user?.name ?? "Guest User"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`capitalize font-medium px-2 py-0.5 text-xs ${STATUS_STYLES[order.status] ?? ""}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (1/3 width) */}
        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-lg font-bold">Quick Management</CardTitle>
            <CardDescription>Quick shortcuts to access administrative sections</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-3">
            <div className="grid grid-cols-1 gap-2.5">
              <Button 
                variant="outline" 
                className="w-full justify-start h-11 text-sm border-border/60 hover:bg-indigo-50/20 hover:text-indigo-600 dark:hover:bg-indigo-950/10 dark:hover:text-indigo-400 group"
                onClick={() => setLocation("/admin/categories")}
              >
                <Layers className="mr-3.5 h-4.5 w-4.5 text-muted-foreground group-hover:text-indigo-500" />
                Product Categories
                <ChevronRight className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-11 text-sm border-border/60 hover:bg-blue-50/20 hover:text-blue-600 dark:hover:bg-blue-950/10 dark:hover:text-blue-400 group"
                onClick={() => setLocation("/admin/companies")}
              >
                <Building2 className="mr-3.5 h-4.5 w-4.5 text-muted-foreground group-hover:text-blue-500" />
                Partner Companies
                <ChevronRight className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-11 text-sm border-border/60 hover:bg-purple-50/20 hover:text-purple-600 dark:hover:bg-purple-950/10 dark:hover:text-purple-400 group"
                onClick={() => setLocation("/admin/medicines")}
              >
                <Pill className="mr-3.5 h-4.5 w-4.5 text-muted-foreground group-hover:text-purple-500" />
                Medicine Catalog
                <ChevronRight className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-11 text-sm border-border/60 hover:bg-emerald-50/20 hover:text-emerald-600 dark:hover:bg-emerald-950/10 dark:hover:text-emerald-400 group"
                onClick={() => setLocation("/admin/orders")}
              >
                <ShoppingCart className="mr-3.5 h-4.5 w-4.5 text-muted-foreground group-hover:text-emerald-500" />
                Customer Orders
                <ChevronRight className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
            <div className="pt-4 border-t border-border/40 text-[11px] text-muted-foreground text-center font-medium">
              Logged in as Admin · MediPillar-v2 dashboard
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
