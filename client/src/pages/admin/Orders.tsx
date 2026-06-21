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
import { Eye, Mail, Phone, MapPin, User, Lock, MessageCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { AdminOrder, OrderItemDetail, PaginatedResult } from "@/api/types";
import { getAdminOrdersApi, getOrderByIdApi, updateOrderStatusApi } from "@/api/orders";
import { OrderItemsTable } from "@/components/admin/OrderItemsTable";
import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createShippedNotificationLink } from "@/lib/whatsapp";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

/** Statuses that are disallowed when order is already Shipped */
const SHIPPED_LOCKED: string[] = ["pending", "confirmed"];

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
    queryFn: () => getAdminOrdersApi({ page, limit, status: statusFilter, search: debouncedSearch }),
  });

  const { data: orderDetails, isLoading: detailsLoading } = useQuery<{
    items: OrderItemDetail[];
    address: string;
    createdAt: string;
    status: string;
  }>({
    queryKey: ["/api/orders", selectedOrder?.id],
    queryFn: () => getOrderByIdApi(selectedOrder!.id),
    enabled: !!selectedOrder?.id && dialogOpen,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatusApi(id, status),
    onSuccess: (updatedOrder, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated" });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to update status",
        description: err.message,
        variant: "destructive",
      });
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
              orders.map((order) => {
                const isShipped = order.status === "shipped";
                return (
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
                      <div className="flex items-center gap-1.5">
                        {isShipped && (
                          <span title="Shipped orders cannot be moved back to Pending or Confirmed">
                            <Lock className="h-3.5 w-3.5 shrink-0 text-purple-600" />
                          </span>
                        )}
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
                            <SelectItem
                              value="pending"
                              disabled={isShipped}
                              className={isShipped ? "opacity-40 cursor-not-allowed" : ""}
                            >
                              Pending
                            </SelectItem>
                            <SelectItem
                              value="confirmed"
                              disabled={isShipped}
                              className={isShipped ? "opacity-40 cursor-not-allowed" : ""}
                            >
                              Confirmed
                            </SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick WhatsApp button for already-shipped orders */}
                        {isShipped && order.user?.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => {
                              const waLink = createShippedNotificationLink({
                                customerPhone: order.user!.phone!,
                                customerName: order.user!.name ?? "Customer",
                                orderId: order.id,
                                items: [{ medicineName: "Your order items", quantity: 1 }],
                              });
                              window.open(waLink, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border bg-muted/30 p-4 shadow-sm rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono font-bold text-foreground text-sm break-all">
                    {selectedOrder.id}
                  </p>
                </Card>
                <Card className="border bg-muted/30 p-4 shadow-sm rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Placed On</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {format(new Date(selectedOrder.createdAt), "PPP p")}
                  </p>
                </Card>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
                  <User className="h-4 w-4 text-emerald-600" />
                  Customer Information
                </h3>
                <Card className="space-y-3 border bg-muted/10 p-4 shadow-sm rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <p className="font-bold text-foreground text-base">{selectedOrder.user?.name ?? "Unknown"}</p>
                    <Badge variant="outline" className={`capitalize font-semibold ${STATUS_STYLES[selectedOrder.status] ?? ""}`}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-foreground font-medium">{selectedOrder.user?.phone ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-foreground font-medium truncate">{selectedOrder.user?.email ?? "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground border-t pt-2 mt-1">
                    <MapPin className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Delivery Address</span>
                      <p className="text-foreground font-medium mt-0.5">{selectedOrder.address || "No delivery address"}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between border-b pb-1">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Order Items</h3>
                  {selectedOrder.status === "shipped" && (
                    <span className="flex items-center gap-1 text-xs text-purple-600 font-semibold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 shadow-sm">
                      <Lock className="h-3.5 w-3.5" /> Status Locked
                    </span>
                  )}
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
              
              {/* WhatsApp notify button inside dialog for shipped orders */}
              {selectedOrder.status === "shipped" && selectedOrder.user?.phone && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-green-800">Send Shipment Notification</p>
                    <p className="text-xs text-green-700">Open WhatsApp with a pre-filled message for this customer.</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                    onClick={() => {
                      const waLink = createShippedNotificationLink({
                        customerPhone: selectedOrder.user!.phone!,
                        customerName: selectedOrder.user!.name ?? "Customer",
                        orderId: selectedOrder.id,
                        items: (orderDetails?.items ?? []).map((i: OrderItemDetail) => ({
                          medicineName: i.medicineName,
                          quantity: i.quantity,
                        })),
                      });
                      window.open(waLink, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
