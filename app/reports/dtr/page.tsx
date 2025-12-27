"use client";

import { FaFilter } from "react-icons/fa";
import React, { Suspense, useState, useEffect, useMemo } from "react";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { FormatProvider } from "@/contexts/FormatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { AddRecordModal } from "@/components/reports-tracking-add-dialog";
import { EditRecordModal } from "@/components/reports-tracking-edit-dialog";
import { HideRecordModal } from "@/components/reports-tracking-delete-dialog";
import { ReportsTrackingFilterDialog } from "@/components/reports-tracking-filter-dialog";

import { toast } from "sonner";

function DTrackingContent() {
  const [dateCreatedFilterRange, setDateCreatedFilterRangeAction] = useState<any>(undefined);
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const { userId, setUserId } = useUser();

  /* FILTER STATE */
  const defaultFilters = {
    ticketType: "All",
    ticketConcern: "All",
    department: "All",
    salesAgent: "All",
    tsm: "All",
    status: "All",
  };

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<any>(defaultFilters);

  // Show Clear Filters if filters, searchTerm, or sidebar calendar is used
  const isFilterActive = useMemo(() => {
    return (
      JSON.stringify(filters) !== JSON.stringify(defaultFilters) ||
      searchTerm.trim() !== "" ||
      dateCreatedFilterRange != null
    );
  }, [filters, searchTerm, dateCreatedFilterRange]);

  /* MODALS */
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [recordToHide, setRecordToHide] = useState<any>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [referenceId, setReferenceId] = useState<string>("");

  /* Sync userId from URL */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryUserId = searchParams.get("id") ?? "";
    if (queryUserId && queryUserId !== userId) setUserId(queryUserId);
  }, [userId, setUserId]);

  /* Fetch user */
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user?id=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => setReferenceId(data.ReferenceID || ""))
      .catch(() => toast.error("Failed to connect to server."));
  }, [userId]);

  /* Fetch records */
  useEffect(() => {
    fetch("/api/d-tracking-fetch-record")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRecords(json.data.filter((r: any) => r.isActive !== false));
        }
      })
      .catch(console.error);
  }, []);

  /* Sync sidebar date range to filters */
  useEffect(() => {
    if (dateCreatedFilterRange) {
      setCurrentPage(1);
    }
  }, [dateCreatedFilterRange]);

  /* SEARCH + FILTER */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = [
          r.company_name,
          r.customer_name,
          r.contact_number,
          r.ticket_type,
          r.ticket_concern,
          r.department,
          r.sales_agent,
          r.tsm,
          r.status,
          r.nature_of_concern,
          r.remarks,
        ].some((f) => f?.toLowerCase().includes(term));
        if (!match) return false;
      }

      if (filters.ticketType !== "All" && r.ticket_type !== filters.ticketType) return false;
      if (filters.ticketConcern !== "All" && r.ticket_concern !== filters.ticketConcern) return false;
      if (filters.department !== "All" && r.department !== filters.department) return false;
      if (filters.salesAgent !== "All" && r.sales_agent !== filters.salesAgent) return false;
      if (filters.tsm !== "All" && r.tsm !== filters.tsm) return false;
      if (filters.status !== "All" && r.status !== filters.status) return false;

      // Sidebar date filter
      if (dateCreatedFilterRange?.from && new Date(r.date_created) < new Date(dateCreatedFilterRange.from)) return false;
      if (dateCreatedFilterRange?.to && new Date(r.date_created) > new Date(dateCreatedFilterRange.to)) return false;

      return true;
    });
  }, [records, searchTerm, filters, dateCreatedFilterRange]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* CSV Download */
  const handleDownloadCSV = () => {
    const headers = [
      "Company",
      "Customer Name",
      "Contact Number",
      "Ticket Type",
      "Ticket Concern",
      "Department",
      "Sales Agent",
      "TSM",
      "Status",
      "Nature of Concern",
      "Endorsed Date",
      "Closed Date",
      "Date Created",
    ];
    const csv = [
      headers.join(","),
      ...filteredRecords.map((r) =>
        [
          r.company_name,
          r.customer_name,
          r.contact_number,
          r.ticket_type,
          r.ticket_concern,
          r.department,
          r.sales_agent,
          r.tsm,
          r.status,
          r.nature_of_concern,
          r.endorsed_date ?? "",
          r.closed_date ?? "",
          r.date_created ?? "",
        ].map((v) => `"${v}"`).join(",")
      ),
    ].join("\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "d_tracking.csv";
    link.click();
  };

  /* SEARCH HIGHLIGHT */
  const highlightMatch = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text?.split(regex) || [];
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={i} className="bg-yellow-100">{part}</mark>
          ) : part
        )}
      </>
    );
  };

  return (
    <>
      <SidebarLeft />
      <SidebarInset className="overflow-auto">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>D-Tracking</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex flex-col gap-4 p-4">
          <div>
            <h1 className="text-xl font-semibold">D-Tracking</h1>
            <p className="text-sm text-muted-foreground">
              This section displays customer ticket tracking records.
            </p>
          </div>

          {/* SEARCH LEFT, ACTIONS RIGHT */}
          <div className="flex flex-wrap justify-between gap-2 items-center">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-md flex-1"
            />

            <div className="flex gap-2 flex-wrap">
              {isFilterActive && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setSearchTerm("");
                    setCurrentPage(1);
                    setDateCreatedFilterRangeAction(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button variant="outline" onClick={() => setFilterModalOpen(true)}>
                <FaFilter /> Filter
              </Button>
              <Button onClick={() => setAddModalOpen(true)}>Add Record</Button>
              <Button
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={handleDownloadCSV}
              >
                Download CSV
              </Button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Actions</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Ticket Concern</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Sales Agent</TableHead>
                  <TableHead>TSM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => { setSelectedRecord(r); setEditModalOpen(true); }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { setRecordToHide(r); setHideModalOpen(true); }}>
                        Delete
                      </Button>
                    </TableCell>
                    <TableCell>{highlightMatch(r.company_name)}</TableCell>
                    <TableCell>{highlightMatch(r.customer_name)}</TableCell>
                    <TableCell>{highlightMatch(r.contact_number)}</TableCell>
                    <TableCell>{highlightMatch(r.ticket_type)}</TableCell>
                    <TableCell>{highlightMatch(r.ticket_concern)}</TableCell>
                    <TableCell>{highlightMatch(r.department)}</TableCell>
                    <TableCell>{highlightMatch(r.sales_agent)}</TableCell>
                    <TableCell>{highlightMatch(r.tsm)}</TableCell>
                    <TableCell>{highlightMatch(r.status)}</TableCell>
                    <TableCell>{highlightMatch(r.date_created)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="flex items-center gap-2 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>

      <SidebarRight
        userId={userId ?? undefined}
        dateCreatedFilterRange={dateCreatedFilterRange}
        setDateCreatedFilterRangeAction={setDateCreatedFilterRangeAction}
      />

      {/* MODALS */}
      <ReportsTrackingFilterDialog
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
      <AddRecordModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} referenceId={referenceId} onSave={(r) => setRecords((p) => [r, ...p])} />
      <EditRecordModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} record={selectedRecord} onSave={(u) => setRecords((p) => p.map((r) => (r._id === u._id ? u : r)))} />
      <HideRecordModal isOpen={hideModalOpen} onClose={() => setHideModalOpen(false)} record={recordToHide} onHide={(u) => setRecords((p) => p.filter((r) => r._id !== u._id))} />
    </>
  );
}

export default function Page() {
  return (
    <UserProvider>
      <FormatProvider>
        <SidebarProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <DTrackingContent />
          </Suspense>
        </SidebarProvider>
      </FormatProvider>
    </UserProvider>
  );
}
