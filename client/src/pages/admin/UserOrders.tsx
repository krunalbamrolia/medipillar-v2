import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { OrderItemsTable } from "@/components/admin/OrderItemsTable";
import { ArrowLeft, Eye, Mail, MapPin, Package, Phone, X } from "lucide-react";
import type { AdminUserOrderDetail, AdminUserOrdersPage, OrderItemDetail } from "@/api/types";
import { getAdminUserOrdersApi } from "@/api/users";
import { getOrderByIdApi } from "@/api/orders";
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

function formatItemsSummary(items: OrderItemDetail[]): string {
  if (items.length === 0) return "—";
  const first = items[0];
  const firstLine = `${first.medicineName} (Qty ${first.quantity})`;
  if (items.length === 1) return firstLine;
  return `${firstLine} +${items.length - 1} more`;
}

export default function AdminUserOrders() {
  const [, params] = useRoute("/admin/users/:userId/orders");
  const userId = params?.userId;

  const [page, setPage] = useState(1);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminUserOrderDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const debouncedMedicine = useDebouncedValue(medicineSearch);
  const limit = 10;

  const { data, isLoading, isFetching } = useQuery<AdminUserOrdersPage>({
    queryKey: [
      "/api/admin/users",
      userId,
      "orders",
      page,
      debouncedMedicine,
    ],
    queryFn: () => getAdminUserOrdersApi(userId!, {
      page,
      limit,
      medicineName: debouncedMedicine,
    }),
    enabled: !!userId,
  });

  const hasFilters = !!debouncedMedicine;

  const clearFilters = () => {
    setMedicineSearch("");
    setPage(1);
  };

  const openDetails = (order: AdminUserOrderDetail) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const { data: orderDetailFresh, isLoading: detailLoading } = useQuery<{
    items: OrderItemDetail[];
  }>({
    queryKey: ["/api/orders", selectedOrder?.id],
    queryFn: () => getOrderByIdApi(selectedOrder!.id),
    enabled: detailOpen && !!selectedOrder?.id,
  });

  const detailItems = orderDetailFresh?.items ?? selectedOrder?.items ?? [];

  if (!userId) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">User not found.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  const user = data?.user;
  const orders = data?.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>

        <AdminPageHeader
          title="Order History"
          description={
            user ? `All orders placed by ${user.name}` : "Loading customer orders..."
          }
        />
      </div>

      {user && (
        <Card className="mb-6 border bg-muted/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phone}
                </span>
                {user.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Joined {format(new Date(user.createdAt), "PPP")}
              </p>
            </div>
            <Badge variant={user.isActive ? "default" : "secondary"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </Card>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_auto] items-end">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Medicine or company name
          </Label>
          <AdminSearchBar
            value={medicineSearch}
            onChange={(v) => {
              setMedicineSearch(v);
              setPage(1);
            }}
            placeholder="Search by product name..."
          />
        </div>
        <div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
              <X className="mr-1 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
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
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="hidden md:table-cell">Delivery address</TableHead>
              <TableHead className="hidden sm:table-cell w-[80px]">Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {hasFilters
                    ? "No orders match your filters."
                    : "This user has not placed any orders yet."}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      <p className="font-medium">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "h:mm a")}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <p className="line-clamp-2 text-sm">{formatItemsSummary(order.items)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.itemCount} {order.itemCount === 1 ? "product" : "products"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] md:table-cell">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {order.address || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{totalQty}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${STATUS_STYLES[order.status] ?? ""}`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openDetails(order)}>
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              {detailLoading && (
                <p className="text-sm text-muted-foreground animate-pulse">Refreshing items...</p>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border bg-muted/30 p-4 rounded-xl shadow-sm">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono font-bold text-foreground text-xs break-all">
                    {selectedOrder.id.split("-")[0].toUpperCase()}
                  </p>
                </Card>
                <Card className="border bg-muted/30 p-4 rounded-xl shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Placed On</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {format(new Date(selectedOrder.createdAt), "PPP p")}
                  </p>
                </Card>
                <Card className="border bg-muted/30 p-4 rounded-xl shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                  <Badge
                    variant="outline"
                    className={`mt-1 capitalize font-semibold ${STATUS_STYLES[selectedOrder.status] ?? ""}`}
                  >
                    {selectedOrder.status}
                  </Badge>
                </Card>
              </div>

              <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Delivery address
                  </p>
                  <p className="mt-1">{selectedOrder.address || "No delivery address provided"}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Order items</h3>
                <OrderItemsTable items={detailItems} orderId={selectedOrder.id} />
              </div>

              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {selectedOrder.itemCount} products ·{" "}
                  {selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} total units
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
