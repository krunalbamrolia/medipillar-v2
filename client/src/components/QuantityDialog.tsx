import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Package } from "lucide-react";
import { createWhatsAppLink } from "@/lib/whatsapp";

interface QuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicineName: string;
  companyName?: string;
}

export function QuantityDialog({ open, onOpenChange, medicineName, companyName }: QuantityDialogProps) {
  const [quantity, setQuantity] = useState("");

    const handleSubmit = () => {
      const trimmedQty = quantity.trim();
      if (!trimmedQty) {
        return;
      }
      
      // Simple validation: ensure it contains at least one number
      if (!/\d/.test(trimmedQty)) {
        alert("Please enter a valid quantity (e.g., 10, 5 boxes, etc.)");
        return;
      }

      const link = createWhatsAppLink(medicineName, companyName, trimmedQty);
      window.open(link, "_blank");
      setQuantity("");
      onOpenChange(false);
    };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && quantity.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setQuantity("");
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Enter Quantity Required
          </DialogTitle>
          <DialogDescription>
            Please enter the quantity you need for <span className="font-medium text-foreground">{medicineName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity <span className="text-red-500">*</span></Label>
            <Input
              id="qty"
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 10 boxes, 100 strips, 50 units"
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the quantity with unit (boxes, strips, tablets, etc.)
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!quantity.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Send Query on WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
