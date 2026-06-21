import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, UserCheck, UserX, Mail, Phone, Package, History } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { PaginatedResult, Profile, ProfileWithOrders } from "@/api/types";
import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { UserOrderCard } from "@/components/admin/UserOrderCard";
import { getUsersApi, getAdminUserDetailApi, updateUserStatusApi } from "@/api/users";

type UserRow = Profile & { orderCount: number };

export default function AdminUsers() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const limit = 10;

  const { data, isLoading, isFetching } = useQuery<PaginatedResult<UserRow>>({
    queryKey: ["/api/admin/users", debouncedSearch, page],
    queryFn: () => getUsersApi({ page, limit, search: debouncedSearch }),
  });

  const { data: userDetail, isLoading: detailLoading } = useQuery<ProfileWithOrders>({
    queryKey: ["/api/admin/users", selectedUserId, "detail"],
    queryFn: () => getAdminUserDetailApi(selectedUserId!),
    enabled: !!selectedUserId && dialogOpen,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatusApi(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      if (selectedUserId) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users", selectedUserId, "detail"] });
      }
      toast({ title: "User status updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const users = data?.data ?? [];

  const openUser = (id: string) => {
    setSelectedUserId(id);
    setDialogOpen(true);
  };

  return (
    <div>
      <AdminPageHeader title="Users" description="Manage registered customers and their orders" />

      <div className="mb-4">
        <AdminSearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name, phone, or email..."
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
              itemLabel="users"
            />
          ) : null
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Orders</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{user.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <span>{user.orderCount}</span>
                      {user.orderCount > 0 && (
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Link href={`/admin/users/${user.id}/orders`}>History</Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap sm:table-cell text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => openUser(user.id)}>
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      {user.isActive ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Deactivate"
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: user.id, isActive: false })}
                        >
                          <UserX className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Activate"
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: user.id, isActive: true })}
                        >
                          <UserCheck className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedUserId(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : userDetail ? (
            <div className="space-y-4">
              <Card className="space-y-2 border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">{userDetail.name}</p>
                  <Badge variant={userDetail.isActive ? "default" : "secondary"}>
                    {userDetail.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {userDetail.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {userDetail.email ?? "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Joined {format(new Date(userDetail.createdAt), "PPP")}
                </p>
              </Card>

              <div className="flex gap-2">
                {userDetail.isActive ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: userDetail.id, isActive: false })}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate User
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: userDetail.id, isActive: true })}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate User
                  </Button>
                )}
              </div>

              <Separator />

              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Package className="h-4 w-4" />
                    Recent Orders
                    {userDetail.orderCount > 0 && (
                      <span className="font-normal text-muted-foreground">
                        ({userDetail.orderCount} total)
                      </span>
                    )}
                  </h3>
                  {userDetail.orderCount > 0 && (
                    <Button asChild variant="ghost" size="sm" className="h-auto px-2 text-primary">
                      <Link href={`/admin/users/${userDetail.id}/orders`}>View all</Link>
                    </Button>
                  )}
                </div>

                {userDetail.orderCount === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders placed yet.</p>
                ) : (
                  <div className="space-y-2">
                    {userDetail.recentOrders.map((order) => (
                      <UserOrderCard key={order.id} order={order} compact />
                    ))}
                    <Button asChild variant="outline" size="sm" className="mt-1 w-full">
                      <Link href={`/admin/users/${userDetail.id}/orders`}>
                        <History className="mr-2 h-4 w-4" />
                        View full order history
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
