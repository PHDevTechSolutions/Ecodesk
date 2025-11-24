"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, ColumnDef, flexRender, } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AccountsActiveSearch } from "./accounts-active-search";
import { AccountsActiveFilter } from "./accounts-all-filter";
import { AccountsActivePagination } from "./accounts-active-pagination";

import { type DateRange } from "react-day-picker";

interface Account {
    id: string;
    referenceid: string;
    tsm: string;
    company_name: string;
    contact_person: string;
    contact_number: string;
    email_address: string;
    address: string;
    delivery_address: string;
    region: string;
    type_client: string;
    date_created: string;
    industry: string;
    status?: string;
}

interface UserDetails {
    referenceid: string;
    firstname: string;
    lastname: string;
    tsm: string;
    manager: string;
}

interface AccountsTableProps {
    posts: Account[];
    userDetails: UserDetails;
    dateCreatedFilterRange: DateRange | undefined;
    setDateCreatedFilterRangeAction: React.Dispatch<
        React.SetStateAction<DateRange | undefined>
    >;
}

export function AccountsTable({
    posts = [],
    userDetails,
    setDateCreatedFilterRangeAction,
}: AccountsTableProps) {
    const [localPosts, setLocalPosts] = useState<Account[]>(posts);
    const [agents, setAgents] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // ** ADDITION: filter state for agent **
    const [agentFilter, setAgentFilter] = useState("all");

    useEffect(() => {
        setLocalPosts(posts);
    }, [posts]);

    // FETCH AGENTS based on userDetails.referenceid (TSM)
    useEffect(() => {
        if (!userDetails.referenceid) return;

        const fetchAgents = async () => {
            try {
                const response = await fetch(
                    `/api/fetch-all-user?id=${encodeURIComponent(userDetails.referenceid)}`
                );
                if (!response.ok) throw new Error("Failed to fetch agents");

                const data = await response.json();
                setAgents(data);
            } catch (err) {
                console.error("Error fetching agents:", err);
                setError("Failed to load agents.");
            }
        };

        fetchAgents();
    }, [userDetails.referenceid]);

    // Map ReferenceID -> agent fullname for display and filtering
    const agentMap = useMemo(() => {
        const map: Record<string, string> = {};
        agents.forEach((agent) => {
            map[agent.ReferenceID] = `${agent.Firstname} ${agent.Lastname}`;
        });
        return map;
    }, [agents]);

    const [globalFilter, setGlobalFilter] = useState("");
    const [isFiltering, setIsFiltering] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [industryFilter, setIndustryFilter] = useState<string>("all");
    const [alphabeticalFilter, setAlphabeticalFilter] = useState<string | null>(
        null
    );
    const [dateCreatedFilter, setDateCreatedFilter] = useState<string | null>(
        null
    );

    const filteredData = useMemo(() => {
        let data = localPosts.filter((item) => item.status !== "Removed" && item.status !== "Pending" && item.status !== "Transferred");

        data = data.filter((item) => {
            const matchesSearch =
                !globalFilter ||
                Object.values(item).some(
                    (val) =>
                        val != null &&
                        String(val).toLowerCase().includes(globalFilter.toLowerCase())
                );

            const matchesType = typeFilter === "all" || item.type_client === typeFilter;
            const matchesStatus = statusFilter === "all" || item.status === statusFilter;
            const matchesIndustry =
                industryFilter === "all" || item.industry === industryFilter;

            // GET agent fullname from map using account referenceid
            const agentFullname = agentMap[item.referenceid] || "";

            // MATCH agent filter (all or exact fullname)
            const matchesAgent = agentFilter === "all" || agentFullname === agentFilter;

            return matchesSearch && matchesType && matchesStatus && matchesIndustry && matchesAgent;
        });

        // Sorting logic
        data = data.sort((a, b) => {
            if (alphabeticalFilter === "asc") {
                return a.company_name.localeCompare(b.company_name);
            } else if (alphabeticalFilter === "desc") {
                return b.company_name.localeCompare(a.company_name);
            }

            if (dateCreatedFilter === "asc") {
                return (
                    new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
                );
            } else if (dateCreatedFilter === "desc") {
                return (
                    new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
                );
            }

            return 0;
        });

        return data;
    }, [
        localPosts,
        globalFilter,
        typeFilter,
        statusFilter,
        industryFilter,
        alphabeticalFilter,
        dateCreatedFilter,
        agentFilter,
        agentMap,
    ]);

    const columns = useMemo<ColumnDef<Account>[]>(
        () => [
            {
                accessorKey: "agent_name",
                header: "Agent Name",
                cell: ({ row }) => {
                    const accountRefId = row.original.referenceid;
                    const agent = agents.find((a) => a.ReferenceID === accountRefId);
                    if (!agent) return "-";
                    return `${agent.Firstname} ${agent.Lastname}`;
                },
            },
            {
                accessorKey: "company_name",
                header: "Company Name",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "contact_person",
                header: "Contact Person",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "email_address",
                header: "Email Address",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "address",
                header: "Address",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "type_client",
                header: "Type of Client",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "industry",
                header: "Industry",
                cell: (info) => info.getValue(),
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
                accessorKey: "date_created",
                header: "Date Created",
                cell: (info) =>
                    new Date(info.getValue() as string).toLocaleDateString(),
            },
        ],
        [agents]
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
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                <div className="flex-grow max-w-lg">
                    <AccountsActiveSearch
                        globalFilter={globalFilter}
                        setGlobalFilterAction={setGlobalFilter}
                        isFiltering={isFiltering}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <AccountsActiveFilter
                        typeFilter={typeFilter}
                        setTypeFilterAction={setTypeFilter}
                        statusFilter={statusFilter}
                        setStatusFilterAction={setStatusFilter}
                        dateCreatedFilter={dateCreatedFilter}
                        setDateCreatedFilterAction={setDateCreatedFilter}
                        industryFilter={industryFilter}
                        setIndustryFilterAction={setIndustryFilter}
                        alphabeticalFilter={alphabeticalFilter}
                        setAlphabeticalFilterAction={setAlphabeticalFilter}
                        agentFilter={agentFilter}
                        setAgentFilterAction={setAgentFilter}
                        agents={agents}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border p-4 space-y-2">
                {error && (
                    <div className="text-red-600 font-semibold mb-2">{error}</div>
                )}
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
        </div>
    );
}
