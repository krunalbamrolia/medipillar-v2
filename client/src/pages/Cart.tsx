import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import type { CartItem } from "@shared/schema";
import type { Medicine } from "@shared/types/catalog";

export default function Cart() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cart"] }),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-auth-modal"));
      }, 100);
      toast({
        title: "Authentication Required",
        description: "Please login to view your cart.",
      });
    }
  }, [user, authLoading, setLocation, toast]);

  if (authLoading || cartLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d3d2e]" />
        </main>
        <Footer />
      </div>
    );
  }

  const enrichedItems = cartItems.map(item => {
    const med = medicines.find(m => m.id === item.medicineId);
    return { ...item, medicine: med };
  });

  const totalItems = enrichedItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    if (enrichedItems.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto max-w-5xl px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>
          
          {enrichedItems.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-sm">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
              <Link href="/products">
                <Button className="bg-[#0d3d2e] hover:bg-[#0a5240]">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {enrichedItems.map((item) => (
                  <Card key={item.id} className="border-0 shadow-sm overflow-hidden">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {item.medicine?.photo ? (
                          <img src={item.medicine.photo} alt={item.medicine.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-gray-400">No Img</span>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-lg">{item.medicine?.name || "Unknown Product"}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.medicine?.subname}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => updateQuantity.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            disabled={item.quantity <= 1 || updateQuantity.isPending}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })}
                            disabled={updateQuantity.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem.mutate(item.id)}
                          disabled={removeItem.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-sm p-6 sticky top-24">
                  <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Total items</span>
                      <span>{totalItems}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-[#0d3d2e] to-[#0a5240] h-12 text-lg hover:scale-[1.02] transition-transform"
                    onClick={handleCheckout}
                  >
                    Confirm Order
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
