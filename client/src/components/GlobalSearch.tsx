import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Pill, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Company, Medicine } from "@shared/types/catalog";

interface GlobalSearchProps {
  onMedicineSelect?: (medicineId: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  companies: Company[];
  medicines: Medicine[];
}

export function GlobalSearch({ onMedicineSelect, placeholder = "Search companies & medicines...", className = "" }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { companies: [], medicines: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      return res.json();
    },
    enabled: debouncedQuery.length > 0
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const filteredCompanies = searchResults?.companies || [];
  const filteredMedicines = searchResults?.medicines || [];

  const hasResults = filteredCompanies.length > 0 || filteredMedicines.length > 0;
  const isSearching = query.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCompanyClick = (companyId: string) => {
    setLocation(`/company/${companyId}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleMedicineClick = (medicineId: string) => {
    if (onMedicineSelect) {
      onMedicineSelect(medicineId);
    } else {
      setLocation(`/medicine/${medicineId}`);
    }
    setQuery("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || "Unknown Company";
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-12 pr-10 h-12 text-base rounded-xl border-2 border-gray-200 focus:border-[#0d3d2e] focus:ring-[#0d3d2e]/20 transition-all duration-300"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border shadow-2xl overflow-hidden z-[100] max-h-[70vh] overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 text-[#0d3d2e] mx-auto mb-3 animate-spin" />
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : !hasResults ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No results found for "{query}"</p>
                <p className="text-sm text-muted-foreground mt-1">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredCompanies.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Building2 className="h-4 w-4" />
                      Companies
                    </div>
                    <div className="space-y-1">
                      {filteredCompanies.map((company) => (
                        <motion.button
                          key={company.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleCompanyClick(company.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#0d3d2e]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0d3d2e]/20 transition-colors overflow-hidden">
                            {company.photo ? (
                              <img src={company.photo} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="h-5 w-5 text-[#0d3d2e]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate group-hover:text-[#0d3d2e] transition-colors">
                              {company.name}
                            </p>
                            {company.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {company.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">Company</Badge>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredMedicines.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Pill className="h-4 w-4" />
                      Medicines
                    </div>
                    <div className="space-y-1">
                      {filteredMedicines.map((medicine) => (
                        <motion.button
                          key={medicine.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleMedicineClick(medicine.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors overflow-hidden">
                            {medicine.photo ? (
                              <img src={medicine.photo} alt={medicine.name} className="w-full h-full object-cover" />
                            ) : (
                              <Pill className="h-5 w-5 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate group-hover:text-[#0d3d2e] transition-colors">
                              {medicine.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="truncate">{getCompanyName(medicine.companyId)}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200">Medicine</Badge>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
