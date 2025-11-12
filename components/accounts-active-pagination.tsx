"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table } from "@tanstack/react-table";

interface AccountsActivePaginationProps<TData> {
  table: Table<TData>;
}

export function AccountsActivePagination<TData>({
  table,
}: AccountsActivePaginationProps<TData>) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (table.getCanPreviousPage()) table.previousPage();
            }}
            aria-disabled={!table.getCanPreviousPage()}
            className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* Render page numbers */}
        {Array.from({ length: table.getPageCount() }).map((_, i) => {
          const pageIndex = i;
          const isActive = table.getState().pagination.pageIndex === pageIndex;
          return (
            <PaginationItem key={pageIndex}>
              <PaginationLink
                href="#"
                isActive={isActive}
                onClick={(e) => {
                  e.preventDefault();
                  table.setPageIndex(pageIndex);
                }}
              >
                {pageIndex + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {table.getPageCount() > 5 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (table.getCanNextPage()) table.nextPage();
            }}
            aria-disabled={!table.getCanNextPage()}
            className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
