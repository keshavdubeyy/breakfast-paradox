"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export default function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col gap-6">
      <div className="w-fit rounded-2xl border p-1">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-xl"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {date
          ? `Reservation date: ${date.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}`
          : "No date selected."}
      </p>
    </div>
  )
}
