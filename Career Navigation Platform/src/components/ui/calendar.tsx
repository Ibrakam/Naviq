"use client";

import * as React from "react";
import {
  DayPicker,
  type DayPickerSingleProps,
} from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ru } from "date-fns/locale";

import { cn } from "./utils";

type CalendarProps = DayPickerSingleProps;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ru}
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown"
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-sm",
        className,
      )}
      classNames={{
        months: "flex flex-col",
        month: "flex flex-col gap-3",
        caption: "flex items-center justify-center mb-3 gap-2",
        caption_label: "hidden",
        caption_dropdowns: "flex items-center gap-2 w-full",
        dropdown: "flex gap-2 w-full",
        dropdown_month: "flex-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/30",
        dropdown_year: "flex-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/30",
        dropdown_icon: "hidden",
        nav: "hidden",
        nav_button: "hidden",
        nav_button_previous: "hidden",
        nav_button_next: "hidden",
        table: "w-full border-collapse",
        head_row:
          "text-xs font-medium text-gray-500 text-center mb-1",
        head_cell: "py-2",
        row: "mt-1",
        cell: cn(
          "relative text-center text-sm",
        ),
        day: cn(
          "mx-auto flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium text-gray-900 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/30 disabled:pointer-events-none disabled:text-gray-300",
        ),
        day_selected:
          "bg-green-500 text-white hover:bg-green-600 hover:text-white focus:bg-green-600 focus:text-white shadow-sm",
        day_today: "ring-2 ring-green-200 text-green-600 font-semibold",
        day_outside: "text-gray-300",
        day_disabled: "text-gray-300 opacity-40",
        day_range_middle: "bg-green-50 text-green-600",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...iconProps }) => (
          <ChevronLeft className={cn("h-3.5 w-3.5", className)} {...iconProps} />
        ),
        IconRight: ({ className, ...iconProps }) => (
          <ChevronRight className={cn("h-3.5 w-3.5", className)} {...iconProps} />
        ),
        ...components,
      }}
      {...props}
    />
  );
}
