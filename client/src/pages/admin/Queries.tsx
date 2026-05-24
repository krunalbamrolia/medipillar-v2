import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { PaginatedResult, Query } from "@shared/types/database";
import { apiRequest } from "@/lib/queryClient";

export default function AdminQueries() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResult<Query>>({
    queryKey: ["/api/admin/queries", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/admin/queries?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load queries");
      return res.json();
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      apiRequest("PATCH", `/api/admin/queries/${id}/resolve`, { resolved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/queries"] });
      toast({ title: "Query updated" });
    },
  });

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Queries</h1>
          <p className="text-muted-foreground">Contact form & medicine inquiries</p>
        </div>
        <Input
          placeholder="Search queries..."
          className="max-w-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.name}</TableCell>
                  <TableCell>{q.phone}</TableCell>
                  <TableCell>{q.email || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">{q.message}</TableCell>
                  <TableCell>{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={q.resolved ? "secondary" : "default"}>
                      {q.resolved ? "Resolved" : "Open"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        resolveMutation.mutate({ id: q.id, resolved: !q.resolved })
                      }
                    >
                      {q.resolved ? "Reopen" : "Mark resolved"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Page {data?.page ?? 1} of {data?.totalPages ?? 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (data?.totalPages ?? 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
