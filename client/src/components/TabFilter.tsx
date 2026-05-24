import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, ChevronDown, X, Check } from "lucide-react";
import type { Category } from "@shared/schema";

interface TabFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  companyCounts: Record<string, number>;
  children: React.ReactNode;
}

export function TabFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  companyCounts,
  children,
}: TabFilterProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const selectedCategoryName =
    selectedCategory === "all"
      ? "All Products"
      : categories.find((c) => c.id === selectedCategory)?.name || "All";

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    setMobileFilterOpen(false);
  };

  const clearFilters = () => onCategoryChange("all");
  const hasActiveFilters = selectedCategory !== "all";

  return (
    <div className="space-y-6">
      <div className="hidden md:block rounded-xl border bg-white p-3 shadow-sm">
        <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-1">
            <TabsTrigger
              value="all"
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-[#0d3d2e] data-[state=active]:text-white"
              data-testid="tab-category-all"
            >
              All Products
              <Badge
                variant="secondary"
                className="ml-1 text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                {companyCounts.all || 0}
              </Badge>
            </TabsTrigger>
            {sortedCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-[#0d3d2e] data-[state=active]:text-white"
                data-testid={`tab-category-${category.id}`}
              >
                {category.name}
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  {companyCounts[category.id] || 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="md:hidden">
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full justify-between rounded-xl border-2 hover:border-[#0d3d2e]/30"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#0d3d2e]" />
                <span className="font-medium">{selectedCategoryName}</span>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Badge className="bg-[#0d3d2e] text-xs text-white">1</Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl">Filter by Category</SheetTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#0d3d2e]">
                    <X className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="max-h-[calc(60vh-100px)] space-y-2 overflow-y-auto py-4">
              <button
                onClick={() => handleCategorySelect("all")}
                className={`flex w-full items-center justify-between rounded-xl p-3 transition-all ${
                  selectedCategory === "all"
                    ? "bg-[#0d3d2e] text-white"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span className="font-medium">All Products</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={selectedCategory === "all" ? "secondary" : "outline"}
                    className={selectedCategory === "all" ? "bg-white/20 text-white" : ""}
                  >
                    {companyCounts.all || 0}
                  </Badge>
                  {selectedCategory === "all" && <Check className="h-4 w-4" />}
                </div>
              </button>
              {sortedCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 transition-all ${
                    selectedCategory === category.id
                      ? "bg-[#0d3d2e] text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={selectedCategory === category.id ? "secondary" : "outline"}
                      className={selectedCategory === category.id ? "bg-white/20 text-white" : ""}
                    >
                      {companyCounts[category.id] || 0}
                    </Badge>
                    {selectedCategory === category.id && <Check className="h-4 w-4" />}
                  </div>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}
