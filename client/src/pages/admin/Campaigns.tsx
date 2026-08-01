import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminCampaigns, useDeleteCampaign, useDuplicateCampaign } from "@/hooks/useCampaigns";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Copy, Trash2, Megaphone } from "lucide-react";
import { format } from "date-fns";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function Campaigns() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useAdminCampaigns({
    page,
    limit: 10,
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    sortBy,
  });

  const deleteMutation = useDeleteCampaign();
  const duplicateMutation = useDuplicateCampaign();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({
        title: "Campaign Deleted",
        description: "The campaign has been successfully deleted.",
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMutation.mutateAsync(id);
      toast({
        title: "Campaign Duplicated",
        description: "A copy of the campaign has been created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate campaign.",
        variant: "destructive",
      });
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80">Active</Badge>;
      case "scheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100/80">Scheduled</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-gray-500">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Campaigns"
        description="Manage promotional banners and campaigns"
        actions={
          <Button onClick={() => setLocation("/admin/campaigns/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          <div className="w-72">
            <AdminSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search campaigns..."
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="start_date">Start Date</SelectItem>
              <SelectItem value="display_order">Display Order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AdminTableShell
        headers={["Title", "Status", "Timeline", "Media", "Order", "Actions"]}
        isLoading={isLoading}
        isEmpty={!data?.data.length}
      >
        {data?.data.map((campaign) => (
          <tr key={campaign.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td className="p-4">
              <div className="font-medium text-primary">{campaign.title}</div>
              {campaign.description && (
                <div className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
                  {campaign.description}
                </div>
              )}
            </td>
            <td className="p-4">
              <StatusBadge status={campaign.status} />
            </td>
            <td className="p-4">
              <div className="text-sm">
                <div className="text-muted-foreground text-xs">Start:</div>
                <div>{format(new Date(campaign.startDate), "PPp")}</div>
                <div className="text-muted-foreground text-xs mt-1">End:</div>
                <div>{format(new Date(campaign.endDate), "PPp")}</div>
              </div>
            </td>
            <td className="p-4">
              <Badge variant="secondary">{campaign.media.length} items</Badge>
            </td>
            <td className="p-4 font-mono text-sm">
              {campaign.displayOrder}
            </td>
            <td className="p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation(`/admin/campaigns/${campaign.id}/edit`)}
                  title="Edit Campaign"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDuplicate(campaign.id)}
                  title="Duplicate Campaign"
                  disabled={duplicateMutation.isPending}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteId(campaign.id)}
                  title="Delete Campaign"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTableShell>

      {data && data.totalPages > 1 && (
        <AdminPagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
