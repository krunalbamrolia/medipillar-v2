import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import type { CartItem } from "@shared/schema";
import type { Medicine } from "@shared/types/catalog";

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const [address, setAddress] = useState("");

  const placeOrder = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsSuccess(true);
    },
    onError: () => {
      toast({ title: "Confirm Order Failed", description: "Something went wrong.", variant: "destructive" });
    }
  });

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d3d2e]" />
        </main>
      </div>
    );
  }

  if (!user || cartItems.length === 0) {
    setLocation("/cart");
    return null;
  }

  const enrichedItems = cartItems.map(item => {
    const med = medicines.find(m => m.id === item.medicineId);
    return { ...item, medicine: med };
  });

  const totalItems = enrichedItems.reduce((acc, item) => acc + item.quantity, 0);

  const handlePlaceOrder = () => {
    placeOrder.mutate();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-8 border-0 shadow-lg">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Order Placed!</h2>
            <p className="text-gray-500 mb-8">Your order has been successfully placed. We will notify you once it's confirmed.</p>
            <div className="flex flex-col gap-4">
              <Button onClick={() => setLocation("/orders")} className="bg-[#0d3d2e] hover:bg-[#0a5240]">
                View My Orders
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")}>
                Return Home
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto max-w-4xl px-4">
          <Button variant="ghost" className="mb-6" onClick={() => setLocation("/cart")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Card className="border-0 shadow-sm mb-6">
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                    <Input value={user?.name} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number</label>
                    <Input value={user?.phone} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Shipping Address</label>
                    <Input
                      placeholder="Enter your full address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className="focus:ring-[#0d3d2e]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                    {enrichedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-500">{item.quantity}x</span>
                          <span className="font-medium truncate max-w-[150px]">{item.medicine?.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Total items</span>
                      <span>{totalItems}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-[#0d3d2e] to-[#0a5240] h-12 text-lg hover:scale-[1.02] transition-transform"
                    onClick={handlePlaceOrder}
                    disabled={placeOrder.isPending || !address.trim()}
                  >
                    {placeOrder.isPending ? "Processing..." : "Confirm Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
