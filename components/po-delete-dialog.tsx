"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PODeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any | null;
  onDelete: (updatedRecord: any) => void;
}

export const PODeleteModal: React.FC<PODeleteModalProps> = ({
  isOpen,
  onClose,
  record,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!record) return;
    setLoading(true);

    try {
      const res = await fetch("/api/po-hide-record", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record._id }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Record deleted successfully");
        onDelete({ ...record, isActive: false });
        onClose();
      } else {
        toast.error(data.error || "Failed to delete record");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this record?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
