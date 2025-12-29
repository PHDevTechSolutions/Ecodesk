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

        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters({ ...filters, status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions(statuses).map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sales Agent */}
          <div className="flex flex-col gap-1">
            <Label>Sales Agent</Label>
            <Select
              value={filters.sales_agent}
              onValueChange={(v) => setFilters({ ...filters, sales_agent: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sales agent" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions(["All", ...salesAgents]).map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
