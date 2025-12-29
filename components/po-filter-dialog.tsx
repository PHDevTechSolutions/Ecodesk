"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: (val: any) => void;
  salesAgents?: string[];
}

export const POFilterDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  salesAgents = [],
}) => {
  const statuses = ["All", "PO Received", "Endorsed"];
  const sortOptions = (arr: string[]) =>
    arr.slice().sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Filter Purchase Orders</DialogTitle>
        </DialogHeader>


        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters({ ...filters, status: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {sortOptions(statuses).map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label>Sales Agent</Label>
        <Select
          value={filters.sales_agent}
          onValueChange={(v) => setFilters({ ...filters, sales_agent: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select sales agent" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {sortOptions(["All", ...salesAgents]).map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                status: "All",
                sales_agent: "All",
              })
            }
          >
            Clear Filters
          </Button>
          <Button onClick={onClose}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
