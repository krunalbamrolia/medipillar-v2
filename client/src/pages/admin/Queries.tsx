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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, MessageSquare, User, Phone, PhoneCall, Mail, ExternalLink, CheckCircle, RefreshCw } from "lucide-react";
import type { PaginatedResult, Query } from "@shared/types/database";
import { apiRequest } from "@/lib/queryClient";

export default function AdminQueries() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
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
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/queries/${id}/resolve`, { resolved });
      return res.json() as Promise<Query>;
    },
    onSuccess: (updatedQuery: Query) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/queries"] });
      // If the currently viewed query is updated, reflect it in the details modal
      if (selectedQuery && selectedQuery.id === updatedQuery.id) {
        setSelectedQuery(updatedQuery);
      }
      toast({ title: updatedQuery.resolved ? "Query marked resolved" : "Query reopened" });
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
          placeholder="Search queries by name, email, phone..."
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
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedQuery(q)}
                        className="flex items-center gap-1.5"
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant={q.resolved ? "secondary" : "default"}
                        onClick={() =>
                          resolveMutation.mutate({ id: q.id, resolved: !q.resolved })
                        }
                      >
                        {q.resolved ? "Reopen" : "Resolve"}
                      </Button>
                    </div>
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

      {/* View Details Dialog */}
      <Dialog open={selectedQuery !== null} onOpenChange={(open) => !open && setSelectedQuery(null)}>
        {selectedQuery && (
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                <MessageSquare className="h-6 w-6 text-primary" />
                Query Details
              </DialogTitle>
              <DialogDescription>
                Submitted on {new Date(selectedQuery.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Status and Toggle Action */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Status</span>
                  <Badge variant={selectedQuery.resolved ? "secondary" : "default"} className="mt-1 text-sm px-3 py-0.5 font-medium">
                    {selectedQuery.resolved ? "Resolved" : "Open"}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant={selectedQuery.resolved ? "outline" : "default"}
                  className="flex items-center gap-1.5"
                  onClick={() =>
                    resolveMutation.mutate({ id: selectedQuery.id, resolved: !selectedQuery.resolved })
                  }
                >
                  {selectedQuery.resolved ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Reopen Query
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Mark as Resolved
                    </>
                  )}
                </Button>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> Sender Name
                  </span>
                  <p className="text-base font-semibold">{selectedQuery.name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{selectedQuery.phone}</p>
                    <a
                      href={`tel:${selectedQuery.phone}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-background hover:bg-muted text-muted-foreground transition-colors hover:text-primary"
                      title="Call Phone Number"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{selectedQuery.email || "No email provided"}</p>
                    {selectedQuery.email && (
                      <a
                        href={`mailto:${selectedQuery.email}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-background hover:bg-muted text-muted-foreground transition-colors hover:text-primary"
                        title="Send Email"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2 border-t pt-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Message Submission</span>
                <div className="rounded-lg border bg-muted/30 p-4 max-h-[220px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-medium">
                  {selectedQuery.message}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
