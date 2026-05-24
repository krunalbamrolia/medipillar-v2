import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MedicineModal } from "@/components/MedicineModal";
import { QuantityDialog } from "@/components/QuantityDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Pill, Building2, MessageCircle, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import type { Company, Medicine } from "@shared/types/catalog";
import type { Category } from "@shared/schema";

interface PaginatedMedicines {
  data: Medicine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CompanyDetail() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/company/:id");
  const [, setLocation] = useLocation();
  const companyId = params?.id;
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [selectedMedicineForQuery, setSelectedMedicineForQuery] = useState<Medicine | null>(null);

  useEffect(() => {
    if (selectedMedicineId) {
      setModalOpen(true);
    }
  }, [selectedMedicineId]);

  useEffect(() => {
    if (!modalOpen) {
      setSelectedMedicineId(null);
    }
  }, [modalOpen]);

  const { data: company, isLoading: loadingCompany } = useQuery<Company>({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId,
  });

  const { data: paginatedMedicines, isLoading: loadingMedicines, isFetching } = useQuery<PaginatedMedicines>({
    queryKey: ["/api/medicines/paginated", companyId, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        companyId: companyId!,
        page: String(page),
        limit: String(limit),
        status: "active"
      });
      const res = await fetch(`/api/medicines/paginated?${params}`);
      return res.json();
    },
    enabled: !!companyId,
  });

  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", company?.categoryId],
    enabled: !!company?.categoryId,
  });

  const companyMedicines = paginatedMedicines?.data || [];
  const totalMedicines = paginatedMedicines?.total || 0;
  const totalPages = paginatedMedicines?.totalPages || 1;

  const addToCartMutation = useMutation({
    mutationFn: async ({ medicineId, quantity }: { medicineId: string; quantity: number }) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId, quantity }),
      });
      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to add to cart");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      const medName = companyMedicines.find((m) => m.id === variables.medicineId)?.name ?? "item";
      toast({
        title: "Added to Cart",
        description: `1x ${medName} added to your cart.`,
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

  const handleMedicineClick = (medicineId: string) => {
    setSelectedMedicineId(medicineId);
  };

  const handleAddToCart = (e: React.MouseEvent, medicineId: string) => {
    e.stopPropagation();

    if (!user) {
      sessionStorage.setItem(
        "pending_cart_action",
        JSON.stringify({ medicineId, quantity: 1 })
      );
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
      toast({
        title: "Login required",
        description: "Please sign in to add this item. It will be added automatically after login.",
      });
      return;
    }

    addToCartMutation.mutate({ medicineId, quantity: 1 });
  };

  const handleAskQueryClick = (e: React.MouseEvent, medicine: Medicine) => {
    e.stopPropagation();
    setSelectedMedicineForQuery(medicine);
    setQuantityDialogOpen(true);
  };

  if (loadingCompany) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-28 pb-12">
          <div className="container mx-auto max-w-7xl px-6">
            <Skeleton className="h-10 w-40 mb-8" />
            <Skeleton className="h-48 w-full mb-8" />
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-28 pb-12">
          <div className="container mx-auto max-w-7xl px-6 text-center">
            <p className="text-lg text-muted-foreground">Company not found</p>
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
        <div className="container mx-auto max-w-7xl px-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/products")}
            className="mb-8"
            data-testid="button-back-to-products"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>

          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-32 h-32 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {company.photo ? (
                  <img
                    src={company.photo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3">{company.name}</h1>
                {category && (
                  <div className="mb-4">
                    <Badge variant="secondary">{category.name}</Badge>
                  </div>
                )}
                <p className="text-lg text-muted-foreground">
                  {company.description || "No description available"}
                </p>
              </div>
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-1">Our Medicines</h2>
                <p className="text-muted-foreground">{totalMedicines} products available</p>
              </div>
            </div>

            {loadingMedicines ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : companyMedicines.length === 0 ? (
              <Card className="p-16">
                <div className="flex flex-col items-center justify-center text-center">
                  <Pill className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium text-muted-foreground">No medicines available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This company doesn't have any medicines listed yet
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden relative">
                  {isFetching && !loadingMedicines && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d3d2e]"></div>
                    </div>
                  )}
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="w-[300px]">Medicine Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companyMedicines.map((medicine) => (
                        <TableRow
                          key={medicine.id}
                          className="cursor-pointer hover:bg-gray-50/80 transition-colors group"
                          onClick={() => handleMedicineClick(medicine.id)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {medicine.photo ? (
                                  <img src={medicine.photo} alt={medicine.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Pill className="h-5 w-5 text-emerald-600" />
                                )}
                              </div>
                              <div>
                                <span className="text-gray-900 group-hover:text-[#0d3d2e] transition-colors font-medium">
                                  {medicine.name}
                                </span>
                                {medicine.subname && (
                                  <p className="text-xs text-muted-foreground">{medicine.subname}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="text-sm text-muted-foreground truncate">
                              {medicine.description || "No description"}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 w-9 p-0 border-2 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-300"
                                onClick={(e) => handleAddToCart(e, medicine.id)}
                                disabled={addToCartMutation.isPending}
                                title="Add to Cart"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => handleAskQueryClick(e, medicine)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                Ask Query
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 px-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalMedicines)} of {totalMedicines} medicines
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isFetching}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              className={page === pageNum ? "bg-[#0d3d2e]" : ""}
                              onClick={() => setPage(pageNum)}
                              disabled={isFetching}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isFetching}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {selectedMedicineId && (
        <MedicineModal
          medicineId={selectedMedicineId}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}

      {selectedMedicineForQuery && (
        <QuantityDialog
          open={quantityDialogOpen}
          onOpenChange={(open) => {
            setQuantityDialogOpen(open);
            if (!open) setSelectedMedicineForQuery(null);
          }}
          medicineName={selectedMedicineForQuery.name}
          companyName={company?.name}
        />
      )}

      <Footer />
    </div>
  );
}
