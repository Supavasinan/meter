"use client";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";
import { LucideProps } from "lucide-react";
import React, { ForwardRefExoticComponent, RefAttributes } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type Props = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  value: number;
  unit: string;
  children?: React.ReactNode;
};



const chartData = [{ date: "2024-04-01", value: 222 }];
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const PowerCard = ({
  icon: Icon,
  label,
  value,
  unit,
  children,
}: Props) => {
  return (
    <div className=" border p-4 rounded-xl">
      <span className="uppercase opacity-55 text-sm">{label}</span>
      <div className="flex justify-between items-center mt-2">
        <p className="font-semibold text-lg">
          {value} <span className="uppercase">{unit}</span>
        </p>
        <div className="border w-fit border-primary rounded-xl p-2 bg-primary/10">
          <Icon className="size-6" />
        </div>
      </div>
      {/* {children} */}
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[80px] w-full mt-4"
      >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-desktop)"
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
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="value"
            type="natural"
            fill="url(#fillMobile)"
            stroke="var(--color-mobile)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};
