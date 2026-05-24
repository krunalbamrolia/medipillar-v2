import { useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { OrderItemDetail } from "@shared/types/database";

interface OrderItemsTableProps {
  items: OrderItemDetail[];
  orderId?: string;
  showTracking?: boolean;
}

export function OrderItemsTable({ items, orderId, showTracking = true }: OrderItemsTableProps) {
  const { toast } = useToast();

  const trackMutation = useMutation({
    mutationFn: ({ itemId, tracked }: { itemId: string; tracked: boolean }) =>
      apiRequest("PATCH", `/api/admin/order-items/${itemId}/tracked`, { tracked }),
    onSuccess: () => {
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Failed to update tracking", variant: "destructive" });
    },
  });

  const trackedCount = items.filter((i) => i.tracked).length;

  const sortedItems = [...items].sort((a, b) => {
    if (a.tracked !== b.tracked) {
      return a.tracked ? 1 : -1;
    }
    return a.medicineName.localeCompare(b.medicineName);
  });

  return (
    <div>
      {showTracking && items.length > 0 && (
        <p className="mb-2 text-xs text-muted-foreground">
          {trackedCount} of {items.length} items marked as tracked
        </p>
      )}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {showTracking && <TableHead className="w-[48px]">Track</TableHead>}
              <TableHead>Medicine</TableHead>
              <TableHead className="hidden sm:table-cell">Company</TableHead>
              <TableHead className="text-right w-[72px]">Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showTracking ? 4 : 3}
                  className="h-16 text-center text-muted-foreground"
                >
                  No items in this order.
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.tracked ? "bg-green-50/50 dark:bg-green-950/20" : undefined}
                >
                  {showTracking && (
                    <TableCell>
                      <Checkbox
                        checked={item.tracked}
                        disabled={trackMutation.isPending}
                        onCheckedChange={(checked) =>
                          trackMutation.mutate({
                            itemId: item.id,
                            tracked: checked === true,
                          })
                        }
                        aria-label={`Track ${item.medicineName}`}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <p className="font-medium">{item.medicineName}</p>
                    {item.medicineSubName && (
                      <p className="text-xs text-muted-foreground">{item.medicineSubName}</p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {item.companyName}
                  </TableCell>
                  <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
