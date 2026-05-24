import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Package } from "lucide-react";
import { format } from "date-fns";
import type { AdminUserOrderDetail } from "@shared/types/database";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

interface UserOrderCardProps {
  order: AdminUserOrderDetail;
  compact?: boolean;
}

export function UserOrderCard({ order, compact = false }: UserOrderCardProps) {
  const placedOn = format(new Date(order.createdAt), compact ? "MMM dd, yyyy" : "PPP 'at' p");

  return (
    <Card className="border bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{placedOn}</p>
          <p className="text-xs text-muted-foreground">
            {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <Badge variant="outline" className={`capitalize ${STATUS_STYLES[order.status] ?? ""}`}>
          {order.status}
        </Badge>
      </div>

      {!compact && (
        <>
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{order.address || "No delivery address provided"}</span>
          </div>

          <Separator className="my-3" />

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              Items
            </p>
            {order.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in this order.</p>
            ) : (
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li
                    key={`${order.createdAt}-${item.medicineName}-${index}`}
                    className="flex items-start justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.medicineName}</p>
                      {item.medicineSubName && (
                        <p className="text-xs text-muted-foreground">{item.medicineSubName}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{item.companyName}</p>
                    </div>
                    <span className="shrink-0 font-medium">Qty {item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
