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
import { getCartApi } from "@/api/cart";
import { getMedicinesApi } from "@/api/products";
import { createOrderApi } from "@/api/orders";

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    queryFn: getCartApi,
    enabled: !!user,
  });

  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
    queryFn: getMedicinesApi,
  });

  const [address, setAddress] = useState("");

  const placeOrder = useMutation({
    mutationFn: () => createOrderApi({ address }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setLocation(`/order-success/${order.id}`);
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
    if (placeOrder.isPending) return;
    placeOrder.mutate();
  };

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
