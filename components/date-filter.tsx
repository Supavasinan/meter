"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGetDateRange } from "@/project/api/use-get-date-range";
import { useLiveModeStore } from "@/project/store/live-mode";
import { format, isSameDay } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import * as React from "react";
import { DayContent, type DayContentProps } from "react-day-picker";

interface SensorData {
  _time: string;
  _value: number;
  _field: string;
}

interface DatePickerProps {
  data?: SensorData[];
}

export function DateFilter({ data = [] }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dateRange = useGetDateRange();
  const { liveMode } = useLiveModeStore();

  // Convert available dates string array to Date objects
  const availableDates = React.useMemo(() => {
    return dateRange.data?.available?.map((dateStr) => new Date(dateStr)) || [];
  }, [dateRange.data]);

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined
  );

  // Initialize date when data is available
  React.useEffect(() => {
    if (availableDates.length > 0) {
      const dateParam = searchParams.get("date");
      let dateToSelect: Date;

      if (dateParam) {
        const paramDate = new Date(dateParam);
        dateToSelect = availableDates.some((d) => isSameDay(d, paramDate))
          ? paramDate
          : availableDates[0];
      } else {
        dateToSelect = availableDates[0];
      }

      setSelectedDate(dateToSelect);
      const formattedDate = format(dateToSelect, "yyyy-MM-dd");
      const url = qs.stringifyUrl(
        { url: pathname, query: { date: formattedDate } },
        { skipEmptyString: true, skipNull: true }
      );
      router.push(url);
    }
  }, [availableDates, searchParams, pathname, router]);

  // Group sensor data by day
  const groupedData = React.useMemo(() => {
    return data.reduce<Record<string, SensorData[]>>((groups, item) => {
      const dayKey = format(new Date(item._time), "yyyy-MM-dd");
      groups[dayKey] = groups[dayKey] || [];
      groups[dayKey].push(item);
      return groups;
    }, {});
  }, [data]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && availableDates.some((d) => isSameDay(d, date))) {
      setSelectedDate(date);
      const formattedDate = format(date, "yyyy-MM-dd");
      const url = qs.stringifyUrl(
        { url: pathname, query: { date: formattedDate } },
        { skipEmptyString: true, skipNull: true }
      );
      router.push(url);
    }
  };

  // Custom day component for displaying sensor data as a tooltip
  const CustomDay = (props: DayContentProps) => {
    const { date } = props;
    const dayKey = format(date, "yyyy-MM-dd");
    const dayData = groupedData[dayKey];
    const isAvailable = availableDates.some((d) => isSameDay(d, date));

    return (
      <div
        className={cn("relative ", !isAvailable && "text-muted-foreground/50")}
      >
        <DayContent {...props} />
        {isAvailable && dayData && dayData.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-2 w-2 rounded-full p-0"
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  {dayData.map((item, index) => (
                    <div key={index}>
                      {item._field}: {item._value}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  // Define modifiers for available dates
  const modifiers = React.useMemo(
    () => ({
      available: availableDates,
      unavailable: (date: Date) =>
        !availableDates.some((d) => isSameDay(d, date)),
    }),
    [availableDates]
  );

  // Define modifier styles
  const modifiersStyles = {
    available: {
      fontWeight: "600",
    },
    unavailable: {
      opacity: "0.5",
      cursor: "not-allowed",
    },
  };

  // Calculate the minimum and maximum selectable dates
  const minDate = React.useMemo(() => {
    return availableDates.length > 0
      ? new Date(Math.min(...availableDates.map((d) => d.getTime())))
      : undefined;
  }, [availableDates]);

  const maxDate = React.useMemo(() => {
    return availableDates.length > 0
      ? new Date(Math.max(...availableDates.map((d) => d.getTime())))
      : undefined;
  }, [availableDates]);

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        {dateRange.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>
        ) : dateRange.isError ? (
          <div className="p-4 text-center text-sm text-sidebar-foreground/70">
            Error loading date range. Please try again later.
          </div>
        ) : (
          <Calendar
            disabled={(date) =>
              liveMode || !availableDates.some((d) => isSameDay(d, date))
            }
            disableNavigation={liveMode}
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
            fromDate={minDate}
            toDate={maxDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            components={{ DayContent: CustomDay }}
            defaultMonth={selectedDate}
          />
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
