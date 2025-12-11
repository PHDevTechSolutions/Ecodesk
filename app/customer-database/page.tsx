"use client";

import React, { Suspense, useState, useEffect } from "react";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { FormatProvider } from "@/contexts/FormatContext";
import { type DateRange } from "react-day-picker";

interface Account {
  id: number;
  referenceid: string;
  manager: string;
  tsm: string;
  company_name: string;
  contact_person: string;
  contact_number: string;
  email_address: string;
  address: string;
  delivery_address: string;
  region: string;
  industry: string;
  remarks: string;
  status: string;
  date_created: string;
  date_updated: string;
  next_available_date: string | null;
  gender: string;
  type: string;
  account_reference_number: string;
  type_client: string;
  company_group: string;
  date_transferred: string | null;
}

function CustomerDatabaseContent() {
  const { userId } = useUser();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for date range filter used by SidebarRight
  const [dateCreatedFilterRange, setDateCreatedFilterRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setLoading(true);
        const res = await fetch("/api/com-fetch-account");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch accounts");
        setAccounts(data.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  return (
    <>
      <SidebarLeft />
      <SidebarInset className="overflow-auto">
        {/* Breadcrumb header */}
        <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">Customer Database</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 flex-col gap-4 p-4">
          {loading && <p>Loading accounts...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && accounts.length === 0 && <p>No CSR Client accounts found.</p>}

          {!loading && !error && accounts.length > 0 && (
            <div className="overflow-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Reference ID</th>
                    <th className="px-4 py-2">Manager</th>
                    <th className="px-4 py-2">TSM</th>
                    <th className="px-4 py-2">Company Name</th>
                    <th className="px-4 py-2">Contact Person</th>
                    <th className="px-4 py-2">Contact Number</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Address</th>
                    <th className="px-4 py-2">Delivery Address</th>
                    <th className="px-4 py-2">Region</th>
                    <th className="px-4 py-2">Industry</th>
                    <th className="px-4 py-2">Remarks</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Date Created</th>
                    <th className="px-4 py-2">Date Updated</th>
                    <th className="px-4 py-2">Next Available Date</th>
                    <th className="px-4 py-2">Gender</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Account Ref #</th>
                    <th className="px-4 py-2">Type Client</th>
                    <th className="px-4 py-2">Company Group</th>
                    <th className="px-4 py-2">Date Transferred</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2">{acc.id}</td>
                      <td className="px-4 py-2">{acc.referenceid}</td>
                      <td className="px-4 py-2">{acc.manager}</td>
                      <td className="px-4 py-2">{acc.tsm}</td>
                      <td className="px-4 py-2">{acc.company_name}</td>
                      <td className="px-4 py-2">{acc.contact_person}</td>
                      <td className="px-4 py-2">{acc.contact_number}</td>
                      <td className="px-4 py-2">{acc.email_address}</td>
                      <td className="px-4 py-2">{acc.address}</td>
                      <td className="px-4 py-2">{acc.delivery_address}</td>
                      <td className="px-4 py-2">{acc.region}</td>
                      <td className="px-4 py-2">{acc.industry}</td>
                      <td className="px-4 py-2">{acc.remarks}</td>
                      <td className="px-4 py-2">{acc.status}</td>
                      <td className="px-4 py-2">{acc.date_created}</td>
                      <td className="px-4 py-2">{acc.date_updated}</td>
                      <td className="px-4 py-2">{acc.next_available_date ?? "-"}</td>
                      <td className="px-4 py-2">{acc.gender}</td>
                      <td className="px-4 py-2">{acc.type}</td>
                      <td className="px-4 py-2">{acc.account_reference_number}</td>
                      <td className="px-4 py-2">{acc.type_client}</td>
                      <td className="px-4 py-2">{acc.company_group}</td>
                      <td className="px-4 py-2">{acc.date_transferred ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </SidebarInset>

      <SidebarRight
        userId={userId ?? undefined}
        dateCreatedFilterRange={dateCreatedFilterRange}
        setDateCreatedFilterRangeAction={setDateCreatedFilterRange}
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
            <CustomerDatabaseContent />
          </Suspense>
        </SidebarProvider>
      </FormatProvider>
    </UserProvider>
  );
}
