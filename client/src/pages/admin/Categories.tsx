import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { parseApiError } from "@/lib/formUtils";
import { insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import type { Category, InsertCategory, PaginatedResult } from "@/api/types";
import { getCategoriesPaginatedApi, createCategoryApi, deleteCategoryApi } from "@/api/categories";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const categoryFormSchema = insertCategorySchema.pick({ name: true });
type CategoryForm = z.infer<typeof categoryFormSchema>;

interface CategoryRow {
  id: string;
  name: string;
  createdAt: string;
  order: number;
}

export default function AdminCategories() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const limit = 10;

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "" },
  });

  const { data, isLoading, isFetching } = useQuery<PaginatedResult<CategoryRow>>({
    queryKey: ["/api/categories/paginated", debouncedSearch, page],
    queryFn: () => getCategoriesPaginatedApi({ page, limit, search: debouncedSearch }) as any,
  });

  const createMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/paginated"] });
      toast({ title: "Category created successfully" });
      setDialogOpen(false);
      form.reset();
    },
    onError: (err: Error) => {
      toast({
        title: "Could not create category",
        description: parseApiError(err.message),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/paginated"] });
      toast({ title: "Category deleted" });
    },
  });

  const onSubmit = (values: CategoryForm) => {
    createMutation.mutate({ name: values.name, order: data?.total ?? 0 });
  };

  const categories = data?.data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Manage product categories"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-category">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" data-testid="input-category-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-category">
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4">
        <AdminSearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search categories by name..."
        />
      </div>

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
              itemLabel="categories"
            />
          ) : null
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                  <TableCell className="font-medium" data-testid={`text-category-name-${category.id}`}>
                    {category.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(category.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
}
