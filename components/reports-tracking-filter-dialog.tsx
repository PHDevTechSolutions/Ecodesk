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
}

export const ReportsTrackingFilterDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Filter Records</DialogTitle>
        </DialogHeader>

        {/* FILTER FORM */}
        <div className="grid grid-cols-2 gap-4 mt-2">

          {/* TICKET TYPE */}
          <div className="flex flex-col gap-1">
            <Label>Ticket Type</Label>
            <Select
              value={filters.ticketType}
              onValueChange={(v) => setFilters({ ...filters, ticketType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ticket type" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "All",
                  "After Sales",
                  "Complaint",
                  "Documentation",
                  "Follow Up",
                  "Pricing",
                  "Product",
                  "Technical",
                ].map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TICKET CONCERN */}
          <div className="flex flex-col gap-1">
            <Label>Ticket Concern</Label>
            <Select
              value={filters.ticketConcern}
              onValueChange={(v) =>
                setFilters({ ...filters, ticketConcern: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ticket concern" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "All",
                  "Accreditation Request",
                  "Delivery/Pickup",
                  "Dialux",
                  "Documents",
                  "Job Request",
                  "Payment",
                  "Product Certificate",
                  "Product Recommendation",
                  "Product Testing",
                  "Quotation",
                  "Refund",
                  "Replacement",
                  "Replacement To Supplier",
                  "Repair",
                  "Shop Drawing",
                  "Site Visit",
                  "SPF",
                  "TDS",
                  "Wrong Order",
                ].map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DEPARTMENT */}
          <div className="flex flex-col gap-1">
            <Label>Department</Label>
            <Select
              value={filters.department}
              onValueChange={(v) => setFilters({ ...filters, department: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "All",
                  "Accounting",
                  "E-commerce",
                  "Engineering",
                  "Human Resources",
                  "Marketing",
                  "Procurement",
                  "Sales",
                  "Warehouse",
                ].map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* STATUS */}
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
                {["All", "Open", "Closed"].map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                ticketType: "All",
                ticketConcern: "All",
                department: "All",
                salesAgent: "All",
                tsm: "All",
                status: "All",
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
