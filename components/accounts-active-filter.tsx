"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

interface AccountsActiveFilterProps {
  typeFilter: string;
  setTypeFilterAction: (value: string) => void;
  statusFilter: string;
  setStatusFilterAction: (value: string) => void;

  dateCreatedFilter: string | null;
  setDateCreatedFilterAction: (value: string | null) => void;

  salesVolumeFilter: string | null;
  setSalesVolumeFilterAction: (value: string | null) => void;

  referenceIdFilter: string | null;
  setReferenceIdFilterAction: (value: string | null) => void;
}

export function AccountsActiveFilter({
  typeFilter,
  setTypeFilterAction,
  statusFilter,
  setStatusFilterAction,
  dateCreatedFilter,
  setDateCreatedFilterAction,
  salesVolumeFilter,
  setSalesVolumeFilterAction,
  referenceIdFilter,
  setReferenceIdFilterAction,
}: AccountsActiveFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Type Filter */}
      <Select value={typeFilter} onValueChange={setTypeFilterAction}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type Client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Top 50">Top 50</SelectItem>
          <SelectItem value="Next 30">Next 30</SelectItem>
          <SelectItem value="Balance 20">Balance 20</SelectItem>
          <SelectItem value="CSR Client">CSR Client</SelectItem>
          <SelectItem value="TSA Client">TSA Client</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilterAction}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="New Client">New Client</SelectItem>
          <SelectItem value="Non-Buying">Non-Buying</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Advanced Filters Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Advanced Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              setDateCreatedFilterAction(dateCreatedFilter === "asc" ? "desc" : "asc")
            }
          >
            By Date Created{" "}
            {dateCreatedFilter === "asc"
              ? "(Asc)"
              : dateCreatedFilter === "desc"
              ? "(Desc)"
              : ""}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              setSalesVolumeFilterAction(salesVolumeFilter === "high" ? "low" : "high")
            }
          >
            By Sales Volume {salesVolumeFilter ? `(${salesVolumeFilter})` : ""}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              setReferenceIdFilterAction(referenceIdFilter === "alpha" ? "numeric" : "alpha")
            }
          >
            By Reference ID {referenceIdFilter ? `(${referenceIdFilter})` : ""}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setDateCreatedFilterAction(null);
              setSalesVolumeFilterAction(null);
              setReferenceIdFilterAction(null);
            }}
          >
            Clear Advanced Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
