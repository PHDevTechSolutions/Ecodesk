// components/activity-done-dialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    close_reason: string;
    counter_offer: string;
    client_specs: string;
  }) => void;
  loading?: boolean;

  // ✅ autofill sources
  close_reason?: string;
  counter_offer?: string;
  client_specs?: string;
}

export const DoneDialog: React.FC<DoneDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,

  close_reason,
  counter_offer,
  client_specs,
}) => {
  const [closeReason, setCloseReason] = useState("");
  const [counterOffer, setCounterOffer] = useState("");
  const [clientSpecs, setClientSpecs] = useState("");

  // ✅ AUTOFILL WHEN DIALOG OPENS
  useEffect(() => {
    if (open) {
      setCloseReason(close_reason || "");
      setCounterOffer(counter_offer || "");
      setClientSpecs(client_specs || "");
    }
  }, [open, close_reason, counter_offer, client_specs]);

  const isValid =
    closeReason.trim() !== "" &&
    counterOffer.trim() !== "" &&
    clientSpecs.trim() !== "";

  const handleConfirm = () => {
    if (!isValid) return;

    onConfirm({
      close_reason: closeReason.trim(),
      counter_offer: counterOffer.trim(),
      client_specs: clientSpecs.trim(),
    });

    // reset after submit
    setCloseReason("");
    setCounterOffer("");
    setClientSpecs("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Transaction as Closed</DialogTitle>
          <DialogDescription className="space-y-4">
            <p>
              Are you sure you want to mark this transaction as Closed? It will
              remain in the list but its status will be updated. You can reopen
              the ticket later if needed.
            </p>

            <div className="space-y-1">
              <Label>1. Add reason *</Label>
              <Textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Enter reason for closing..."
              />
            </div>

            <div className="space-y-1">
              <Label>2. Add counter offer *</Label>
              <Textarea
                value={counterOffer}
                onChange={(e) => setCounterOffer(e.target.value)}
                placeholder="Enter counter offer..."
              />
            </div>

            <div className="space-y-1">
              <Label>3. Client Specs *</Label>
              <Textarea
                value={clientSpecs}
                onChange={(e) => setClientSpecs(e.target.value)}
                placeholder="Enter client specifications..."
              />
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button onClick={handleConfirm} disabled={!isValid || loading}>
            {loading ? "Updating..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
