"use client";

import * as React from "react";
import qs from "query-string";
import { format } from "date-fns";
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
import { useGetDateRange } from "@/project/api/use-get-date-range";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DayContent } from "react-day-picker";

interface SensorData {
  _time: string;
  _value: number;
  _field: string;
}

interface DatePickerProps {
  data?: SensorData[];
}

export function DatePicker({ data = [] }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dateRange = useGetDateRange();

  // Initialize selectedDate from URL query or default to today.
  const initialDate = React.useMemo(() => {
    const dateParam = searchParams.get("date");
    return dateParam ? new Date(dateParam) : new Date();
  }, [searchParams]);

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initialDate
  );

  // Helper function to update the URL query parameter.
  const updateDateInQuery = React.useCallback(
    (date: Date) => {
      const formattedDate = format(date, "yyyy-MM-dd");
      const url = qs.stringifyUrl(
        { url: pathname, query: { date: formattedDate } },
        { skipEmptyString: true, skipNull: true }
      );
      router.push(url);
    },
    [pathname, router]
  );

  // Ensure the URL has a "date" query param.
  React.useEffect(() => {
    if (!searchParams.get("date")) {
      updateDateInQuery(new Date());
    }
  }, [searchParams, updateDateInQuery]);

  // Calculate the minimum and maximum selectable dates.
  const minDate = React.useMemo(() => {
    const minTime = dateRange.data?.min?.[0]?._time;
    return minTime ? new Date(minTime) : undefined;
  }, [dateRange.data]);

  const maxDate = React.useMemo(() => {
    const maxTime = dateRange.data?.max?.[0]?._time;
    return maxTime ? new Date(maxTime) : undefined;
  }, [dateRange.data]);

  // Group sensor data by day (formatted as "yyyy-MM-dd").
  const groupedData = React.useMemo(() => {
    return data.reduce<Record<string, SensorData[]>>((groups, item) => {
      const dayKey = format(new Date(item._time), "yyyy-MM-dd");
      groups[dayKey] = groups[dayKey] || [];
      groups[dayKey].push(item);
      return groups;
    }, {});
  }, [data]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      updateDateInQuery(date);
    }
  };

  // Custom day component for displaying sensor data as a tooltip.
  const CustomDay = (props: React.ComponentProps<typeof DayContent>) => {
    const { date } = props;
    const dayKey = format(date, "yyyy-MM-dd");
    const dayData = groupedData[dayKey];

    return (
      <div className="relative">
        <DayContent {...props} />
        {dayData && dayData.length > 0 && (
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
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
            fromDate={minDate}
            toDate={maxDate}
            components={{ DayContent: CustomDay }}
          />
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
