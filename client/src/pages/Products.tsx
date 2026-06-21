import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MedicineModal } from "@/components/MedicineModal";
import { QuantityDialog } from "@/components/QuantityDialog";
import { SearchableCombobox } from "@/components/admin/SearchableCombobox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  ShoppingCart,
  MessageCircle,
  X,
  Pill,
  ArrowRight,
} from "lucide-react";
import type { Company, Category, PaginatedResult } from "@/api/types";
import { getCompaniesApi } from "@/api/companies";
import { getCategoriesApi } from "@/api/categories";
import { getMedicinesPaginatedApi } from "@/api/products";
import { addCartItemApi } from "@/api/cart";
import { getCompanyLogoUrl } from "@/lib/companyLogo";

interface MedicineWithRelations {
  id: string;
  name: string;
  subname: string;
  subName?: string;
  description: string;
  companyId: string;
  categoryId: string;
  photo?: string;
  companyName: string;
  categoryName: string;
}

interface PaginatedMedicineResponse {
  data: MedicineWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ViewMode = "products" | "companies";

function getViewFromSearch(): ViewMode {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "companies" ? "companies" : "products";
  } catch {
    return "products";
  }
}

export default function Products() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Read view from URL on every render (wouter keeps this reactive)
  const currentView: ViewMode = getViewFromSearch();

  const setView = (view: ViewMode) => {
    if (view === "companies") {
      setLocation("/products?view=companies");
    } else {
      setLocation("/products");
    }
  };

  // Products filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Companies search & pagination
  const [companySearch, setCompanySearch] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const companyLimit = 10;

  // Selected medicine for detailed modal
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Selected medicine for WhatsApp Quantity Dialog
  const [whatsappMedicine, setWhatsappMedicine] = useState<{ name: string; companyName?: string } | null>(null);
  const [whatsappOpen, setWhatsappOpen] = useState(false);

  // Fetch companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    queryFn: getCompaniesApi,
  });
  const activeCompanies = companies.filter((c) => c.status === "active");

  // Filter companies by search query
  const filteredCompanies = companySearch.trim()
    ? activeCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(companySearch.toLowerCase())
    )
    : activeCompanies;

  // Client-side pagination for companies
  const companyTotalPages = Math.max(1, Math.ceil(filteredCompanies.length / companyLimit));
  const pagedCompanies = filteredCompanies.slice(
    (companyPage - 1) * companyLimit,
    companyPage * companyLimit
  );

  // Reset company page when search changes
  useEffect(() => {
    setCompanyPage(1);
  }, [companySearch]);

  // Fetch categories for filters
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getCategoriesApi,
  });

  // Fetch paginated medicines (only when in products view)
  const { data: paginatedData, isLoading, isFetching } = useQuery<PaginatedResult<MedicineWithRelations>>({
    queryKey: [
      "/api/medicines/paginated",
      selectedCompanyId,
      selectedCategoryId,
      searchQuery,
      sortBy,
      page,
    ],
    queryFn: () => getMedicinesPaginatedApi({
      page,
      limit,
      companyId: selectedCompanyId !== "all" ? selectedCompanyId : undefined,
      categoryId: selectedCategoryId !== "all" ? selectedCategoryId : undefined,
      search: searchQuery,
      sortBy,
    }) as any,
    enabled: currentView === "products",
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCompanyId, selectedCategoryId, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCompanyId("all");
    setSelectedCategoryId("all");
    setSortBy("newest");
    setPage(1);
  };

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: ({ medicineId, quantity }: { medicineId: string; quantity: number }) =>
      addCartItemApi(medicineId, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      const medName = paginatedData?.data.find((m) => m.id === variables.medicineId)?.name ?? "item";
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

  const handleAddToCart = (medicineId: string) => {
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

  const medicines = paginatedData?.data ?? [];
  const totalPages = paginatedData?.totalPages ?? 1;
  const total = paginatedData?.total ?? 0;

  // Prepare options for searchable dropdowns
  const companyOptions = [
    { id: "all", label: "All Companies" },
    ...activeCompanies.map((c) => ({ id: c.id, label: c.name })),
  ];

  const categoryOptions = [
    { id: "all", label: "All Categories" },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0d3d2e] via-[#0a5240] to-[#084434] py-20 pt-32">
        <div className="absolute inset-0">
          <Sparkles className="absolute top-24 left-20 h-6 w-6 text-yellow-400/40 animate-pulse" />
          <Sparkles className="absolute bottom-16 right-24 h-5 w-5 text-yellow-400/30 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-36 right-1/4 w-2 h-2 bg-yellow-400/50 rotate-45 animate-float" />
        </div>

        <div className="container mx-auto max-w-4xl px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white animate-fade-in-up">
            {currentView === "companies" ? (
              <>Our <span className="text-yellow-400">Companies</span></>
            ) : (
              <>Our <span className="text-yellow-400">Products</span></>
            )}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {currentView === "companies"
              ? "Explore our trusted pharmaceutical manufacturing partners"
              : "Browse our comprehensive catalog of pharmaceutical products and medical supplies"}
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-6">


          {/* ══════════════════════════════════════════════
              COMPANIES VIEW
          ══════════════════════════════════════════════ */}
          {currentView === "companies" && (
            <div className="animate-fade-in">
              {/* Search filter */}
              <div className="bg-white rounded-2xl shadow-md border p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Search Company</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by company name..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="pl-9 h-11 border-2 focus:border-[#0d3d2e] transition-all duration-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Button
                      onClick={() => setCompanySearch("")}
                      variant="outline"
                      disabled={!companySearch}
                      className="w-full h-11 border-2 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-300 rounded-xl flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Count */}
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-sm text-gray-500 font-medium">
                  {isLoadingCompanies
                    ? "Loading..."
                    : `Showing ${filteredCompanies.length === 0 ? 0 : (companyPage - 1) * companyLimit + 1}–${Math.min(companyPage * companyLimit, filteredCompanies.length)} of ${filteredCompanies.length} companies`}
                </p>
              </div>

              {/* Table */}
              {isLoadingCompanies ? (
                <div className="space-y-4 animate-pulse">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <Card className="p-12 text-center border-0 shadow-lg bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-[#0d3d2e]/10 text-[#0d3d2e] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No companies found</h3>
                    <p className="text-gray-500 mb-6">We couldn't find any companies matching your search.</p>
                    <Button onClick={() => setCompanySearch("")} className="bg-[#0d3d2e] hover:bg-[#0a5240] text-white font-semibold">
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700 py-4 w-[300px]">Company Name</TableHead>
                          <TableHead className="font-semibold text-gray-700 py-4">Description</TableHead>
                          <TableHead className="font-semibold text-gray-700 py-4 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagedCompanies.map((company) => (
                          <TableRow
                            key={company.id}
                            className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                            onClick={() => setLocation(`/company/${company.id}`)}
                          >
                            <TableCell className="py-4 font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  <img
                                    src={getCompanyLogoUrl(company.name, company.photo)}
                                    alt={company.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-gray-900 group-hover:text-[#0d3d2e] transition-colors font-semibold">
                                  {company.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 max-w-[400px]">
                              <p className="text-sm text-gray-500 truncate">
                                {company.description || "No description available"}
                              </p>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1 text-[#0d3d2e] font-medium text-sm group-hover:translate-x-1 transition-transform">
                                View <ArrowRight className="h-4 w-4" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {companyTotalPages > 1 && (
                    <div className="flex items-center justify-between p-6 border-t bg-gray-50/50">
                      <p className="text-sm text-muted-foreground">
                        Showing {(companyPage - 1) * companyLimit + 1}–{Math.min(companyPage * companyLimit, filteredCompanies.length)} of {filteredCompanies.length} companies
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCompanyPage((p) => Math.max(1, p - 1))}
                          disabled={companyPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, companyTotalPages) }, (_, i) => {
                            let pageNum: number;
                            if (companyTotalPages <= 5) pageNum = i + 1;
                            else if (companyPage <= 3) pageNum = i + 1;
                            else if (companyPage >= companyTotalPages - 2) pageNum = companyTotalPages - 4 + i;
                            else pageNum = companyPage - 2 + i;
                            return (
                              <Button
                                key={pageNum}
                                variant={companyPage === pageNum ? "default" : "outline"}
                                size="sm"
                                className={companyPage === pageNum ? "bg-[#0d3d2e] hover:bg-[#0a5240] text-white" : ""}
                                onClick={() => setCompanyPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCompanyPage((p) => Math.min(companyTotalPages, p + 1))}
                          disabled={companyPage === companyTotalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              PRODUCTS VIEW
          ══════════════════════════════════════════════ */}
          {currentView === "products" && (
            <div className="animate-fade-in">
              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-md border p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Search Product</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-11 border-2 focus:border-[#0d3d2e] transition-all duration-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Manufacturer (Company)</label>
                    <SearchableCombobox
                      value={selectedCompanyId}
                      onChange={setSelectedCompanyId}
                      options={companyOptions}
                      placeholder="Select Company"
                      searchPlaceholder="Search Company..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Category</label>
                    <SearchableCombobox
                      value={selectedCategoryId}
                      onChange={setSelectedCategoryId}
                      options={categoryOptions}
                      placeholder="Select Category"
                      searchPlaceholder="Search Category..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-11 border-2 focus:border-[#0d3d2e] rounded-xl font-medium bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Product Name (A → Z)</SelectItem>
                        <SelectItem value="name-desc">Product Name (Z → A)</SelectItem>
                        <SelectItem value="price-asc">Price (Low → High)</SelectItem>
                        <SelectItem value="price-desc">Price (High → Low)</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Button
                      onClick={handleResetFilters}
                      variant="outline"
                      className="w-full h-11 border-2 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-300 rounded-xl flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                {isFetching && !isLoading && (
                  <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d3d2e]" />
                  </div>
                )}

                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                  </div>
                ) : medicines.length === 0 ? (
                  <Card className="p-12 text-center border-0 shadow-lg bg-white rounded-2xl">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-[#0d3d2e]/10 text-[#0d3d2e] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Pill className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No medicines found</h3>
                      <p className="text-gray-500 mb-6">We couldn't find any products matching your search criteria.</p>
                      <Button onClick={handleResetFilters} className="bg-[#0d3d2e] hover:bg-[#0a5240] text-white font-semibold">
                        Clear Search Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-semibold text-gray-700 py-4">Product Details</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4">Manufacturer</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4">Category</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4">Description</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medicines.map((medicine) => (
                            <TableRow
                              key={medicine.id}
                              className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                              onClick={() => {
                                setSelectedMedicineId(medicine.id);
                                setModalOpen(true);
                              }}
                            >
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {medicine.photo ? (
                                      <img src={medicine.photo} alt={medicine.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Pill className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-900 group-hover:text-[#0d3d2e] transition-colors block">
                                      {medicine.name}
                                    </span>
                                    {medicine.subname && (
                                      <span className="text-xs text-gray-500 block truncate max-w-[200px]">
                                        {medicine.subname}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell
                                className="py-4"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/company/${medicine.companyId}`);
                                }}
                              >
                                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-emerald-950 hover:underline transition-colors">
                                  <Building2 className="h-4 w-4 text-emerald-600" />
                                  {medicine.companyName}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge variant="secondary" className="bg-[#0d3d2e]/10 text-[#0d3d2e] hover:bg-[#0d3d2e]/15 border-0 font-medium">
                                  {medicine.categoryName}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 max-w-[300px]">
                                <p className="text-sm text-gray-500 truncate">
                                  {medicine.description || "No description available"}
                                </p>
                              </TableCell>
                              <TableCell className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-9 p-0 border-2 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-300"
                                    onClick={() => handleAddToCart(medicine.id)}
                                    title="Add to Cart"
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-9 bg-green-600 hover:bg-green-700 text-white font-medium px-3 rounded-lg transition-all duration-300 flex items-center gap-1.5 shadow-sm"
                                    onClick={() => {
                                      setWhatsappMedicine({
                                        name: medicine.name,
                                        companyName: medicine.companyName,
                                      });
                                      setWhatsappOpen(true);
                                    }}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="hidden sm:inline">Ask Query</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between p-6 border-t bg-gray-50/50">
                        <p className="text-sm text-muted-foreground">
                          Showing {(page - 1) * limit + 1} – {Math.min(page * limit, total)} of {total} products
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isFetching}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum: number;
                              if (totalPages <= 5) pageNum = i + 1;
                              else if (page <= 3) pageNum = i + 1;
                              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                              else pageNum = page - 2 + i;
                              return (
                                <Button
                                  key={pageNum}
                                  variant={page === pageNum ? "default" : "outline"}
                                  size="sm"
                                  className={page === pageNum ? "bg-[#0d3d2e] hover:bg-[#0a5240] text-white" : ""}
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
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isFetching}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {selectedMedicineId && (
        <MedicineModal
          medicineId={selectedMedicineId}
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setSelectedMedicineId(null);
          }}
        />
      )}

      {whatsappMedicine && (
        <QuantityDialog
          open={whatsappOpen}
          onOpenChange={(open) => {
            setWhatsappOpen(open);
            if (!open) setWhatsappMedicine(null);
          }}
          medicineName={whatsappMedicine.name}
          companyName={whatsappMedicine.companyName}
        />
      )}

      <Footer />
    </div>
  );
}
