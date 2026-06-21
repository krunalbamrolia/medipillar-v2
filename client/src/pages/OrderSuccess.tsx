import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2, ShoppingBag, ArrowLeft, Calendar, MapPin, Hash } from "lucide-react";
import { getOrderByIdApi } from "@/api/orders";
import { format } from "date-fns";

export default function OrderSuccess() {
  const [, params] = useRoute("/order-success/:id");
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const orderId = params?.id;

  const { data: order, isLoading: orderLoading, error } = useQuery({
    queryKey: ["/api/orders", orderId],
    queryFn: () => getOrderByIdApi(orderId!),
    enabled: !!orderId && !!user,
  });

  const isLoading = authLoading || orderLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navigation />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="max-w-2xl w-full px-4 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navigation />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center p-8 border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-6">We couldn't retrieve the details for this order. It might not exist or you might not have permission to view it.</p>
            <Button onClick={() => setLocation("/")} className="w-full bg-[#0d3d2e] hover:bg-[#0a5240]">
              Return Home
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Format date safely
  let formattedDate = "";
  try {
    formattedDate = format(new Date(order.createdAt), "PPP p");
  } catch (e) {
    formattedDate = order.createdAt;
  }

  // Calculate total items
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto max-w-2xl px-4 animate-fade-in">
          {/* Header Card */}
          <Card className="border-0 shadow-md bg-white overflow-hidden mb-6 rounded-2xl">
            <div className="bg-gradient-to-r from-[#0d3d2e] to-[#0a5240] p-8 text-center text-white relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-300" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
              <p className="text-white/80 text-lg">Your order has been successfully placed.</p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Order ID</span>
                    <span className="text-sm font-bold text-gray-900">{order.id}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Placed On</span>
                    <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2 border-t pt-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Delivery Address</span>
                    <span className="text-sm font-medium text-gray-900">{order.address}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="border-0 shadow-md bg-white rounded-2xl mb-8">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl">Order Summary</CardTitle>
              <CardDescription>Items in this order</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead className="text-right pr-6 w-[120px]">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium py-3.5 pl-6">
                        <p>{item.medicineName}</p>
                        {item.medicineSubName && (
                          <p className="text-xs text-gray-400 font-normal">{item.medicineSubName}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3.5">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50/30 font-bold border-t-2">
                    <TableCell className="text-left text-base py-4 pl-6">Total Items</TableCell>
                    <TableCell className="text-right text-base text-[#0d3d2e] py-4 pr-6">
                      {totalItems}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => setLocation("/products")}
              className="flex-1 h-12 bg-[#0d3d2e] hover:bg-[#0a5240] text-white text-base rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/orders")}
              className="flex-1 h-12 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 text-base rounded-xl transition-all duration-300 font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              View My Orders
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
