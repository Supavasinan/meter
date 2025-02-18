"use client"

import { Card, CardContent } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, Zap } from "lucide-react"
import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import useSWR from "swr"

const currencies = [
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
]

const thaiElectricityRates = [
  { range: [0, 150], rate: 3.2484 },
  { range: [151, 400], rate: 4.2218 },
  { range: [401, Number.POSITIVE_INFINITY], rate: 4.4217 },
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ElectricityCostCalculatorProps {
  energyData: { time: string; value: number }[]
}

const chartConfig = {
  cost: {
    label: "Cost",
    color: "hsl(var(--chart-1))",
  },
  usage: {
    label: "Usage",
    color: "hsl(var(--chart-2))",
  },
  time: {
    label: "Time",
  },
} satisfies ChartConfig

export function ElectricityCostCalculator({ energyData }: ElectricityCostCalculatorProps) {
  const [currency, setCurrency] = useState(currencies[0])
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)

  const { data: exchangeRates } = useSWR("https://api.exchangerate-api.com/v4/latest/THB", fetcher, {
    refreshInterval: 3600000, // Refresh every hour
    fallbackData: { rates: { THB: 1, USD: 0.03, EUR: 0.025 } },
  })

  const calculateCost = (usage: number): number => {
    let totalCost = 0
    let remainingUsage = usage

    for (const { range, rate } of thaiElectricityRates) {
      const [min, max] = range
      const usageInRange = Math.min(Math.max(remainingUsage, 0), max - min)
      totalCost += usageInRange * rate
      remainingUsage -= usageInRange
      if (remainingUsage <= 0) break
    }

    return totalCost * (exchangeRates?.rates[currency.code] || 1)
  }

  const costData = useMemo(() => {
    return energyData.map((entry) => ({
      time: new Date(entry.time).toLocaleString(),
      cost: calculateCost(entry.value),
      usage: entry.value,
    }))
  }, [energyData, exchangeRates, currency]) //Corrected dependencies for useMemo

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const totalCost = costData.reduce((sum, entry) => sum + entry.cost, 0)
  const averageCost = totalCost / costData.length
  const predictedCost = calculateCost(energyData.slice(-5).reduce((sum, entry) => sum + entry.value, 0) / 5)

  const costItems = [
    { label: "Total Cost", value: totalCost, icon: DollarSign },
    { label: "Average Cost", value: averageCost, icon: TrendingUp },
    { label: "Predicted Next", value: predictedCost, icon: Zap },
  ]

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Electricity Cost Calculator</h2>
          <Select
            value={currency.code}
            onValueChange={(value) => setCurrency(currencies.find((c) => c.code === value) || currencies[0])}
          >
            <SelectTrigger className="w-[180px] border-none">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c, index) => (
                <SelectItem key={index} value={c.code}>
                  {c.name} ({c.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {costItems.map((item, index) => (
            <div key={index} className="p-4 rounded-lg">
              <Label className="text-xs uppercase tracking-wide mb-2 block">{item.label}</Label>
              <div className="text-3xl font-bold flex items-center">
                <item.icon className="mr-2 h-8 w-8" />
                {formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart data={costData}>
              <defs>
                <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-cost)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-cost)" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis dataKey="cost" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="cost" type="natural" fill="url(#fillCost)" stroke="var(--color-cost)" stackId="a" />
              <Area dataKey="usage" type="natural" fill="url(#fillUsage)" stroke="var(--color-usage)" stackId="b" />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

