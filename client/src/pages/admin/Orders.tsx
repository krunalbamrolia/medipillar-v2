import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, Mail, Phone, MapPin, User } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AdminOrder, OrderItemDetail, PaginatedResult } from "@shared/types/database";
import { OrderItemsTable } from "@/components/admin/OrderItemsTable";
import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const limit = 10;
  const { toast } = useToast();

  const { data, isLoading, isFetching } = useQuery<PaginatedResult<AdminOrder>>({
    queryKey: ["/api/admin/orders", page, statusFilter, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const { data: orderDetails, isLoading: detailsLoading } = useQuery<{
    items: OrderItemDetail[];
    address: string;
    createdAt: string;
    status: string;
  }>({
    queryKey: ["/api/orders", selectedOrder?.id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${selectedOrder?.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch details");
      return res.json();
    },
    enabled: !!selectedOrder?.id && dialogOpen,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated" });
    },
  });

  const orders = data?.data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Manage and process customer orders"
        actions={
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="mb-4">
        <AdminSearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search orders, customer, address..."
        />
      </div>

      <AdminTableShell
        isFetching={isFetching && !isLoading}
        footer={
          data ? (
            <AdminPagination
              page={page}
              totalPages={data.totalPages}
              total={data.total}
              limit={limit}
              onPageChange={setPage}
              isLoading={isFetching}
              itemLabel="orders"
            />
          ) : null
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Address</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{order.user?.name ?? "—"}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm">{order.user?.phone ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.email ?? "—"}</p>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] lg:table-cell">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {order.address || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateStatus.mutate({ id: order.id, status: val })}
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger
                        className={`h-8 w-[120px] border font-medium capitalize ${STATUS_STYLES[order.status] ?? ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-2 space-y-6">
              <Card className="border-0 bg-muted/50 p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">Placed on</p>
                <p className="mt-1 text-sm font-medium">
                  {format(new Date(selectedOrder.createdAt), "PPP p")}
                </p>
              </Card>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <Card className="space-y-2 border bg-muted/30 p-4">
                  <p className="font-medium">{selectedOrder.user?.name ?? "Unknown"}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {selectedOrder.user?.phone ?? "—"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedOrder.user?.email ?? "—"}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{selectedOrder.address || "No delivery address"}</span>
                  </div>
                </Card>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Order Items</h3>
                  <Badge variant="outline" className={`capitalize ${STATUS_STYLES[selectedOrder.status] ?? ""}`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                {detailsLoading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Loading items...</p>
                ) : (
                  <OrderItemsTable
                    items={orderDetails?.items ?? []}
                    orderId={selectedOrder.id}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
