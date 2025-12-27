"use client";

import { FaFilter } from "react-icons/fa";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { FormatProvider } from "@/contexts/FormatContext";
import { DateRange } from "react-day-picker";
import { ObcCallsFilterDialog } from "@/components/ob-calls-filter-dialog";

type OBCRecord = {
  activity_reference_number: string;
  referenceid: string;
  tsm: string;
  manager: string;
  type_client: string;
  source: string;
  type_activity: string;
  call_status: string;
  call_type: string;
  remarks: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  date_followup: string | null;
  date_created: string;
  date_updated: string;
  account_reference_number: string;
};

const PAGE_SIZE = 10;

const defaultFilters = {
  type_client: "All",
  source: "All",
  type_activity: "All",
  call_status: "All",
  call_type: "All",
  status: "All",
  tsm: "All",
  manager: "All",
};

function OBCContent() {
  const searchParams = useSearchParams();
  const { userId, setUserId } = useUser();
  const queryUserId = searchParams?.get("id") ?? "";

  useEffect(() => {
    if (queryUserId && queryUserId !== userId) setUserId(queryUserId);
  }, [queryUserId, userId, setUserId]);

  const [records, setRecords] = useState<OBCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FILTER & SEARCH STATE
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [search, setSearch] = useState("");
  const [dateCreatedFilterRange, setDateCreatedFilterRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const highlightMatch = (text: string | null | undefined) => {
  if (!text) return "-";
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-yellow-100">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};


  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/ob-calls-fetch-activity");
        if (!res.ok) throw new Error("Failed to fetch OBC records");
        const json = await res.json();
        setRecords(json.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FILTERED DATA
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesFilters =
        (filters.type_client === "All" || r.type_client === filters.type_client) &&
        (filters.source === "All" || r.source === filters.source) &&
        (filters.type_activity === "All" || r.type_activity === filters.type_activity) &&
        (filters.call_status === "All" || r.call_status === filters.call_status) &&
        (filters.call_type === "All" || r.call_type === filters.call_type) &&
        (filters.status === "All" || r.status === filters.status) &&
        (filters.tsm === "All" || r.tsm === filters.tsm) &&
        (filters.manager === "All" || r.manager === filters.manager);

      const matchesSearch =
        !search ||
        Object.values(r)
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(search.toLowerCase()));

      const matchesDate =
        !dateCreatedFilterRange ||
        (r.date_created &&
          new Date(r.date_created) >= (dateCreatedFilterRange?.from || new Date(-8640000000000000)) &&
          new Date(r.date_created) <= (dateCreatedFilterRange?.to || new Date(8640000000000000)));

      return matchesFilters && matchesSearch && matchesDate;
    });
  }, [records, filters, search, dateCreatedFilterRange]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // CSV Download
  const handleDownloadCSV = () => {
    const headers = [
      'Activity Ref #', 'ReferenceID', 'TSM', 'Manager', 'Type Client',
      'Source', 'Type Activity', 'Call Status', 'Call Type', 'Remarks',
      'Status', 'Start Date', 'End Date', 'Date Followup', 'Date Created',
      'Date Updated', 'Account Ref #'
    ];
    const csvRows = [headers.join(',')];
    filtered.forEach((r) => {
      csvRows.push([
        r.activity_reference_number || "-",
        r.referenceid || "-",
        r.tsm || "-",
        r.manager || "-",
        r.type_client || "-",
        r.source || "-",
        r.type_activity || "-",
        r.call_status || "-",
        r.call_type || "-",
        r.remarks || "-",
        r.status || "-",
        r.start_date || "-",
        r.end_date || "-",
        r.date_followup || "-",
        r.date_created || "-",
        r.date_updated || "-",
        r.account_reference_number || "-",
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outbound_calls.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // CLEAR FILTERS BUTTON STATE
  const isFilterActive = useMemo(() => {
    return (
      search !== "" ||
      Object.entries(filters).some(([_, v]) => v !== "All") ||
      !!dateCreatedFilterRange
    );
  }, [search, filters, dateCreatedFilterRange]);

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
                <BreadcrumbPage>Outbound Calls</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex flex-col gap-4 p-4">
          <div>
            <h1 className="text-xl font-semibold">Outbound Calls</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-5xl">
              This section displays details about outbound calls made to clients.
            </p>
          </div>

          {/* SEARCH LEFT, ACTIONS RIGHT */}
          <div className="flex flex-wrap justify-between gap-2 items-center">
            <Input
              placeholder="Search outbound calls..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-md flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              {isFilterActive && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setFilters({ ...defaultFilters });
                    setSearch("");
                    setPage(1);
                    setDateCreatedFilterRange(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button variant="outline" onClick={() => setFilterDialogOpen(true)}>
                <FaFilter /> Filter
              </Button>
              <Button
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={handleDownloadCSV}
              >
                Download CSV
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <Spinner className="size-8" />
            </div>
          )}

          {error && <p className="text-destructive">{error}</p>}

          {!loading && paginated.length > 0 && (
            <div className="overflow-auto">
              <Table className="min-w-[2600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity Ref #</TableHead>
                    <TableHead>ReferenceID</TableHead>
                    <TableHead>TSM</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Type Client</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type Activity</TableHead>
                    <TableHead>Call Status</TableHead>
                    <TableHead>Call Type</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Date Followup</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Date Updated</TableHead>
                    <TableHead>Account Ref #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{highlightMatch(r.activity_reference_number)}</TableCell>
                      <TableCell>{highlightMatch(r.referenceid)}</TableCell>
                      <TableCell>{highlightMatch(r.tsm)}</TableCell>
                      <TableCell>{highlightMatch(r.manager)}</TableCell>
                      <TableCell>{highlightMatch(r.type_client)}</TableCell>
                      <TableCell>{highlightMatch(r.source)}</TableCell>
                      <TableCell>{highlightMatch(r.type_activity)}</TableCell>
                      <TableCell>{highlightMatch(r.call_status)}</TableCell>
                      <TableCell>{highlightMatch(r.call_type)}</TableCell>
                      <TableCell>{highlightMatch(r.remarks)}</TableCell>
                      <TableCell>{highlightMatch(r.status)}</TableCell>
                      <TableCell>{highlightMatch(r.start_date)}</TableCell>
                      <TableCell>{highlightMatch(r.end_date)}</TableCell>
                      <TableCell>{highlightMatch(r.date_followup)}</TableCell>
                      <TableCell>{highlightMatch(r.date_created)}</TableCell>
                      <TableCell>{highlightMatch(r.date_updated)}</TableCell>
                      <TableCell>{highlightMatch(r.account_reference_number)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-end items-center gap-3 mt-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </SidebarInset>

      <SidebarRight
        userId={userId ?? undefined}
        dateCreatedFilterRange={dateCreatedFilterRange}
        setDateCreatedFilterRangeAction={setDateCreatedFilterRange}
      />

      <ObcCallsFilterDialog
        isOpen={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
}

export default function Page() {
  return (
    <UserProvider>
      <FormatProvider>
        <SidebarProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <OBCContent />
          </Suspense>
        </SidebarProvider>
      </FormatProvider>
    </UserProvider>
  );
}
