// app/help/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { UserProvider, useUser } from "@/contexts/UserContext";
import { FormatProvider } from "@/contexts/FormatContext";

import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { type DateRange } from "react-day-picker";

function HelpContent() {
  const searchParams = useSearchParams();
  const { userId, setUserId } = useUser();

  const queryUserId = searchParams?.get("id") ?? "";
  const [dateCreatedFilterRange, setDateCreatedFilterRangeAction] =
    useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (queryUserId && queryUserId !== userId) {
      setUserId(queryUserId);
    }
  }, [queryUserId, userId, setUserId]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <></>;

  return (
    <>
      <SidebarLeft />
      <SidebarInset>
        {/* Header */}
        <header className="bg-background sticky top-0 flex h-14 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-base font-semibold">
                    Help
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-6 p-4">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <h1 className="text-xl font-semibold">
              CSR Frequently Asked Questions
            </h1>
            <p className="text-sm text-muted-foreground">
              This section displays the CSR FAQs (Customer Service Representative Frequently Asked Questions). 
              It provides answers to common inquiries related to CSR processes, ensuring quick access to essential information. 
              If an error occurs, a message will be shown in red. 
              The CSRFaqs component is responsible for rendering the list of frequently asked questions.
            </p>

            <Accordion type="multiple" className="space-y-2">
              {/* 1 */}
              <AccordionItem value="accreditation">
                <AccordionTrigger>
                  1. Accreditation Requirements
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Current SEC/DTI Registration</li>
                    <li>Mayor&apos;s Permit</li>
                    <li>BIR Registration (Form 2303)</li>
                    <li>Latest Financial Statement</li>
                    <li>General Information Sheet</li>
                    <li>2 Valid Government IDs (colored)</li>
                    <li>Credit Terms Agreement</li>
                  </ul>
                  <p className="mt-2 text-sm text-red-500 font-medium">
                    Incomplete applications will not be approved.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* 2 */}
              <AccordionItem value="admin-sheets">
                <AccordionTrigger>
                  2. Accreditation Request (Admin Sheets)
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li>Mayor&apos;s Permit</li>
                    <li>SEC Registration</li>
                    <li>BIR Registration</li>
                    <li>Tax Clearance</li>
                    <li>PHILGEPS Registration</li>
                    <li>GIS</li>
                    <li>Google Maps (Office & Warehouse)</li>
                    <li>DOLE Registration</li>
                    <li>Secretary Certificate</li>
                    <li>Bank Details</li>
                    <li>List of Projects</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

            {/* 3 */}
            <AccordionItem value="refund">
            <AccordionTrigger>
                3. Refund Request / Sales & Accounting Concerns
            </AccordionTrigger>

            <AccordionContent className="space-y-6 text-sm">
                <p className="text-muted-foreground">
                Please review the applicable scenario below and prepare the corresponding
                requirements.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">1. Details Needed</p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Reason for refund</li>
                    <li>Total AMT. of refund</li>
                    <li>Passbook</li>
                    <li>Sales Head approval</li>
                    </ul>
                </div>

                {/* 2 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">
                    2. Documents Needed — Reason: Wrong Deposit
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Copy of Proof of Payment</li>
                    <li>Collection / Acknowledgement Receipt</li>
                    <li>Copy of 2307 (if applicable)</li>
                    </ul>
                </div>

                {/* 3 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">3. Reason: Double Payment</p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Copy of Proof of Payment</li>
                    <li>Collection / Acknowledgement Receipt</li>
                    <li>Copy of Sales Order</li>
                    <li>Copy of Delivery Receipt</li>
                    <li>Copy of Sales Invoice</li>
                    <li>Copy of 2307 (if applicable)</li>
                    </ul>
                </div>

                {/* 4 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">
                    4. Return Items With Re-Stocking Fee — Details Needed
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Reason for refund</li>
                    <li>Total AMT. of refund</li>
                    <li>Passbook</li>
                    <li>Sales Head approval</li>
                    </ul>
                </div>

                {/* 5 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">
                    5. Documents Needed — Cancel Order / Wrong Item Delivered
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Copy of Sales Order</li>
                    <li>Copy of Delivery Receipt</li>
                    <li>Copy of Sales Invoice</li>
                    <li>Copy of Replacement / Pull-Out Slip</li>
                    <li>
                        Copy of Another SO with Re-Stocking Cancellation Charge
                    </li>
                    <li>Copy of 2307 (if applicable)</li>
                    </ul>
                </div>

                {/* 6 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">
                    6. Reason: Deposit in Advance / Unavailability of Stocks
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Copy of Sales Order</li>
                    <li>Copy of Proof of Payment</li>
                    <li>Collection / Acknowledgement Receipt</li>
                    <li>Copy of 2307 (if applicable)</li>
                    </ul>
                </div>

                {/* 7 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">
                    7. Reason: Unserved Items / Excess Amount Deposited
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Copy of Sales Order</li>
                    <li>Copy of Delivery Receipt</li>
                    <li>Copy of Sales Invoice</li>
                    <li>Collection / Acknowledgement Receipt</li>
                    </ul>
                </div>

                {/* 8 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">
                    8. E-Commerce — Busted Items / Cancel Order
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Summary of Excel Report</li>
                    <li>Copy of Replacement / Pull-Out Slip</li>
                    </ul>
                </div>

                {/* 9 — FULL WIDTH */}
                <div className="rounded-lg border p-4 space-y-3 md:col-span-2">
                    <p className="font-semibold">9. Regular Sales Order (SO)</p>

                    <p className="font-medium">Customer Details</p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Company / Customer Name</li>
                    <li>Registered Address</li>
                    <li>TIN / Business Style</li>
                    <li>PO / Quotation Reference</li>
                    <li>Shipping Address</li>
                    <li>Contact Information</li>
                    <li>Delivery Address & Date</li>
                    <li>Payment Terms / Special Instructions</li>
                    </ul>

                    <p className="font-medium mt-2">Product Details</p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Item Code / Image / Specifications</li>
                    <li>Quantity</li>
                    <li>Unit Price</li>
                    <li>Total Amount</li>
                    </ul>

                    <p className="font-medium mt-2">Signatories</p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Agent Signature</li>
                    <li>Sales Manager Signature</li>
                    <li>
                        Sales Head Signature — Email to{" "}
                        <strong>orders@ecoshiftcorp.com</strong>
                    </li>
                    </ul>
                </div>

                {/* 10 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">10. Documents Needed</p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Purchase Order / Notice to Proceed / NTA</li>
                    <li>Signed Quotation / Client Email Quotation</li>
                    <li>Sample Slip / Job Request Form (if applicable)</li>
                    <li>Copy of Deposit Slip</li>
                    <li>Form 251 & Special Approvals (if applicable)</li>
                    <li>PEZA / VAT Exempt Certificate (if applicable)</li>
                    </ul>
                </div>

                {/* 11 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">11. SO Cancellation</p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Company Name</li>
                    <li>Sales Order Reference Number</li>
                    <li>Reason for cancellation</li>
                    <li>Sales Manager approval</li>
                    <li>Sales Head approval (with fees)</li>
                    <li>Proof of cancellation</li>
                    </ul>
                    <p className="text-xs text-muted-foreground">
                    Email to: <strong>orders@ecoshiftcorp.com</strong> <br />
                    CC: Sales Head
                    </p>
                </div>

                {/* 12 */}
                <div className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold">
                    12. Request for Advance / Proforma Invoice
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                    <li>Company Name</li>
                    <li>SO Number</li>
                    <li>VAT Type</li>
                    <li>Payment Terms</li>
                    <li>Processing Days</li>
                    <li>Proof of Client Request</li>
                    <li>Purpose</li>
                    </ul>
                    <p className="text-xs text-muted-foreground">
                    Email to: <strong>j.bellen@ecoshiftcorp.com</strong>,{" "}
                    <strong>billings@ecoshiftcorp.com</strong> <br />
                    CC: Sales Head
                    </p>
                </div>
                </div>
            </AccordionContent>
            </AccordionItem>

              {/* 4 */}
              <AccordionItem value="branches">
                <AccordionTrigger>4. Branches</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li>Mandaluyong – J&amp;L Building, EDSA</li>
                    <li>Cebu – Zuellig Ave., Mandaue</li>
                    <li>Davao – Matina Aplaya</li>
                    <li>CDO – Alwana Business Park</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* 5 */}
              <AccordionItem value="delivery">
                <AccordionTrigger>5. Delivery Options</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li>Company Truck</li>
                    <li>Free Delivery (Metro / Provincial)</li>
                    <li>Third-Party Couriers</li>
                    <li>Customer Pickup</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* 6 */}
              <AccordionItem value="payment">
                <AccordionTrigger>6. Payment Options</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li>Bank Deposit</li>
                    <li>GCash</li>
                    <li>Credit Card (Head Office)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </SidebarInset>

      <SidebarRight
        userId={userId ?? undefined}
        dateCreatedFilterRange={dateCreatedFilterRange}
        setDateCreatedFilterRangeAction={setDateCreatedFilterRangeAction}
      />
    </>
  );
}

export default function HelpPage() {
  return (
    <FormatProvider>
      <SidebarProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <HelpContent />
        </Suspense>
      </SidebarProvider>
    </FormatProvider>
  );
}
