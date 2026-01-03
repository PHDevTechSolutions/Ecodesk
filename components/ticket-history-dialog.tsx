"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Props {
  item: any;
}

export function TicketHistoryDialog({ item }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
<Button
  variant="outline"
  onClick={() => setOpen(true)}
  className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
>
  View Ticket History
</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Ticket History</span>
              <Badge variant="secondary">{item.status}</Badge>
            </DialogTitle>
          </DialogHeader>

          {/* HEADER */}
          <div className="space-y-1 text-sm">
            <p className="uppercase font-semibold">
              Ticket #: {item.ticket_reference_number || "-"}
            </p>
            <p className="text-muted-foreground">
              Created on{" "}
              {new Date(item.date_created).toLocaleDateString()}
            </p>
          </div>

          <Separator className="my-4" />

          {/* CONTACT INFO */}
          <section className="space-y-2">
            <h3 className="font-semibold text-sm">Contact Information</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <p><strong>Contact Person:</strong> {item.contact_person || "-"}</p>
              <p><strong>Contact Number:</strong> {item.contact_number || "-"}</p>
              <p><strong>Email Address:</strong> {item.email_address || "-"}</p>
              <p><strong>Company:</strong> {item.company_name || "-"}</p>
            </div>
          </section>

          <Separator className="my-4" />

          {/* TICKET DETAILS */}
          <section className="space-y-2">
            <h3 className="font-semibold text-sm">Ticket Details</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <p><strong>Ticket Received:</strong> {item.ticket_received || "-"}</p>
              <p><strong>Ticket Endorsed:</strong> {item.ticket_endorsed || "-"}</p>
              <p><strong>Traffic:</strong> {item.traffic || "-"}</p>
              <p><strong>Channel:</strong> {item.channel || "-"}</p>
              <p><strong>Source Company:</strong> {item.source_company || "-"}</p>
              <p><strong>Source:</strong> {item.source || "-"}</p>
              <p><strong>Wrap Up:</strong> {item.wrap_up || "-"}</p>
              <p><strong>Department:</strong> {item.department || "-"}</p>
              <p><strong>Manager:</strong> {item.manager || "-"}</p>
              <p><strong>Agent:</strong> {item.agent || "-"}</p>
              <p><strong>Customer Type:</strong> {item.customer_type || "-"}</p>
              <p><strong>Customer Status:</strong> {item.customer_status || "-"}</p>
            </div>
          </section>

          {/* REMARKS / INQUIRY */}
          {(item.remarks || item.inquiry) && (
            <>
              <Separator className="my-4" />
              <section className="space-y-2">
                <h3 className="font-semibold text-sm">Remarks & Inquiry</h3>
                {item.remarks && (
                  <p className="text-xs">
                    <strong>Remarks:</strong> {item.remarks}
                  </p>
                )}
                {item.inquiry && (
                  <p className="text-xs">
                    <strong>Inquiry:</strong> {item.inquiry}
                  </p>
                )}
              </section>
            </>
          )}

          {/* SALES DETAILS */}
          {(item.so_number || item.po_number || item.quotation_number) && (
            <>
              <Separator className="my-4" />
              <section className="space-y-2">
                <h3 className="font-semibold text-sm">Sales Details</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <p><strong>PO Number:</strong> {item.po_number || "-"}</p>
                  <p><strong>SO Number:</strong> {item.so_number || "-"}</p>
                  <p><strong>SO Amount:</strong> {item.so_amount || "-"}</p>
                  <p><strong>Qty Sold:</strong> {item.qty_sold || "-"}</p>
                  <p><strong>Quotation #:</strong> {item.quotation_number || "-"}</p>
                  <p><strong>Quotation Amount:</strong> {item.quotation_amount || "-"}</p>
                  <p><strong>Payment Terms:</strong> {item.payment_terms || "-"}</p>
                  <p><strong>PO Source:</strong> {item.po_source || "-"}</p>
                  <p><strong>Payment Date:</strong> {item.payment_date || "-"}</p>
                  <p><strong>Delivery Date:</strong> {item.delivery_date || "-"}</p>
                </div>
              </section>
            </>
          )}

          {/* CLOSURE DETAILS */}
          {item.status === "Closed" && (
            <>
              <Separator className="my-4" />
              <section className="space-y-2 bg-muted p-3 rounded-lg">
                <h3 className="font-semibold text-sm">Closure Details</h3>
                <p className="text-xs">
                  <strong>Close Reason:</strong> {item.close_reason || "-"}
                </p>
                <p className="text-xs">
                  <strong>Counter Offer:</strong> {item.counter_offer || "-"}
                </p>
                <p className="text-xs">
                  <strong>Client Specs:</strong> {item.client_specs || "-"}
                </p>
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
