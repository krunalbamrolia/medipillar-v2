import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Pill, ShoppingCart, MessageCircle, Plus, Minus } from "lucide-react";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type { Medicine, Company } from "@shared/types/catalog";
import { getMedicineByIdApi } from "@/api/products";
import { getCompanyByIdApi } from "@/api/companies";
import { addCartItemApi } from "@/api/cart";

export default function MedicineDetail() {
  const [, params] = useRoute("/medicine/:id");
  const [, setLocation] = useLocation();
  const medicineId = params?.id;
  const [quantity, setQuantity] = useState("1");
  const [cartQuantity, setCartQuantity] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medicine, isLoading: loadingMedicine } = useQuery<Medicine>({
    queryKey: ["/api/medicines", medicineId],
    queryFn: () => getMedicineByIdApi(medicineId!),
    enabled: !!medicineId,
  });

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/companies", medicine?.companyId],
    queryFn: () => getCompanyByIdApi(medicine!.companyId!),
    enabled: !!medicine?.companyId,
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ medicineId, quantity }: { medicineId: string; quantity: number }) =>
      addCartItemApi(medicineId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${cartQuantity}x ${medicine?.name} added to your shopping cart.`,
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!medicine) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate({ medicineId: medicine.id, quantity: cartQuantity });
  };

  const handleWhatsAppClick = () => {
    const trimmedQty = quantity.trim();
    if (!medicine || !trimmedQty) return;

    if (!/\d/.test(trimmedQty)) {
      alert("Please enter a valid quantity (e.g., 10, 5 boxes, etc.)");
      return;
    }

    const link = createWhatsAppLink(medicine.name, company?.name, trimmedQty);
    window.open(link, "_blank");
  };

  if (loadingMedicine) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
<main className="flex-1 pt-28 pb-12">
            <div className="container mx-auto max-w-6xl px-6">
              <Skeleton className="h-96 w-full mb-8" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
<main className="flex-1 pt-28 pb-12">
            <div className="container mx-auto max-w-6xl px-6 text-center">
              <p className="text-lg text-muted-foreground">Medicine not found</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-28 pb-12">
        <div className="container mx-auto max-w-6xl px-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(company ? `/company/${company.id}` : "/products")}
            className="mb-8"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div>
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {medicine.photo ? (
                    <img
                      src={medicine.photo}
                      alt={medicine.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Pill className="h-32 w-32 text-muted-foreground" />
                  )}
                </div>
              </Card>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{medicine.name}</h1>
              {medicine.subname && (
                <p className="text-xl text-muted-foreground mb-6">{medicine.subname}</p>
              )}

              {company && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                  <p className="text-lg font-medium">{company.name}</p>
                </div>
              )}

              {/* Specifications */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                  <dl className="space-y-3">
                    {medicine.mgo && (
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">MGO:</dt>
                        <dd className="col-span-2">{medicine.mgo}</dd>
                      </div>
                    )}
                    {medicine.qty && (
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="font-medium text-muted-foreground">Quantity:</dt>
                        <dd className="col-span-2">{medicine.qty}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Description */}
              {medicine.description && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {medicine.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Purchase / Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="border-2 border-emerald-200 bg-emerald-50/20 shadow-sm flex flex-col justify-between">
                  <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="h-5 w-5 text-[#0d3d2e]" />
                        <h3 className="font-semibold text-sm text-[#0d3d2e]">Add to Cart</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">Order online and get direct delivery</p>
                    </div>
                    <div className="space-y-3 mt-auto">
                      <div className="flex items-center border rounded-lg bg-white overflow-hidden shadow-sm h-10 w-full justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-full w-10 rounded-none border-r hover:bg-muted"
                          onClick={() => setCartQuantity(q => Math.max(1, q - 1))}
                          disabled={cartQuantity <= 1 || addToCartMutation.isPending}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-sm font-medium">{cartQuantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-full w-10 rounded-none border-l hover:bg-muted"
                          onClick={() => setCartQuantity(q => q + 1)}
                          disabled={addToCartMutation.isPending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleAddToCart}
                        disabled={addToCartMutation.isPending}
                        className="w-full bg-[#0d3d2e] hover:bg-[#0a5240] text-white font-semibold h-10 shadow-sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50/20 shadow-sm flex flex-col justify-between">
                  <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-sm text-green-800">Ask Query</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">Chat directly with us on WhatsApp</p>
                    </div>
                    <div className="space-y-3 mt-auto">
                      <div>
                        <Input
                          id="whatsapp-quantity"
                          type="text"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="e.g., 10 boxes, 100 strips"
                          className="h-10 text-sm border-green-200 bg-white focus:border-green-400 focus:ring-green-400"
                        />
                      </div>
                      <Button
                        onClick={handleWhatsAppClick}
                        disabled={!quantity.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ask on WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expandable Sections */}
              {(medicine.usage || medicine.sideeffects) && (
                <Accordion type="single" collapsible className="w-full">
                  {medicine.usage && (
                    <AccordionItem value="usage">
                      <AccordionTrigger className="text-lg font-medium">
                        Usage Instructions
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {medicine.usage}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {medicine.sideeffects && (
                    <AccordionItem value="side-effects">
                      <AccordionTrigger className="text-lg font-medium">
                        Side Effects
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {medicine.sideeffects}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
