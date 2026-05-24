import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Building2, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cleanFormData, parseApiError } from "@/lib/formUtils";
import { z } from "zod";
import { Company, InsertCompany, insertCompanySchema } from "@shared/schema";
import type { PaginatedResult } from "@shared/types/database";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const companyFormSchema = insertCompanySchema;
type CompanyForm = z.infer<typeof companyFormSchema>;

export default function AdminCompanies() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const limit = 10;

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: { name: "", description: "", photo: "", status: "active" },
  });

  const { data, isLoading, isFetching } = useQuery<PaginatedResult<Company>>({
    queryKey: ["/api/companies/paginated", debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/companies/paginated?${params}`);
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: InsertCompany) => apiRequest("POST", "/api/companies", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/paginated"] });
      toast({ title: "Company created successfully" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({
        title: "Could not create company",
        description: parseApiError(err.message),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: patch }: { id: string; data: Partial<Company> }) =>
      apiRequest("PATCH", `/api/companies/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/paginated"] });
      toast({ title: "Company updated successfully" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({
        title: "Could not update company",
        description: parseApiError(err.message),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/companies/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/paginated"] });
      toast({ title: "Company deleted" });
      setCompanyToDelete(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not delete company",
        description: parseApiError(err.message),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CompanyForm) => {
    const cleaned = cleanFormData(values);
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data: cleaned });
    } else {
      createMutation.mutate(cleaned);
    }
  };

  const openCreate = () => {
    setEditingCompany(null);
    form.reset({ name: "", description: "", photo: "", status: "active" });
    setDialogOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    form.reset({
      name: company.name,
      description: company.description || "",
      photo: company.photo || "",
      status: company.status,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCompany(null);
    form.reset({ name: "", description: "", photo: "", status: "active" });
  };

  const companies = data?.data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Companies"
        description="Manage pharmaceutical companies and manufacturers"
        actions={
          <Button onClick={openCreate} data-testid="button-add-company">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        }
      />

      <div className="mb-4">
        <AdminSearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search companies by name..."
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCompany ? "Edit Company" : "Create Company"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" data-testid="input-company-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        data-testid="input-company-photo"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter company description"
                        className="min-h-24 resize-none"
                        data-testid="input-company-description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-company"
                >
                  {editingCompany ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AdminTableShell
        isFetching={isFetching && !isLoading}
        footer={
          data ? (
            <AdminPagination
              page={page}
              totalPages={data.totalPages}
              total={data.total}
              limit={limit}
              onPageChange={setPage}
              isLoading={isFetching}
              itemLabel="companies"
            />
          ) : null
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[72px]">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Loading companies...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No companies found.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                  <TableCell>
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {company.photo ? (
                        <img src={company.photo} alt={company.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium" data-testid={`text-company-name-${company.id}`}>
                    {company.name}
                  </TableCell>
                  <TableCell className="hidden max-w-xs lg:table-cell">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {company.description || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(company)}
                        data-testid={`button-edit-company-${company.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCompanyToDelete(company)}
                        data-testid={`button-delete-company-${company.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <AlertDialog open={!!companyToDelete} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete company?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{companyToDelete?.name}</strong> and all medicines
              linked to it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => companyToDelete && deleteMutation.mutate(companyToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
