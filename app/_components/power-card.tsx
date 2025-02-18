"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { LucideProps } from "lucide-react";
import React, {
  ForwardRefExoticComponent,
  RefAttributes,
  useState,
} from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type Props = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  value: number;
  unit: string;
  timeSeries?:
    | {
        time: string;
        value: number;
      }[]
    | undefined;
  children?: React.ReactNode;
};

const chartData = [{ date: "2024-04-01", value: 222 }];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const PowerCard = ({
  icon: Icon,
  label,
  value,
  unit,
  timeSeries,
  children,
}: Props) => {
  // Use provided timeSeries data if available; otherwise fallback to dummy data.
  const data =
    timeSeries?.map((d) => ({ date: d.time, value: d.value })) || chartData;

  // Store the currently displayed value. Defaults to the prop "value".
  const [hoveredValue, setHoveredValue] = useState<number>(value);

  return (
    <div className="border p-4 rounded-xl">
      <span className="uppercase opacity-55 text-sm">{label}</span>
      <div className="flex justify-between items-center mt-2">
        <p className="font-semibold text-lg">
          {hoveredValue.toLocaleString()}{" "}
          <span className="uppercase">{unit}</span>
        </p>
        <div className="border w-fit border-primary rounded-xl p-2 bg-primary/10">
          <Icon className="size-6" />
        </div>
      </div>
      {children}
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[80px] w-full mt-4"
      >
        <AreaChart
          data={data}
          onMouseMove={(state: any) => {
            if (state?.activePayload && state.activePayload.length) {
              // Update displayed value based on hovered data point.
              setHoveredValue(state.activePayload[0].payload.value);
            }
          }}
          onMouseLeave={() => {
            // Reset to original value when the mouse leaves the chart.
            setHoveredValue(value);
          }}
        >
          <defs>
            <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-value)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-value)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            hide
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <ChartTooltip
            cursor={true}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name, item) => {
                  return format(new Date(item.payload.date), "HH:mm:ss");
                }}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="value"
            type="natural"
            fill="url(#fillValue)"
            stroke="var(--color-value)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};
