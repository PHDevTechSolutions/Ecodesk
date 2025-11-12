"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit } from "lucide-react";

import { AccountsActiveSearch } from "./accounts-active-search";
import { AccountsActiveFilter } from "./accounts-active-filter";
import { AccountsActivePagination } from "./accounts-active-pagination";
import { type DateRange } from "react-day-picker";

import { AccountDialog } from "./accounts-active-dialog";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Account {
  id: string;
  referenceid: string;
  companyname: string;
  contactperson: string;
  contactnumber: string;
  emailaddress: string;
  address: string;
  deliveryaddress: string;
  area: string;
  typeclient: string;
  actualsales: number | string;
  date_created: string;
  status?: string;
}

interface UserDetails {
  referenceid: string;
  tsm: string;
  manager: string;
}

interface AccountsTableProps {
  posts: Account[];
  dateCreatedFilterRange: DateRange | undefined;
  setDateCreatedFilterRangeAction: React.Dispatch<
    React.SetStateAction<DateRange | undefined>
  >;
  userDetails: UserDetails;
  onSaveAccountAction: (data: any) => void;
  onRefreshAccountsAction: () => Promise<void>;
}

export function AccountsTable({
  posts = [],
  userDetails,
  onSaveAccountAction,
  onRefreshAccountsAction
}: AccountsTableProps) {
  const [localPosts, setLocalPosts] = useState<Account[]>(posts);
  // Sync localPosts when posts from parent updates
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);


  const [globalFilter, setGlobalFilter] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Advanced filters states
  const [dateCreatedFilter, setDateCreatedFilter] = useState<string | null>(null);
  const [salesVolumeFilter, setSalesVolumeFilter] = useState<string | null>(null);
  const [referenceIdFilter, setReferenceIdFilter] = useState<string | null>(null);

  // For edit dialog
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // For bulk remove
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [removeRemarks, setRemoveRemarks] = useState("");
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});

  // For create dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter out removed accounts immediately
  const filteredData = useMemo(() => {
    return localPosts
      .filter((item) => item.status !== "Removed") // exclude removed here
      .filter((item) => {
        const matchesSearch =
          !globalFilter ||
          Object.values(item).some(
            (val) =>
              val != null &&
              String(val).toLowerCase().includes(globalFilter.toLowerCase())
          );

        const matchesType = typeFilter === "all" || item.typeclient === typeFilter;

        const matchesStatus = statusFilter === "all" || item.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (dateCreatedFilter === "asc") {
          return new Date(a.date_created).getTime() - new Date(b.date_created).getTime();
        } else if (dateCreatedFilter === "desc") {
          return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
        }
        return 0;
      })
      .filter((item) => {
        if (!salesVolumeFilter) return true;
        if (salesVolumeFilter === "high") return Number(item.actualsales) > 50000;
        if (salesVolumeFilter === "low") return Number(item.actualsales) <= 50000;
        return true;
      })
      .filter((item) => {
        if (!referenceIdFilter) return true;
        if (referenceIdFilter === "alpha")
          return /^[A-Za-z]/.test(item.referenceid);
        if (referenceIdFilter === "numeric")
          return /^[0-9]/.test(item.referenceid);
        return true;
      });
  }, [
    localPosts,
    globalFilter,
    typeFilter,
    statusFilter,
    dateCreatedFilter,
    salesVolumeFilter,
    referenceIdFilter,
  ]);

  const columns = useMemo<ColumnDef<Account>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all accounts"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select account ${row.original.companyname}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "companyname",
        header: "Company Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "referenceid",
        header: "Reference ID",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "typeclient",
        header: "Type Client",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "actualsales",
        header: "Actual Sales",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "date_created",
        header: "Date Created",
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const value = info.getValue() as string;
          let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
          if (value === "Active") variant = "default";
          else if (value === "Pending") variant = "secondary";
          else if (value === "Inactive") variant = "destructive";
          return <Badge variant={variant}>{value ?? "-"}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEditingAccount(row.original);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    if (!globalFilter) {
      setIsFiltering(false);
      return;
    }
    setIsFiltering(true);
    const timeout = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timeout);
  }, [globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id, // <--- This is the key fix to map selection keys to actual IDs
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Extract selected account IDs for bulk removal
  const selectedAccountIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id]
  );

  // Handle bulk remove action
  async function handleBulkRemove() {
    if (selectedAccountIds.length === 0 || !removeRemarks.trim()) return;

    setLocalPosts((prev) =>
      prev.map((item) =>
        selectedAccountIds.includes(item.id)
          ? { ...item, status: "Removed" }
          : item
      )
    );

    try {
      const res = await fetch("/api/com-bulk-remove-account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedAccountIds,
          status: "Removed",
          remarks: removeRemarks.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to remove accounts");
      }

      toast.success("Accounts removed successfully!");

      await onRefreshAccountsAction(); // dito tatawag sa page.tsx refreshAccounts

      setRowSelection({});
      setRemoveRemarks("");
      setIsRemoveDialogOpen(false);
      table.setPageIndex(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove accounts");
    }
  }

  function tryParseJSON(jsonString: string) {
    try {
      const o = JSON.parse(jsonString);
      if (o && (Array.isArray(o) || typeof o === 'object')) {
        return o;
      }
    } catch (e) {
      // Not a valid JSON
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <AccountDialog
          mode="create"
          userDetails={userDetails}
          onSaveAction={onSaveAccountAction}
          open={isCreateDialogOpen}
          onOpenChangeAction={setIsCreateDialogOpen}
        />

        <AccountsActiveSearch
          globalFilter={globalFilter}
          setGlobalFilterAction={setGlobalFilter}
          isFiltering={isFiltering}
        />

        <AccountsActiveFilter
          typeFilter={typeFilter}
          setTypeFilterAction={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilterAction={setStatusFilter}
          dateCreatedFilter={dateCreatedFilter}
          setDateCreatedFilterAction={setDateCreatedFilter}
          salesVolumeFilter={salesVolumeFilter}
          setSalesVolumeFilterAction={setSalesVolumeFilter}
          referenceIdFilter={referenceIdFilter}
          setReferenceIdFilterAction={setReferenceIdFilter}
        />

        {/* Remove Selected Button */}
        <Button
          variant="destructive"
          disabled={selectedAccountIds.length === 0}
          onClick={() => setIsRemoveDialogOpen(true)}
        >
          Remove Selected
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border p-4 space-y-2">
        <Badge
          className="h-5 min-w-5 rounded-full px-2 font-mono tabular-nums"
          variant="outline"
        >
          Total: {filteredData.length}
        </Badge>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No accounts found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AccountsActivePagination table={table} />

      {/* Edit dialog controlled */}
      {editingAccount && (
        <AccountDialog
          mode="edit"
          initialData={{
            id: editingAccount.id,
            companyname: editingAccount.companyname,
            contactperson: typeof editingAccount.contactperson === "string"
              ? tryParseJSON(editingAccount.contactperson) ?? editingAccount.contactperson.split(",").map((v) => v.trim())
              : editingAccount.contactperson || [""],

            contactnumber: typeof editingAccount.contactnumber === "string"
              ? tryParseJSON(editingAccount.contactnumber) ?? editingAccount.contactnumber.split(",").map((v) => v.trim())
              : editingAccount.contactnumber || [""],

            emailaddress: typeof editingAccount.emailaddress === "string"
              ? tryParseJSON(editingAccount.emailaddress) ?? editingAccount.emailaddress.split(",").map((v) => v.trim())
              : editingAccount.emailaddress || [""],

            address: editingAccount.address,
            area: editingAccount.area,
            status: editingAccount.status ?? "Active",
            deliveryaddress: editingAccount.deliveryaddress,
            typeclient: editingAccount.typeclient,
            actualsales: editingAccount.actualsales,
            date_created: editingAccount.date_created,
          }}
          userDetails={userDetails}
          onSaveAction={(data) => {
            onSaveAccountAction(data);
            setEditingAccount(null);
            setIsEditDialogOpen(false);
          }}
          open={isEditDialogOpen}
          onOpenChangeAction={(open) => {
            if (!open) {
              setEditingAccount(null);
              setIsEditDialogOpen(false);
            }
          }}
        />
      )}

      {/* Remove confirmation dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Selected Accounts</DialogTitle>
            <DialogDescription>
              Please provide remarks/reason for removing the selected accounts.
            </DialogDescription>
          </DialogHeader>

          <textarea
            className="w-full border rounded p-2 mt-2 mb-4"
            rows={4}
            value={removeRemarks}
            onChange={(e) => setRemoveRemarks(e.target.value)}
            placeholder="Enter remarks here"
          />

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsRemoveDialogOpen(false);
                setRemoveRemarks("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!removeRemarks.trim()}
              onClick={handleBulkRemove}
            >
              Confirm Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
