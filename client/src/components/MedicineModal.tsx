import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Pill, Package, AlertCircle, Info, Building2, MessageCircle, ShoppingCart, Plus, Minus } from "lucide-react";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type { Medicine, Company } from "@shared/types/catalog";
import { getMedicineByIdApi } from "@/api/products";
import { getCompanyByIdApi } from "@/api/companies";
import { addCartItemApi } from "@/api/cart";

interface MedicineModalProps {
  medicineId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MedicineModal({ medicineId, open, onOpenChange }: MedicineModalProps) {
  const [quantity, setQuantity] = useState("1");
  const [cartQuantity, setCartQuantity] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: medicine, isLoading, isError } = useQuery<Medicine>({
    queryKey: ["/api/medicines", medicineId],
    queryFn: () => getMedicineByIdApi(medicineId!),
    enabled: !!medicineId && open,
  });

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/companies", medicine?.companyId],
    queryFn: () => getCompanyByIdApi(medicine!.companyId!),
    enabled: !!medicine?.companyId && open,
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ medicineId, quantity }: { medicineId: string; quantity: number }) =>
      addCartItemApi(medicineId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${cartQuantity}x ${medicine?.name ?? "item"} added to your cart.`,
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not add to cart",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleWhatsAppClick = () => {
    const trimmedQty = quantity.trim();
    if (!medicine || !trimmedQty) return;

    // Simple validation: ensure it contains at least one number
    if (!/\d/.test(trimmedQty)) {
      alert("Please enter a valid quantity (e.g., 10, 5 boxes, etc.)");
      return;
    }

    const link = createWhatsAppLink(medicine.name, company?.name, trimmedQty);
    window.open(link, "_blank");
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-0 gap-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-muted/20 [&::-webkit-scrollbar-thumb]:bg-[#0d3d2e] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#0a5240]">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-64 w-full rounded-t-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 px-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">Failed to load medicine details</p>
          </div>
        ) : medicine ? (
          <div className="flex flex-col">
            <div className="relative w-full aspect-square bg-gradient-to-br from-muted/30 to-muted overflow-hidden">
              {medicine.photo ? (
                <img
                  src={medicine.photo}
                  alt={medicine.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Pill className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}

              {company && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Manufactured by</span>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 ml-auto">
                        {company.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-[#0d3d2e]/10 border border-[#0d3d2e]/20">
                    <Pill className="h-4 w-4 text-[#0d3d2e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold leading-tight">{medicine.name}</h2>
                    {medicine.subname && (
                      <p className="text-sm text-muted-foreground mt-1">{medicine.subname}</p>
                    )}
                  </div>
                </div>
              </div>

              {medicine.description && (
                <Card className="border shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-[#0d3d2e]" />
                      <h3 className="font-semibold text-sm">Description</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {medicine.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {(medicine.mgo || medicine.qty) && (
                <Card className="border shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-[#0d3d2e]" />
                      <h3 className="font-semibold text-sm">Specifications</h3>
                    </div>
                    <div className="space-y-1.5">
                      {medicine.mgo && (
                        <div className="flex justify-between items-center p-2 rounded bg-muted/40 text-xs">
                          <span className="font-medium">MGO</span>
                          <span className="font-semibold">{medicine.mgo}</span>
                        </div>
                      )}
                      {medicine.qty && (
                        <div className="flex justify-between items-center p-2 rounded bg-muted/40 text-xs">
                          <span className="font-medium">Quantity</span>
                          <span className="font-semibold">{medicine.qty}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(medicine.usage || medicine.sideeffects) && (
                <Card className="border shadow-sm">
                  <CardContent className="p-4">
                    <Accordion type="single" collapsible className="w-full">
                      {medicine.usage && (
                        <AccordionItem value="usage" className="border-b">
                          <AccordionTrigger className="text-sm font-semibold hover:text-[#0d3d2e] py-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded bg-[#0d3d2e]/10">
                                <Info className="h-3.5 w-3.5 text-[#0d3d2e]" />
                              </div>
                              Usage Instructions
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-2 pb-3">
                            {medicine.usage}
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {medicine.sideeffects && (
                        <AccordionItem value="side-effects" className="border-none">
                          <AccordionTrigger className="text-sm font-semibold hover:text-[#0d3d2e] py-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded bg-[#0d3d2e]/10">
                                <AlertCircle className="h-3.5 w-3.5 text-[#0d3d2e]" />
                              </div>
                              Side Effects
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-2 pb-3">
                            {medicine.sideeffects}
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2 border-green-200 bg-green-50/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-sm text-green-800">Ask Query on WhatsApp</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="quantity" className="text-xs text-green-700 font-medium">
                        Quantity Required <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g., 10 boxes, 100 strips"
                        className="mt-1 h-9 text-sm border-green-200 focus:border-green-400 focus:ring-green-400"
                      />
                    </div>
                    <Button
                      onClick={handleWhatsAppClick}
                      disabled={!quantity.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Ask Query on WhatsApp
                    </Button>
                    <p className="text-xs text-green-600 text-center">
                      Click to chat with us directly on WhatsApp
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-200 bg-emerald-50/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="h-5 w-5 text-[#0d3d2e]" />
                    <h3 className="font-semibold text-sm text-[#0d3d2e]">Add to Cart</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 border rounded-lg bg-white overflow-hidden shadow-sm h-10 w-full">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-full w-10 rounded-none border-r hover:bg-muted"
                        onClick={() => setCartQuantity((q) => Math.max(1, q - 1))}
                        disabled={cartQuantity <= 1 || addToCartMutation.isPending}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-sm font-medium">{cartQuantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-full w-10 rounded-none border-l hover:bg-muted"
                        onClick={() => setCartQuantity((q) => q + 1)}
                        disabled={addToCartMutation.isPending}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        if (!medicine) return;
                        if (!user) {
                          sessionStorage.setItem(
                            "pending_cart_action",
                            JSON.stringify({ medicineId: medicine.id, quantity: cartQuantity })
                          );
                          window.dispatchEvent(new CustomEvent("open-auth-modal"));
                          toast({
                            title: "Login required",
                            description: "Please sign in to add this item. It will be added automatically after login.",
                          });
                          onOpenChange(false);
                          return;
                        }
                        addToCartMutation.mutate({ medicineId: medicine.id, quantity: cartQuantity });
                      }}
                      disabled={addToCartMutation.isPending}
                      className="w-full bg-[#0d3d2e] hover:bg-[#0a5240] text-white font-semibold h-10 shadow-sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="p-3 rounded-full bg-muted/30 w-fit mx-auto mb-3">
              <Pill className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Medicine not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
