"use client"

import { useState, type MouseEvent } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const TOTAL_PAGES = 12

export default function PaginationDemo() {
  const [page, setPage] = useState(4)

  const goTo = (p: number) => (e: MouseEvent) => {
    e.preventDefault()
    setPage(Math.min(TOTAL_PAGES, Math.max(1, p)))
  }

  return (
    <div className="flex flex-col gap-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={goTo(page - 1)} />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink href="#" isActive={page === 1} onClick={goTo(1)}>
              1
            </PaginationLink>
          </PaginationItem>

          {page > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {[page - 1, page, page + 1]
            .filter((p) => p > 1 && p < TOTAL_PAGES)
            .map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={page === p}
                  onClick={goTo(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

          {page < TOTAL_PAGES - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink
              href="#"
              isActive={page === TOTAL_PAGES}
              onClick={goTo(TOTAL_PAGES)}
            >
              {TOTAL_PAGES}
            </PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext href="#" onClick={goTo(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <p className="text-center text-sm text-muted-foreground">
        Page {page} of {TOTAL_PAGES}
      </p>
    </div>
  )
}
