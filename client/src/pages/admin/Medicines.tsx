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
import { Plus, Edit, Pill, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cleanFormData, parseApiError } from "@/lib/formUtils";
import { SearchableCombobox } from "@/components/admin/SearchableCombobox";
import { insertMedicineSchema, type InsertMedicine } from "@shared/schema";
import type { Medicine, Company } from "@shared/types/catalog";
import type { PaginatedResult } from "@shared/types/database";
import { z } from "zod";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const medicineFormSchema = insertMedicineSchema
  .extend({
    subname: z.string().nullable().optional().transform((val) => val || null),
    description: z.string().nullable().optional().transform((val) => val || null),
    photo: z.string().nullable().optional().transform((val) => val || null),
    mgo: z.string().nullable().optional().transform((val) => val || ""),
    qty: z.string().nullable().optional().transform((val) => val || ""),
    sideeffects: z.string().nullable().optional().transform((val) => val || ""),
    usage: z.string().nullable().optional().transform((val) => val || ""),
  })
  .omit({ subcategoryId: true });

type MedicineForm = z.infer<typeof medicineFormSchema>;

type MedicineRow = Medicine & { companyName?: string; categoryName?: string };

export default function AdminMedicines() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const [medicineToDelete, setMedicineToDelete] = useState<MedicineRow | null>(null);
  const limit = 10;

  const form = useForm<MedicineForm>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: "",
      subname: "",
      description: "",
      photo: "",
      companyId: "",
      categoryId: "",
      mgo: "",
      qty: "",
      sideeffects: "",
      usage: "",
      status: "active",
    },
  });

  const { data, isLoading, isFetching } = useQuery<PaginatedResult<MedicineRow>>({
    queryKey: ["/api/medicines/paginated", debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/medicines/paginated?${params}`);
      if (!res.ok) throw new Error("Failed to fetch medicines");
      return res.json();
    },
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: categories = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["/api/categories"],
  });

  const companyOptions = companies.map((c) => ({ id: c.id, label: c.name }));
  const categoryOptions = categories.map((c) => ({ id: c.id, label: c.name }));

  const createMutation = useMutation({
    mutationFn: (payload: InsertMedicine) => apiRequest("POST", "/api/medicines", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines/paginated"] });
      toast({ title: "Medicine created successfully" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({
        title: "Could not create medicine",
        description: parseApiError(err.message),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: patch }: { id: string; data: Partial<Medicine> }) =>
      apiRequest("PATCH", `/api/medicines/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines/paginated"] });
      toast({ title: "Medicine updated successfully" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({
        title: "Could not update medicine",
        description: parseApiError(err.message),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/medicines/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines/paginated"] });
      toast({ title: "Medicine deleted" });
      setMedicineToDelete(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not delete medicine",
        description: parseApiError(err.message),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: MedicineForm) => {
    if (!values.companyId) {
      form.setError("companyId", { message: "Company is required" });
      return;
    }
    if (!values.categoryId) {
      form.setError("categoryId", { message: "Category is required" });
      return;
    }
    const cleaned = cleanFormData(values);
    if (editingMedicine) {
      updateMutation.mutate({ id: editingMedicine.id, data: cleaned });
    } else {
      createMutation.mutate(cleaned);
    }
  };

  const openCreate = () => {
    setEditingMedicine(null);
    form.reset({
      name: "",
      subname: "",
      description: "",
      photo: "",
      companyId: "",
      categoryId: "",
      mgo: "",
      qty: "",
      sideeffects: "",
      usage: "",
      status: "active",
    });
    setDialogOpen(true);
  };

  const openEdit = (medicine: MedicineRow) => {
    setEditingMedicine(medicine);
    form.reset({
      name: medicine.name,
      subname: medicine.subname || "",
      description: medicine.description || "",
      photo: medicine.photo || "",
      companyId: medicine.companyId,
      categoryId: medicine.categoryId || "",
      mgo: medicine.mgo || "",
      qty: medicine.qty || "",
      sideeffects: medicine.sideeffects || "",
      usage: medicine.usage || "",
      status: medicine.status,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingMedicine(null);
    form.reset({
      name: "",
      subname: "",
      description: "",
      photo: "",
      companyId: "",
      categoryId: "",
      mgo: "",
      qty: "",
      sideeffects: "",
      usage: "",
      status: "active",
    });
  };

  const medicines = data?.data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Medicines"
        description="Manage pharmaceutical products"
        actions={
          <Button onClick={openCreate} data-testid="button-add-medicine">
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
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
          placeholder="Search by name, category, or company..."
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMedicine ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicine Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter medicine name" data-testid="input-medicine-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subname</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" data-testid="input-medicine-subname" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <SearchableCombobox
                        value={field.value}
                        onChange={(id) => field.onChange(id)}
                        options={companyOptions}
                        placeholder="Select company"
                        searchPlaceholder="Search company..."
                        emptyText="No company found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <SearchableCombobox
                        value={field.value}
                        onChange={(id) => field.onChange(id)}
                        options={categoryOptions}
                        placeholder="Select category"
                        searchPlaceholder="Search category..."
                        emptyText="No category found."
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
                        placeholder="Enter description"
                        className="min-h-20 resize-none"
                        data-testid="input-medicine-description"
                        {...field}
                        value={field.value ?? ""}
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
                  data-testid="button-save-medicine"
                >
                  {editingMedicine ? "Update" : "Create"}
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
              itemLabel="medicines"
            />
          ) : null
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Medicine</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Loading medicines...
                </TableCell>
              </TableRow>
            ) : medicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              medicines.map((medicine) => (
                <TableRow key={medicine.id} data-testid={`row-medicine-${medicine.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                        {medicine.photo ? (
                          <img src={medicine.photo} alt={medicine.name} className="h-full w-full object-cover" />
                        ) : (
                          <Pill className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium" data-testid={`text-medicine-name-${medicine.id}`}>
                          {medicine.name}
                        </p>
                        {medicine.subname && (
                          <p className="text-xs text-muted-foreground">{medicine.subname}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {medicine.companyName ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {medicine.categoryName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(medicine)}
                        data-testid={`button-edit-medicine-${medicine.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setMedicineToDelete(medicine)}
                        data-testid={`button-delete-medicine-${medicine.id}`}
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

      <AlertDialog open={!!medicineToDelete} onOpenChange={(open) => !open && setMedicineToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{medicineToDelete?.name}</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => medicineToDelete && deleteMutation.mutate(medicineToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
