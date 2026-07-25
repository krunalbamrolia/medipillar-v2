import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Package, Clock, CheckCircle2, Truck, XCircle, Eye, Store, Building2, Stethoscope, Pencil, Save, X, User as UserIcon, Mail, Phone } from "lucide-react";
import type { Order } from "@/api/types";
import { getUserOrdersApi, getOrderByIdApi } from "@/api/orders";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { client } from "@/api/client";

export default function UserOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [editMedicalName, setEditMedicalName] = useState("");
  const [editHospitalName, setEditHospitalName] = useState("");
  const [editDrSpecialist, setEditDrSpecialist] = useState("");

  const updateMedicalMutation = useMutation({
    mutationFn: (fields: { medicalName?: string; hospitalName?: string; drSpecialist?: string }) =>
      client.patch<{ success: boolean; user: any }>("/api/auth/profile/medical", fields),
    onSuccess: (res) => {
      queryClient.setQueryData(["/api/auth/me"], res.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Updated", description: "Medical details updated successfully." });
      setIsEditingMedical(false);
    },
    onError: (err: Error) => {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSaveMedical = () => {
    if (!editMedicalName.trim() && !editHospitalName.trim() && !editDrSpecialist.trim()) {
      toast({
        title: "Validation Error",
        description: "At least one of Medical Name, Hospital Name, or Dr Specialist is required.",
        variant: "destructive",
      });
      return;
    }
    updateMedicalMutation.mutate({
      medicalName: editMedicalName.trim(),
      hospitalName: editHospitalName.trim(),
      drSpecialist: editDrSpecialist.trim(),
    });
  };

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
          
          {/* User Profile & Medical Details Header Card */}
          <Card className="mb-8 border-0 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-emerald-900 text-white flex flex-row items-center justify-between py-4 px-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-emerald-300" />
                Account Profile & Medical Details
              </CardTitle>
              {!isEditingMedical ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5"
                  onClick={() => {
                    setEditMedicalName(user.medicalName || "");
                    setEditHospitalName(user.hospitalName || "");
                    setEditDrSpecialist(user.drSpecialist || "");
                    setIsEditingMedical(true);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Medical Info
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1"
                    onClick={handleSaveMedical}
                    disabled={updateMedicalMutation.isPending}
                  >
                    <Save className="w-3.5 h-3.5" /> {updateMedicalMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1"
                    onClick={() => setIsEditingMedical(false)}
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Account Details</span>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-gray-900 text-base">{user.name}</p>
                    <p className="text-gray-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {user.phone}</p>
                    {user.email && <p className="text-gray-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {user.email}</p>}
                  </div>
                </div>

                <div className="md:col-span-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 space-y-3">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Medical Details</span>

                  {!isEditingMedical ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <span className="text-xs text-emerald-800 font-medium flex items-center gap-1 mb-1">
                          <Store className="w-3.5 h-3.5" /> Medical Name
                        </span>
                        <p className="font-semibold text-gray-900">{user.medicalName || "—"}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <span className="text-xs text-emerald-800 font-medium flex items-center gap-1 mb-1">
                          <Building2 className="w-3.5 h-3.5" /> Hospital Name
                        </span>
                        <p className="font-semibold text-gray-900">{user.hospitalName || "—"}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <span className="text-xs text-emerald-800 font-medium flex items-center gap-1 mb-1">
                          <Stethoscope className="w-3.5 h-3.5" /> Dr Specialist
                        </span>
                        <p className="font-semibold text-gray-900">{user.drSpecialist || "—"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs mb-1 block">Medical Name</Label>
                        <Input
                          value={editMedicalName}
                          onChange={(e) => setEditMedicalName(e.target.value)}
                          placeholder="e.g. Apex Pharmacy"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Hospital Name</Label>
                        <Input
                          value={editHospitalName}
                          onChange={(e) => setEditHospitalName(e.target.value)}
                          placeholder="e.g. City Hospital"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Dr Specialist</Label>
                        <Input
                          value={editDrSpecialist}
                          onChange={(e) => setEditDrSpecialist(e.target.value)}
                          placeholder="e.g. Dr. Sharma"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                      <TableCell className="font-mono text-sm">{order.id.split("-")[0].toUpperCase()}</TableCell>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[#0d3d2e]">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-50 border shadow-sm rounded-xl">
                  <p className="text-xs font-semibold tracking-wider text-gray-500 mb-1">Order ID</p>
                  <p className="font-mono font-bold text-gray-900 break-all">{selectedOrder.id.split("-")[0].toUpperCase()}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border shadow-sm rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Placed On</p>
                  <p className="font-semibold text-gray-900">{format(new Date(selectedOrder.createdAt), "PPP p")}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border shadow-sm rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</p>
                  <Badge variant="outline" className={`mt-1 capitalize font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </Badge>
                </Card>
                <Card className="p-4 bg-gray-50 border shadow-sm rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Items</p>
                  <p className="font-semibold text-gray-900">{orderDetails?.items?.length ?? 0}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border shadow-sm rounded-xl md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Shipping Address</p>
                  <p className="font-medium text-gray-900 whitespace-pre-line">{orderDetails?.address ?? selectedOrder.address ?? "N/A"}</p>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">Order Items</h3>
                {detailsLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0d3d2e]" />
                  </div>
                ) : (
                  <div className="border rounded-xl divide-y bg-white overflow-hidden shadow-sm">
                    {(orderDetails?.items ?? []).map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">{item.medicineName || "Unknown product"}</p>
                          {item.medicineSubName && (
                            <p className="text-xs text-gray-500 font-normal mt-0.5">{item.medicineSubName}</p>
                          )}
                          <p className="text-xs text-emerald-800 font-medium mt-1">Manufacturer: {item.companyName || "—"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full border">Qty {item.quantity}</span>
                        </div>
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
