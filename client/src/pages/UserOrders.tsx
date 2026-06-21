import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Package, Clock, CheckCircle2, Truck, XCircle, Eye } from "lucide-react";
import type { Order } from "@/api/types";
import { getUserOrdersApi, getOrderByIdApi } from "@/api/orders";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function UserOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: getUserOrdersApi,
    enabled: !!user,
  });

  const { data: orderDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["/api/orders", selectedOrder?.id],
    queryFn: () => getOrderByIdApi(selectedOrder!.id),
    enabled: !!selectedOrder?.id && dialogOpen,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-auth-modal"));
      }, 100);
      toast({
        title: "Authentication Required",
        description: "Please login to view your orders.",
      });
    }
  }, [user, authLoading, setLocation, toast]);

  if (authLoading || ordersLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d3d2e]" />
        </main>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-amber-500" />;
      case "confirmed": return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case "shipped": return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto max-w-5xl px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">My Orders</h1>

          {orders.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-sm">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
              <Link href="/products">
                <Button className="bg-[#0d3d2e] hover:bg-[#0a5240]">Start Shopping</Button>
              </Link>
            </Card>
          ) : (
            <Card className="overflow-x-auto border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge variant="outline" className={`capitalize px-3 py-1 text-sm ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openOrderDetails(order)}>
                          <Eye className="w-4 h-4 mr-2" /> Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-50 border-0">
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="font-mono font-medium">{selectedOrder.id}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border-0">
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-medium">{format(new Date(selectedOrder.createdAt), "PPP p")}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border-0">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge variant="outline" className={`capitalize ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </Badge>
                </Card>
                <Card className="p-4 bg-gray-50 border-0">
                  <p className="text-sm text-gray-500 mb-1">Total items</p>
                  <p className="font-medium">{orderDetails?.items?.length ?? 0}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border-0 md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                  <p className="font-medium whitespace-pre-line">{orderDetails?.address ?? selectedOrder.address ?? "N/A"}</p>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Order items</h3>
                {detailsLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0d3d2e]" />
                  </div>
                ) : (
                  <div className="border rounded-md divide-y bg-white">
                    {(orderDetails?.items ?? []).map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">Product ID: <span className="font-mono text-sm text-gray-500">{item.medicineId}</span></p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm text-gray-500">Item ID: {item.id.slice(0, 8)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">Select an order to view details.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
