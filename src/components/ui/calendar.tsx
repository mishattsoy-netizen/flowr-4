"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  format, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns"

import { cn } from "@/lib/utils"

export type CalendarProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  initialFocus?: boolean
}

export function Calendar({
  selected,
  onSelect,
  className,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState(selected || new Date())

  // Calculate days for the 7-column grid
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const dayHeaders = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

  return (
    <div className={cn("p-3 w-[240px] bg-transparent", className)}>
      {/* Header Navigation */}
      <div className="flex items-center justify-between w-full px-1 mb-3 border-b border-[var(--bone-10)] pb-2">
        <button 
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          className="h-7 w-7 flex items-center justify-center rounded-lg border border-[var(--bone-15)] opacity-50 hover:opacity-100 transition-all hover:bg-[var(--bone-10)]"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        
        <div className="flex items-center gap-1.5 font-ui text-[12px] text-[var(--bone-100)]">
          <span>{format(month, "MMMM")}</span>
          <span className="opacity-30 font-normal">{format(month, "yyyy")}</span>
        </div>

        <button 
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="h-7 w-7 flex items-center justify-center rounded-lg border border-[var(--bone-15)] opacity-50 hover:opacity-100 transition-all hover:bg-[var(--bone-10)]"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Day Headers Grid */}
      <div className="grid grid-cols-7 w-full mb-2">
        {dayHeaders.map(d => (
          <div key={d} className="text-[9px] uppercase font-ui-label text-[var(--bone-30)] text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 w-full gap-y-1 gap-x-1">
        {calendarDays.map((day) => {
          const isSelected = selected && isSameDay(day, selected)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isDayToday = isToday(day)

          return (
            <button
              key={day.toString()}
              type="button"
              onClick={() => onSelect?.(day)}
              className={cn(
                "h-7 w-7 flex items-center justify-center text-[12px] font-ui rounded-[4px] transition-all duration-200",
                !isCurrentMonth && "text-[var(--bone-10)] opacity-20",
                isCurrentMonth && "text-[var(--bone-100)] hover:bg-[var(--bone-10)]",
                isDayToday && !isSelected && "bg-[var(--bone-15)] text-[var(--bone-100)] font-bold",
                isSelected && "bg-accent/15 text-accent font-semibold"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--bone-10)]">
        <button
          type="button"
          onClick={() => {
            const today = new Date()
            setMonth(today)
            onSelect?.(today)
          }}
          className="px-3 py-1.5 rounded-[4px] hover:bg-white/5 text-[10px] font-ui-label uppercase text-[var(--bone-70)] hover:text-[var(--bone-100)] transition-all"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onSelect?.(undefined)}
          className="px-3 py-1.5 rounded-[4px] hover:bg-white/5 text-[10px] font-ui-label uppercase text-[var(--bone-70)] hover:text-[var(--bone-100)] transition-all"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

