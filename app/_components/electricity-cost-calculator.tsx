"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, TrendingUp, Zap } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import useSWR from "swr";

const currencies = [
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
];

// Thai electricity rates per KWh
const thaiElectricityRates = [
  { range: [0, 150], rate: 3.2484 },
  { range: [151, 400], rate: 4.2218 },
  { range: [401, Number.POSITIVE_INFINITY], rate: 4.4217 },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ElectricityCostCalculatorProps {
  powerData: { time: string; value: number }[];
}

const chartConfig = {
  cost: {
    label: "Cost",
    color: "hsl(var(--chart-1))",
  },
  power: {
    label: "Power (W)",
    color: "hsl(var(--chart-2))",
  },
  time: {
    label: "Time",
  },
} satisfies ChartConfig;

export function ElectricityCostCalculator({
  powerData,
}: ElectricityCostCalculatorProps) {
  const [currency, setCurrency] = useState(currencies[0]);

  const { data: exchangeRates } = useSWR(
    "https://api.exchangerate-api.com/v4/latest/THB",
    fetcher,
    {
      refreshInterval: 3600000, // Refresh every hour
      fallbackData: { rates: { THB: 1, USD: 0.03, EUR: 0.025 } },
    }
  );

  // Calculate energy (kWh) from power data
  const calculateEnergy = useCallback(
    (powerValue: number, hours: number): number => {
      return (powerValue * hours) / 1000; // Convert W to kWh
    },
    []
  );

  // Calculate cost based on cumulative KWh usage
  const calculateCost = useCallback(
    (kWh: number): number => {
      let totalCost = 0;
      let remainingUsage = kWh;

      for (const { range, rate } of thaiElectricityRates) {
        const [min, max] = range;
        const usageInRange = Math.min(Math.max(remainingUsage, 0), max - min);
        totalCost += usageInRange * rate;
        remainingUsage -= usageInRange;
        if (remainingUsage <= 0) break;
      }

      return totalCost * (exchangeRates?.rates[currency.code] || 1);
    },
    [exchangeRates, currency]
  );

  const costData = useMemo(() => {
    let cumulativeEnergy = 0;
    let lastTimestamp: Date | null = null;

    return powerData.map((entry) => {
      const currentTimestamp = new Date(entry.time);

      // Calculate hours since last reading
      const hours = lastTimestamp
        ? (currentTimestamp.getTime() - lastTimestamp.getTime()) /
          (1000 * 60 * 60)
        : 0;

      // Calculate energy for this period
      const energyValue = calculateEnergy(entry.value, hours || 1); // Use 1 hour if it's the first reading
      cumulativeEnergy += energyValue;

      lastTimestamp = currentTimestamp;

      return {
        time: currentTimestamp.toLocaleString(),
        power: entry.value,
        energy: energyValue,
        cumulativeEnergy,
        cost: calculateCost(cumulativeEnergy),
      };
    });
  }, [powerData, calculateEnergy, calculateCost]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total energy and cost
  const totalEnergy = costData.reduce((sum, entry) => sum + entry.energy, 0);
  const totalCost = calculateCost(totalEnergy);

  // Calculate average consumption and cost per hour
  const averageEnergy = totalEnergy / (costData.length || 1);
  const averageCost = calculateCost(averageEnergy);

  // Predict next hour based on recent power consumption
  const recentAveragePower =
    powerData.slice(-5).reduce((sum, entry) => sum + entry.value, 0) / 5;
  const predictedEnergy = calculateEnergy(recentAveragePower, 1); // 1 hour prediction
  const predictedCost = calculateCost(predictedEnergy);

  const costItems = [
    { label: "Total Cost", value: totalCost, icon: DollarSign },
    { label: "Average Hourly Cost", value: averageCost, icon: TrendingUp },
    { label: "Predicted Next Hour", value: predictedCost, icon: Zap },
  ];

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Electricity Cost Calculator</h2>
          <Select
            value={currency.code}
            onValueChange={(value) =>
              setCurrency(
                currencies.find((c) => c.code === value) || currencies[0]
              )
            }
          >
            <SelectTrigger className="w-[180px] border-none">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {costItems.map((item, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/80">
              <Label className="text-xs opacity-55 uppercase tracking-wide mb-2 block">
                {item.label}
              </Label>
              <div className="text-3xl font-bold flex items-center">
                <item.icon className="mr-2 h-8 w-8" />
                {formatCurrency(item.value || 0)}
              </div>
            </div>
          ))}
        </div>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart data={costData}>
              <defs>
                <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-cost)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-cost)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillPower" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-power)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-power)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis yAxisId="cost" dataKey="cost" />
              <YAxis yAxisId="power" dataKey="power" orientation="right" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === "cost") return formatCurrency(Number(value));
                      if (name === "power") return `${value}W`;
                      return value;
                    }}
                  />
                }
              />
              <Area
                yAxisId="cost"
                dataKey="cost"
                type="monotone"
                fill="url(#fillCost)"
                stroke="var(--color-cost)"
                strokeWidth={2}
              />
              <Area
                yAxisId="power"
                dataKey="power"
                type="monotone"
                fill="url(#fillPower)"
                stroke="var(--color-power)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
