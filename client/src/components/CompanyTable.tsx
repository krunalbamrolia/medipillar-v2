import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";
import type { Company } from "@shared/types/catalog";
import type { Category, Subcategory } from "@shared/schema";
import { getCompanyLogoUrl } from "@/lib/companyLogo";

import { Link, useLocation } from "wouter";

interface CompanyTableProps {
  companies: Company[];
  isLoading?: boolean;
}

export function CompanyTable({ companies, isLoading }: CompanyTableProps) {
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-muted mb-4 animate-pulse">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading companies...</p>
        </div>
      </Card>
    );
  }

  if (companies.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">No companies found</p>
          <p className="text-sm text-muted-foreground mt-1">Try selecting a different category</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-h-[600px] overflow-y-auto">
      <Table>
        <TableHeader className="bg-gray-50/50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[300px]">Company Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow 
              key={company.id}
              className="cursor-pointer hover:bg-gray-50/80 transition-colors group"
              onClick={() => setLocation(`/company/${company.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={getCompanyLogoUrl(company.name, company.photo)}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-gray-900 group-hover:text-[#0d3d2e] transition-colors">
                    {company.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-[400px]">
                <p className="text-sm text-muted-foreground truncate">
                  {company.description || "No description available"}
                </p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <div className="flex items-center gap-1 text-[#0d3d2e] font-medium text-sm group-hover:translate-x-1 transition-transform">
                    View <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
