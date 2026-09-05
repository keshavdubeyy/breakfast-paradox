"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"

type Order = {
  id: string
  customer: string
  status: "paid" | "pending" | "refunded"
  amount: string
}

const orders: Order[] = [
  {
    id: "ORD-1042",
    customer: "Ava Thompson",
    status: "paid",
    amount: "$84.00",
  },
  {
    id: "ORD-1043",
    customer: "Liam Chen",
    status: "pending",
    amount: "$32.50",
  },
  {
    id: "ORD-1044",
    customer: "Sofia Ramirez",
    status: "paid",
    amount: "$156.20",
  },
  {
    id: "ORD-1045",
    customer: "Noah Patel",
    status: "refunded",
    amount: "$19.99",
  },
  { id: "ORD-1046", customer: "Emma Wilson", status: "paid", amount: "$47.75" },
  {
    id: "ORD-1047",
    customer: "Oliver Kim",
    status: "pending",
    amount: "$210.00",
  },
]

const statusVariant: Record<
  Order["status"],
  "default" | "secondary" | "destructive"
> = {
  paid: "default",
  pending: "secondary",
  refunded: "destructive",
}

export default function DataTableDemo() {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<string[]>([])

  const filtered = orders.filter(
    (order) =>
      order.customer.toLowerCase().includes(query.toLowerCase()) ||
      order.id.toLowerCase().includes(query.toLowerCase())
  )

  const allSelected =
    filtered.length > 0 &&
    filtered.every((order) => selected.includes(order.id))

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelected(filtered.map((order) => order.id))
    } else {
      setSelected([])
    }
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <HugeiconsIcon
          icon={SearchIcon}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search orders..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  aria-label="Select all orders"
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(order.id)}
                    onCheckedChange={(checked) =>
                      toggleOne(order.id, checked === true)
                    }
                    aria-label={`Select order ${order.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status]}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{order.amount}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  No orders match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        {selected.length} of {filtered.length} row(s) selected.
      </p>
    </div>
  )
}
